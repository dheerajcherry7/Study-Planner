STUDY PLANNER — SETUP GUIDE

FILES
- index.html: app structure
- app.css: all styling
- app.js: app logic and interactions
- config.js: public Google OAuth web client ID
- assets/: WebP logo, PWA icons and textured background
- terms.html / privacy.html / 404.html / error.html / loading.html / under-construction.html / login.html / logout.html: supporting pages
- manifest.webmanifest / sw.js: install and offline support

HOSTING
1. Upload the complete folder to a static HTTPS host (Cloudflare Pages, Netlify, GitHub Pages).
2. Do not upload only index.html; keep the assets folder and all support files.
3. Configure your host's 404 page to use /404.html.

GOOGLE SIGN-IN AND DRIVE FILES
1. Create a project at https://console.cloud.google.com/.
2. Enable Google Drive API.
3. Configure Google Auth Platform / OAuth consent screen.
4. Create an OAuth Client ID of type Web application. Add your hosted origin under Authorized JavaScript origins.
5. Add these scopes when requested: openid, email, https://www.googleapis.com/auth/userinfo.email, https://www.googleapis.com/auth/drive.appdata, https://www.googleapis.com/auth/drive.file
6. Paste the OAuth Client ID into config.js (STUDYPLANNER_GOOGLE_CLIENT_ID) and redeploy. Never put a client secret in this static website.

LOGIN PERSISTENCE
The app remembers the signed-in app preference across tab closures using browser storage. Google OAuth access tokens are short-lived; Google may ask the user to grant/sign in again after expiry or when its session requires it. A static browser app cannot guarantee an indefinite Google login session. Use Log out in Settings to clear the local sign-in preference.

DRIVE FILES
My Files lets the signed-in user create folders and upload files to Google Drive. The built-in preview uses Google Drive's embedded preview, so Office and some specialist formats depend on Drive's preview support and account access. The website does not launch other installed apps.

IMPORTANT LIMITATIONS
- The existing app-blocker bridge and its settings were retained unchanged. A working native Android blocker still requires a native Android wrapper and permissions; a website alone cannot block other apps.
- Browser notifications are not guaranteed when the browser/app is fully closed.
- Local planner data remains in browser localStorage. Export backups regularly.
- Google Drive API access and preview availability depend on your OAuth configuration and Google's current policies.
- Review and customize Terms and Privacy text/contact details before public release.

TROUBLESHOOTING GOOGLE SIGN-IN
- Authorized JavaScript origins must exactly match the address in the browser bar (https, no trailing slash, e.g. https://yourapp.netlify.app). Changes can take a few minutes to apply.
- If the OAuth consent screen is in Testing mode, add your Google account under Test users, or publish the app to Production.
- Allow popups for the site. Hosting must not send a Cross-Origin-Opener-Policy: same-origin header.
- After updating config.js on a site that was already visited, reload once (or unregister the old service worker in DevTools > Application). Service worker v4 fetches config.js fresh each time.
- Set STUDYPLANNER_CONTACT_EMAIL in config.js so the Privacy Policy shows a contact address.
- For iOS home-screen icons, add a PNG apple-touch-icon (iOS ignores WebP).

GEMINI PANEL (v1.0.11)
- Tap "Gemini" at the top right of any screen. Gemini opens on the right and the planner stays on the left (full screen on phones).
- The panel shows the Google account signed in to Study Planner and has an "Open full Gemini" link that opens gemini.google.com with that same account.
- Chat uses the Gemini API. Put a key in config.js (STUDYPLANNER_GEMINI_API_KEY) or let each user paste their own key in the panel (stored only in their browser). Create keys at https://aistudio.google.com/apikey and restrict a shared key to your site address (HTTP referrers).
- The paperclip attaches files from My Files (Google Drive) or from the device. Supported: PDF, images, text, audio, video; Google Docs/Sheets/Slides are converted automatically. Limit about 15 MB per file.
- gemini.google.com itself cannot be embedded in another website, which is why the panel talks to the Gemini API directly.

START-UP ORDER
Splash -> "What should we call you?" (only until a name is saved) -> Google sign-in page.

BUILT-IN GEMINI (no API key for users) — Vercel
1. Vercel project > Settings > Environment Variables, add:
   GEMINI_API_KEY   = key from https://aistudio.google.com/apikey (stays on the server, never sent to browsers)
   GOOGLE_CLIENT_ID = same Web client ID as in config.js (recommended: rejects tokens from other apps)
   Optional: GEMINI_LIMIT_10MIN (default 20), GEMINI_LIMIT_DAY (default 150), GEMINI_MODEL
2. Redeploy. Signed-in users can now chat with Gemini; files are limited to about 3 MB (Vercel's 4.5 MB request limit).
3. Users can still add their own key under the gear icon for bigger files and their own quota.
All users share your key's free quota. If the app becomes popular, enable billing for the key or lower the limits.
