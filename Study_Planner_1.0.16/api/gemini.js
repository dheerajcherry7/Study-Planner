// Vercel serverless function: lets signed-in Study Planner users chat with Gemini
// without ever seeing or entering an API key. The key lives only in Vercel environment variables.
//
// Required environment variable:  GEMINI_API_KEY   (create at https://aistudio.google.com/apikey)
// Recommended:                    GOOGLE_CLIENT_ID (same value as in config.js; rejects tokens made for other apps)
// Optional:                       GEMINI_MODEL, GEMINI_LIMIT_10MIN (default 20), GEMINI_LIMIT_DAY (default 150)

const API = 'https://generativelanguage.googleapis.com/v1beta';
const hits = new Map(); // email -> timestamps (best effort; resets when the function instance restarts)
let modelCache = { list: null, at: 0 };

const fail = (res, status, message, code) => res.status(status).json({ error: { message, status: code || 'ERROR' } });

const tokCache = new Map(); // token -> {id, exp}: skips a Google round trip on every message
async function whoIs(token) {
  const c = tokCache.get(token);
  if (c && c.exp > Date.now()) return c.id;
  try {
    const r = await fetch('https://oauth2.googleapis.com/tokeninfo?access_token=' + encodeURIComponent(token));
    if (!r.ok) return null;
    const j = await r.json();
    const want = process.env.GOOGLE_CLIENT_ID;
    if (want && j.aud !== want && j.azp !== want) return null;
    const id = j.email || j.sub || null;
    if (id) { if (tokCache.size > 2000) tokCache.clear(); tokCache.set(token, { id, exp: Date.now() + 3e5 }); }
    return id;
  } catch (e) { return null; }
}

function limited(id) {
  const now = Date.now(), L10 = Number(process.env.GEMINI_LIMIT_10MIN || 20), LD = Number(process.env.GEMINI_LIMIT_DAY || 150);
  const list = (hits.get(id) || []).filter(t => now - t < 864e5);
  const recent = list.filter(t => now - t < 6e5).length;
  if (recent >= L10) return 'You are sending messages very quickly. Please wait a few minutes and try again.';
  if (list.length >= LD) return 'You have reached today\'s free Gemini limit. It resets tomorrow.';
  list.push(now); hits.set(id, list);
  if (hits.size > 5000) hits.clear();
  return '';
}

const ver = n => { const m = /gemini-(\d+(?:\.\d+)?)/.exec(n); return m ? parseFloat(m[1]) : 0; };
async function models(key) {
  if (modelCache.list && Date.now() - modelCache.at < 36e5) return modelCache.list;
  let found = [];
  try {
    const r = await fetch(API + '/models?pageSize=200', { headers: { 'x-goog-api-key': key } });
    if (r.ok) {
      const j = await r.json();
      const rank = n => ver(n) * 10 + (/flash/.test(n) ? 5 : 0) + (/preview|exp/.test(n) ? -3 : 0) + (/latest/.test(n) ? -1 : 0);
      const all = (j.models || [])
        .filter(m => (m.supportedGenerationMethods || []).includes('generateContent'))
        .map(m => m.name.replace(/^models\//, ''))
        .filter(n => /^gemini-/.test(n) && !/(lite|image|tts|live|audio|embed|thinking|robotics|computer|learnlm|vision)/i.test(n))
        ;
      const fl = all.filter(n => /flash/.test(n));
      found = (fl.length ? fl : all).sort((a, b) => rank(b) - rank(a)).slice(0, 4);
    }
  } catch (e) {}
  const list = [...new Set([process.env.GEMINI_MODEL, ...found, 'gemini-flash-latest', 'gemini-2.5-flash'].filter(Boolean))];
  modelCache = { list, at: Date.now() };
  return list;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return fail(res, 405, 'Use POST.', 'METHOD_NOT_ALLOWED');
  const key = process.env.GEMINI_API_KEY;
  if (!key) return fail(res, 503, 'Built-in Gemini is not switched on for this site yet (the owner needs to add GEMINI_API_KEY in Vercel).', 'NOT_CONFIGURED');

  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return fail(res, 401, 'Sign in with Google to use Gemini.', 'UNAUTHENTICATED');
  const id = await whoIs(token);
  if (!id) return fail(res, 401, 'Your Google sign-in has expired. Sign in again and retry.', 'UNAUTHENTICATED');
  const lim = limited(id);
  if (lim) return fail(res, 429, lim, 'RATE_LIMITED');

  const b = req.body && typeof req.body === 'object' ? req.body : {};
  if (!Array.isArray(b.contents) || !b.contents.length) return fail(res, 400, 'Nothing to send.', 'BAD_REQUEST');
  const mk = think => JSON.stringify({
    systemInstruction: b.systemInstruction, contents: b.contents,
    ...(think ? { generationConfig: { thinkingConfig: { thinkingBudget: 0 } } } : {})
  });

  let last = 'No model was available.', lastStatus = 503;
  for (const m of await models(key)) {
    let think = true;
    for (let attempt = 0; attempt < 3; attempt++) {
      let r;
      const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 25000);
      try {
        r = await fetch(`${API}/models/${encodeURIComponent(m)}:streamGenerateContent?alt=sse`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body: mk(think), signal: ctl.signal
        });
      } catch (e) { clearTimeout(to); last = m + ' did not answer in time.'; break; }
      clearTimeout(to);
      if (r.ok) {
        // Pass Google's stream straight through so the first words appear immediately.
        res.status(200);
        res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
        res.setHeader('X-Accel-Buffering', 'no');
        try { for await (const chunk of r.body) res.write(chunk); } catch (e) {}
        return res.end();
      }
      const j = await r.json().catch(() => ({}));
      last = (j.error && j.error.message) || 'HTTP ' + r.status; lastStatus = r.status;
      if (r.status === 400 && think && /thinking/i.test(last)) { think = false; continue; }
      if ([500, 502, 503, 504].includes(r.status) && attempt === 0) { await new Promise(z => setTimeout(z, 1200)); continue; }
      if (r.status === 404 || r.status === 429 || r.status >= 500 || /not found|no longer available|overloaded/i.test(last)) break;
      return res.status(r.status).json(j); // 400 etc.: pass Google's message through
    }
  }
  return fail(res, lastStatus === 429 ? 429 : 503, 'The assistant is busy or its free quota is used up right now. ' + last, 'UNAVAILABLE');
};
