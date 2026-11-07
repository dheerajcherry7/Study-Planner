(()=>{'use strict';
/* ---------- helpers ---------- */
const LS='dayplanner.v1', SEEN='dayplanner.seen';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const uid=()=>Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-4);
const pad=n=>String(n).padStart(2,'0');
const dStr=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const today=()=>dStr(new Date());
const parseD=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const addDays=(s,n)=>{const d=parseD(s);d.setDate(d.getDate()+n);return dStr(d)};
const atTs=(date,time)=>{const [y,m,d]=date.split('-').map(Number);const [h,mi]=(time||'00:00').split(':').map(Number);return new Date(y,m-1,d,h,mi).getTime()};
const hhmm=ts=>{const d=new Date(ts);return pad(d.getHours())+':'+pad(d.getMinutes())};
const fT=t=>t?new Date(2000,0,1,...t.split(':').map(Number)).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}):'';
const fD=s=>parseD(s).toLocaleDateString([],{weekday:'short',day:'numeric',month:'short'});
const dow=s=>parseD(s).getDay();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mondayOf=s=>{const d=parseD(s);const k=(d.getDay()+6)%7;d.setDate(d.getDate()-k);return dStr(d)};
const dur=sec=>{sec=Math.round(sec);if(sec<30)return sec>0?'<1m':'0m';const m=Math.round(sec/60);return m>=60?`${Math.floor(m/60)}h ${pad(m%60)}m`:`${m}m`};
const clock=ms=>{const s=Math.max(0,Math.ceil(ms/1000));const h=Math.floor(s/3600),m=Math.floor(s%3600/60);return (h?h+':'+pad(m):pad(m))+':'+pad(s%60)};
const minTxt=m=>m>=1440?`${m/1440} day`:m>=60?`${m/60} hour`:`${m} min`;
const DOWN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const WK=[1,2,3,4,5,6,0];
const ICONS={home:'M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z',tasks:'M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9',calendar:'M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 10h18M8 2v4M16 2v4',focus:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',more:'M5 12h.01M12 12h.01M19 12h.01',clock:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',book:'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5',habit:'M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4-1-6 1-10z',note:'M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8M8 17h5',bell:'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0',chart:'M3 3v18h18M7 15l4-4 3 3 5-6',sliders:'M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M14 4v4M8 10v4M16 16v4',plus:'M12 5v14M5 12h14',x:'M18 6L6 18M6 6l12 12',pause:'M8 5v14M16 5v14',play:'M6 4l14 8-14 8z',trash:'M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14',edit:'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',l:'M15 18l-6-6 6-6',r:'M9 18l6-6-6-6',check:'M4 12l5 5L20 6',pin:'M12 17v5M9 3h6l-1 7 3 3H7l3-3z',skip:'M5 4l10 8-10 8zM19 5v14',spark:'M12 2c.5 5 3 8.5 10 10-7 1.5-9.5 5-10 10-.5-5-3-8.5-10-10 7-1.5 9.5-5 10-10z',clip:'M21 11l-9 9a5 5 0 0 1-7-7l9-9a3.5 3.5 0 0 1 5 5l-9 9a2 2 0 0 1-3-3l8-8',send:'M22 2L11 13M22 2l-7 20-4-9-9-4z',folder:'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',refresh:'M21 12a9 9 0 1 1-3-6.7M21 3v6h-6',mic:'M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zM19 11a7 7 0 0 1-14 0M12 18v4M8 22h8',speaker:'M11 5L6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14',speakerOff:'M11 5L6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6',wave:'M3 12h2M8 8v8M13 4v16M18 8v8M22 12h-1'};
const ic=(n,s=20,w=2)=>`<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICONS[n]}"/></svg>`;

/* ---------- state ---------- */
const DEF_CATS=[['College','#3B6FD4'],['Study','#0B7A85'],['Personal','#9B5DE5'],['Projects','#D9822B'],['Health','#3E9B62'],['Other','#6B7C93']];
const SUBJ_COL=['#3B6FD4','#0B7A85','#9B5DE5','#D9822B','#3E9B62','#C5352B','#6B7C93'];
const KINDS=['Assignment','Practical','Revision','Test','Project'];
const APPS=['Instagram','YouTube','Snapchat','X (Twitter)','Reddit','Facebook','Netflix','Telegram','WhatsApp','Games'];
const ALLOWED_DEF=['Phone','Messages','Emergency calls','Clock & alarms'];
const AIN=()=>String(window.STUDYPLANNER_AI_NAME||'Buddy').trim()||'Buddy';
const G={open:false,msgs:[],att:[],busy:false,err:'',gp:{folder:'',stack:[],items:[],loading:false}};
let S, storageOk=true, ui={route:'today',tf:{status:'pending',cat:'all',sort:'due',q:''},calView:'month',calDate:'',calAnchor:'',tt:'',remTab:'up',nq:'',fs:{},hist:{date:'',subject:''},habSel:'all',subjOpen:'',noteQ:'',logTab:'up'};
function defaults(){return{v:1,modified:0,seeded:false,settings:{name:'',theme:'system',remindDefault:10,nagMin:30,sound:true,pri:{high:'High',med:'Medium',low:'Low'},goalMin:240,focusMin:25,shortMin:5,longMin:15,every:4,warnMin:1,strict:false,autoBreak:true,block:{on:false,apps:['Instagram','YouTube'],allowed:[...ALLOWED_DEF],mode:'session',from:'18:00',to:'22:00'}},cats:DEF_CATS.map(([name,color])=>({id:name.toLowerCase(),name,color})),subjects:[],exams:[],tasks:[],completions:[],blocks:[],plans:[],habits:[],notes:[],reminders:[],sessions:[],breaks:[],fired:{},log:[],timer:null,pomo:{cycle:1,date:''}}}
function load(){try{const r=localStorage.getItem(LS);if(r)return JSON.parse(r)}catch(e){storageOk=false}return null}
function save(quiet){try{if(!quiet)S.modified=Date.now();localStorage.setItem(LS,JSON.stringify(S));storageOk=true}catch(e){storageOk=false}if(!quiet&&typeof Sync!=='undefined')Sync.queue()}
function merge(base,src){for(const k in src){if(src[k]&&typeof src[k]==='object'&&!Array.isArray(src[k])&&base[k]&&typeof base[k]==='object'&&!Array.isArray(base[k]))merge(base[k],src[k]);else base[k]=src[k]}return base}
function seed(){
 const t0=today(),n=Date.now();
 S.subjects=[{id:'s_phy',name:'Physics',color:SUBJ_COL[0],example:true},{id:'s_mat',name:'Mathematics',color:SUBJ_COL[1],example:true},{id:'s_prg',name:'Programming',color:SUBJ_COL[2],example:true}];
 S.exams=[{id:uid(),subject:'s_phy',title:'Mid-semester exam',date:addDays(t0,19),time:'09:00',example:true}];
 const mk=o=>({id:uid(),title:'',desc:'',date:t0,time:'',pri:'med',cat:'study',subject:'',kind:'',repeat:{type:'none',days:[]},rem:[],nag:true,subs:[],done:false,created:n,example:true,...o});
 S.tasks=[mk({title:'Physics problem set',time:'20:30',pri:'high',subject:'s_phy',kind:'Assignment',rem:[30],subs:[{id:uid(),t:'Interference questions',d:false},{id:uid(),t:'Polarization questions',d:false}]}),
  mk({title:'Revise calculus notes',date:addDays(t0,1),time:'18:00',subject:'s_mat',kind:'Revision',rem:[15]}),
  mk({title:'Finish coding lab',date:addDays(t0,3),pri:'high',cat:'college',subject:'s_prg',kind:'Practical'}),
  mk({title:'Evening walk',time:'19:00',pri:'low',cat:'health',repeat:{type:'daily',days:[]}})];
 S.blocks=[{id:uid(),title:'Physics lecture',date:t0,start:'09:00',end:'10:00',notes:'',repeat:[1,3,5],rem:[10],doneDates:{},example:true},
  {id:uid(),title:'Self study',date:t0,start:'18:30',end:'20:00',notes:'',repeat:[0,1,2,3,4,5,6],rem:[10],doneDates:{},example:true},
  {id:uid(),title:'Dinner',date:t0,start:'20:00',end:'20:45',notes:'',repeat:[0,1,2,3,4,5,6],rem:[],doneDates:{},example:true}];
 const lg=(k)=>{const o={};for(let i=1;i<=60;i++){if(((i*7+k*3)%5)<3)o[addDays(t0,-i)]=true}return o};
 S.habits=[{id:uid(),name:'Revise class notes',log:lg(1),example:true},{id:uid(),name:'Drink 8 glasses of water',log:lg(2),example:true},{id:uid(),name:'Sleep by 11 pm',log:lg(3),example:true}];
 S.notes=[{id:uid(),title:'Ideas',body:'Try a small project for the coding club',kind:'text',pinned:true,created:n,example:true},{id:uid(),title:'Before exams',body:'[ ] Collect previous year papers\n[ ] Make formula sheet',kind:'list',pinned:false,created:n,example:true}];
 S.seeded=true;
}

/* ---------- ui primitives ---------- */
let sheetEl=null,ctx=null,confEl=null;
function openSheet(title,html,mount){if(sheetEl){sheetEl.remove();sheetEl=null}const w=document.createElement('div');w.className='sheet-wrap';w.innerHTML=`<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="sheet-h"><h2>${esc(title)}</h2><button class="iconbtn" data-act="closeSheet" aria-label="Close">${ic('x')}</button></div><div>${html}</div></div>`;w.addEventListener('click',e=>{if(e.target===w)closeSheet()});document.body.appendChild(w);sheetEl=w;mount&&mount(w)}
function closeSheet(){if(sheetEl){sheetEl.remove();sheetEl=null}ctx=null}
function confirmBox(msg,okLabel,fn,delay=0,danger=true){closeConfirm();const w=document.createElement('div');w.className='sheet-wrap top';w.innerHTML=`<div class="sheet" role="alertdialog"><p style="margin:0 0 14px;font-weight:600">${msg}</p><div class="btns"><button class="btn" data-act="closeConf">Cancel</button><button class="btn ${danger?'danger':'primary'}" id="confOk" ${delay?'disabled':''}>${esc(okLabel)}${delay?` (${delay})`:''}</button></div></div>`;document.body.appendChild(w);confEl=w;const ok=$('#confOk',w);ok.onclick=()=>{closeConfirm();fn()};if(delay){let n=delay;const iv=setInterval(()=>{n--;if(!confEl||confEl!==w){clearInterval(iv);return}if(n<=0){clearInterval(iv);ok.disabled=false;ok.textContent=okLabel}else ok.textContent=`${okLabel} (${n})`},1000)}}
function closeConfirm(){if(confEl){confEl.remove();confEl=null}}
function toast(msg,actions=[],ms=3500){const t=document.createElement('div');t.className='toast';t.innerHTML=`<span class="grow">${esc(msg)}</span>`;actions.forEach(([l,f])=>{const b=document.createElement('button');b.textContent=l;b.onclick=()=>{t.remove();f()};t.appendChild(b)});$('#toasts').appendChild(t);setTimeout(()=>t.remove(),ms)}
const seg=(name,opts,val,multi)=>`<div class="seg" data-seg="${name}"${multi?' data-multi="1"':''}>${opts.map(([v,l])=>{const on=multi?(val||[]).map(String).includes(String(v)):String(val)===String(v);return `<button type="button" class="chip${on?' on':''}" data-act="seg" data-v="${esc(v)}">${esc(l)}</button>`}).join('')}</div>`;
const segVal=n=>$(`[data-seg="${n}"] .on`,sheetEl)?.dataset.v;
const multiVals=n=>$$(`[data-seg="${n}"] .on`,sheetEl).map(e=>e.dataset.v);
const F=n=>$(`[data-f="${n}"]`,sheetEl);
const fld=(l,inner)=>`<div class="fld"><span>${l}</span>${inner}</div>`;
const sw=(on,act,extra='')=>`<button class="switch${on?' on':''}" role="switch" aria-checked="${!!on}" data-act="${act}" ${extra}></button>`;
const opts=(arr,sel)=>arr.map(([v,l])=>`<option value="${esc(v)}"${String(v)===String(sel)?' selected':''}>${esc(l)}</option>`).join('');
const catOf=id=>S.cats.find(c=>c.id===id)||S.cats[S.cats.length-1];
const subjOf=id=>S.subjects.find(s=>s.id===id);
const priLabel=p=>S.settings.pri[p]||p;
const priCls=p=>({high:'hi',med:'md',low:'lo'}[p]);
const priOpts=()=>[['high',priLabel('high')],['med',priLabel('med')],['low',priLabel('low')]];

/* ---------- tasks ---------- */
const dueTs=t=>t.date?atTs(t.date,t.time||'23:59'):null;
const isOverdue=t=>!t.done&&t.date&&dueTs(t)<Date.now();
function stepDate(t,d){const r=t.repeat;if(r.type==='weekly')return addDays(d,7);if(r.type==='monthly'){const x=parseD(d),day=x.getDate();x.setDate(1);x.setMonth(x.getMonth()+1);const dim=new Date(x.getFullYear(),x.getMonth()+1,0).getDate();x.setDate(Math.min(day,dim));return dStr(x)}return addDays(d,1)}
function nextDate(t){const ref=t.date>today()?t.date:today();let d=t.date||today(),g=0;do{d=stepDate(t,d);g++}while((d<=ref||(t.repeat.type==='custom'&&!t.repeat.days.includes(String(dow(d)))&&!t.repeat.days.includes(dow(d))))&&g<800);return d}
function toggleTask(id,undo){const t=S.tasks.find(x=>x.id===id);if(!t)return;const rec=t.repeat&&t.repeat.type!=='none';
 if(undo&&rec){const i=S.completions.map(c=>c.id===id&&c.date===today()).lastIndexOf(true);if(i>=0){const c=S.completions.splice(i,1)[0];if(c.prev)t.date=c.prev;save();render()}return}
 if(t.done){t.done=false;S.completions=S.completions.filter(c=>!(c.id===id&&c.date===today()));save();render();return}
 S.completions.push({id,date:today(),at:Date.now(),title:t.title,subject:t.subject,prev:t.date});
 if(rec){t.date=nextDate(t);t.subs.forEach(s=>s.d=false);toast(`Done. Next one is ${fD(t.date)}.`)}else{t.done=true;t.doneAt=Date.now();toast('Task completed')}
 markPast();save();render()}
function dueText(t){if(!t.date)return '';const d=t.date,t0=today();let s=d===t0?'Today':d===addDays(t0,1)?'Tomorrow':d===addDays(t0,-1)?'Yesterday':fD(d);if(t.time)s+=' '+fT(t.time);return s}
function urgency(t){if(t.done||!t.date)return '';const ms=dueTs(t)-Date.now();if(ms<0)return 'over';if(ms<864e5)return 'soon';return ''}
function taskRow(t,doneView){const c=catOf(t.cat),u=urgency(t),sj=subjOf(t.subject),sd=t.subs.filter(s=>s.d).length;const done=doneView||t.done;
 return `<div class="row ${done?'done':''} ${u?'urgent':''}"><button class="check ${done?'on':''}" data-act="toggleTask" data-id="${t.id}" ${doneView?'data-undo="1"':''} aria-label="${done?'Mark as not done':'Mark as done'}">${ic('check',16,3)}</button>
 <div class="grow tap" data-act="editTask" data-id="${t.id}"><div class="t">${esc(t.title)}</div><div class="m"><span class="pill ${priCls(t.pri)}">${esc(priLabel(t.pri))}</span><span><i class="dot" style="background:${c.color}"></i>${esc(c.name)}</span>${t.date?`<span class="${u==='over'?'warn':u==='soon'?'amber':''}">${u==='over'?'Overdue · ':u==='soon'?'Due soon · ':''}${esc(dueText(t))}</span>`:''}${sj?`<span>${esc(sj.name)}</span>`:''}${t.kind?`<span>${esc(t.kind)}</span>`:''}${t.subs.length?`<span>${sd}/${t.subs.length} steps</span>`:''}${t.repeat?.type&&t.repeat.type!=='none'?`<span>Repeats ${esc(t.repeat.type)}</span>`:''}${t.rem?.length?`<span>${ic('bell',12)}</span>`:''}</div></div>
 ${!done?`<button class="iconbtn" data-act="postpone" data-id="${t.id}" aria-label="Postpone">${ic('clock',18)}</button>`:''}</div>`}
const REM_OPTS=[[0,'At due time'],[5,'5 min'],[10,'10 min'],[15,'15 min'],[30,'30 min'],[60,'1 hour'],[1440,'1 day']];
function openTask(id,preset){
 const t=id?S.tasks.find(x=>x.id===id):null;
 const v=t||{title:'',desc:'',date:today(),time:'',pri:'med',cat:S.cats.find(c=>c.id==='study')?.id||S.cats[0].id,subject:'',kind:'',repeat:{type:'none',days:[]},rem:[],nag:true,subs:[],...preset};
 ctx={subs:v.subs.map(s=>({...s})),id};
 openSheet(t?'Edit task':'New task',`
 ${fld('Title',`<input class="in" data-f="title" value="${esc(v.title)}" maxlength="140" placeholder="What needs doing?">`)}
 ${fld('Description',`<textarea class="in" data-f="desc" placeholder="Optional details">${esc(v.desc)}</textarea>`)}
 <div class="two">${fld('Due date',`<input class="in" type="date" data-f="date" value="${esc(v.date)}">`)}${fld('Due time',`<input class="in" type="time" data-f="time" value="${esc(v.time)}">`)}</div>
 ${fld('Priority',seg('pri',priOpts(),v.pri))}
 <div class="two">${fld('Category',`<select class="in" data-f="cat">${opts(S.cats.map(c=>[c.id,c.name]),v.cat)}</select>`)}${fld('Subject',`<select class="in" data-f="subject">${opts([['','None'],...S.subjects.map(s=>[s.id,s.name])],v.subject)}</select>`)}</div>
 ${fld('Type',`<select class="in" data-f="kind">${opts([['','General'],...KINDS.map(k=>[k,k])],v.kind)}</select>`)}
 ${fld('Repeat',seg('rep',[['none','Never'],['daily','Daily'],['weekly','Weekly'],['monthly','Monthly'],['custom','Custom days']],v.repeat.type))}
 <div id="repDays" ${v.repeat.type==='custom'?'':'hidden'}>${fld('On these days',seg('repdays',WK.map(d=>[d,DOWN[d]]),v.repeat.days,true))}</div>
 ${fld('Remind me (needs a due date; without a time it uses 9:00 am)',seg('rem',REM_OPTS,v.rem,true))}
 <div class="row" style="padding:4px 0;border:0"><div class="grow">Remind again if not done</div>${sw(v.nag!==false,'togNag','id="nagSw"')}</div>
 ${fld('Subtasks',`<div id="subs"></div><div class="two" style="grid-template-columns:1fr auto"><input class="in" data-f="newsub" placeholder="Add a step" maxlength="120"><button class="btn" data-act="addSub">Add</button></div>`)}
 <div class="err" id="err"></div>
 <div class="btns"><button class="btn primary grow" data-act="saveTask">${t?'Save changes':'Add task'}</button>${t?`<button class="btn" data-act="postpone" data-id="${t.id}">Postpone</button><button class="btn danger" data-act="delTask" data-id="${t.id}">${ic('trash',18)}</button>`:''}</div>`,w=>{
  drawSubs();w.addEventListener('segchange',e=>{if(e.detail==='rep')$('#repDays',w).hidden=segVal('rep')!=='custom'});
  F('newsub').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();addSub()}});
  F('title').addEventListener('keydown',e=>{if(e.key==='Enter')saveTask()})})}
function drawSubs(){const el=$('#subs',sheetEl);if(!el)return;el.innerHTML=ctx.subs.map((s,i)=>`<div class="row" style="padding:6px 0"><button class="check ${s.d?'on':''}" data-act="subTog" data-i="${i}" aria-label="Toggle step">${ic('check',14,3)}</button><div class="grow ${s.d?'done':''}"><span class="t" style="font-weight:500">${esc(s.t)}</span></div><button class="iconbtn" data-act="subDel" data-i="${i}" aria-label="Remove step">${ic('x',16)}</button></div>`).join('')}
function addSub(){const i=F('newsub'),v=i.value.trim();if(!v)return;ctx.subs.push({id:uid(),t:v,d:false});i.value='';drawSubs()}
function saveTask(){const title=F('title').value.trim(),err=$('#err',sheetEl),date=F('date').value,time=F('time').value;
 const pend=F('newsub').value.trim();if(pend){ctx.subs.push({id:uid(),t:pend,d:false});F('newsub').value=''}
 const rt=segVal('rep')||'none',days=multiVals('repdays').map(Number),rem=multiVals('rem').map(Number);
 if(!title){err.textContent='Give the task a title.';return}
 if(date&&isNaN(parseD(date).getTime())){err.textContent='That date is not valid.';return}
 if(rt!=='none'&&!date){err.textContent='Repeating tasks need a due date.';return}
 if(rt==='custom'&&!days.length){err.textContent='Pick at least one day for the custom repeat.';return}
 if(rem.length&&!date){err.textContent='Reminders need a due date.';return}
 const o={title,desc:F('desc').value.trim(),date,time,pri:segVal('pri')||'med',cat:F('cat').value,subject:F('subject').value,kind:F('kind').value,repeat:{type:rt,days},rem,nag:$('#nagSw',sheetEl).classList.contains('on'),subs:ctx.subs};
 if(ctx.id)Object.assign(S.tasks.find(x=>x.id===ctx.id),o);else S.tasks.push({id:uid(),created:Date.now(),done:false,...o});
 const was=!!ctx.id;markPast();save();closeSheet();render();toast(was?'Saved':'Task added')}
function postponeSheet(id){const t=S.tasks.find(x=>x.id===id);if(!t)return;const t0=today(),nm=addDays(t0,((8-dow(t0))%7)||7);
 const move=d=>{t.date=d;markPast();save();closeSheet();render();toast(`Moved to ${fD(d)}`)};
 window.__mv=move;
 openSheet('Postpone to…',`<div class="btns" style="flex-direction:column;align-items:stretch">
 <button class="btn" data-act="mv" data-d="${addDays(t0,1)}">Tomorrow · ${fD(addDays(t0,1))}</button>
 <button class="btn" data-act="mv" data-d="${addDays(t0,2)}">In 2 days · ${fD(addDays(t0,2))}</button>
 <button class="btn" data-act="mv" data-d="${nm}">Next Monday · ${fD(nm)}</button></div>
 ${fld('Pick a date',`<input class="in" type="date" data-f="pd" min="${t0}" value="${esc(t.date||t0)}">`)}<button class="btn primary block" data-act="mvPick">Move task</button>`)}

/* ---------- timetable blocks ---------- */
function blocksOn(d){return S.blocks.filter(b=>b.repeat?.length?(d>=b.date&&b.repeat.includes(dow(d))):b.date===d).map(b=>({...b,date:d,done:!!b.doneDates?.[d],bid:b.id})).sort((a,b)=>a.start.localeCompare(b.start))}
function overlaps(list){const o=new Set();for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++)if(list[j].start<list[i].end&&list[i].start<list[j].end){o.add(list[i].bid);o.add(list[j].bid)}return o}
function openBlock(id,date){const b=id?S.blocks.find(x=>x.id===id):null;
 const v=b||{title:'',date:date||today(),start:'09:00',end:'10:00',notes:'',repeat:[],rem:[10]};ctx={id};
 openSheet(b?'Edit activity':'New activity',`
 ${fld('Title',`<input class="in" data-f="title" value="${esc(v.title)}" maxlength="100" placeholder="Class, study, meal, exercise…">`)}
 ${fld(v.repeat.length?'Starts on':'Date',`<input class="in" type="date" data-f="date" value="${esc(v.date)}">`)}
 <div class="two">${fld('Start',`<input class="in" type="time" data-f="start" value="${esc(v.start)}">`)}${fld('End',`<input class="in" type="time" data-f="end" value="${esc(v.end)}">`)}</div>
 ${fld('Repeat on (leave empty for one day only)',seg('days',WK.map(d=>[d,DOWN[d]]),v.repeat,true))}
 ${fld('Remind me before',seg('rem',REM_OPTS.slice(0,6).map(([m,l])=>[m,m?l:'At start']),v.rem,true))}
 ${fld('Notes',`<textarea class="in" data-f="notes">${esc(v.notes)}</textarea>`)}
 <div class="err" id="err"></div>
 <div class="btns"><button class="btn primary grow" data-act="saveBlock">${b?'Save changes':'Add activity'}</button>${b?`<button class="btn danger" data-act="delBlock" data-id="${b.id}">${ic('trash',18)}</button>`:''}</div>`)}
function saveBlock(){const title=F('title').value.trim(),date=F('date').value,start=F('start').value,end=F('end').value,err=$('#err',sheetEl);
 if(!title){err.textContent='Give the activity a title.';return}if(!date){err.textContent='Pick a date.';return}
 if(!start||!end){err.textContent='Set a start and end time.';return}if(end<=start){err.textContent='The end time must be after the start time.';return}
 const o={title,date,start,end,notes:F('notes').value.trim(),repeat:multiVals('days').map(Number),rem:multiVals('rem').map(Number)};
 if(ctx.id)Object.assign(S.blocks.find(x=>x.id===ctx.id),o);else S.blocks.push({id:uid(),doneDates:{},...o});
 const clash=overlaps(blocksOn(date)).size;markPast();save();closeSheet();render();toast(clash?'Saved. This overlaps another activity.':'Saved')}

/* ---------- reminders engine ---------- */
const remOn=(r,d)=>r.repeat==='none'?r.date===d:d>=r.date&&(r.repeat==='daily'||(r.repeat==='weekly'&&dow(d)===dow(r.date))||(r.repeat==='weekdays'&&dow(d)>=1&&dow(d)<=5));
function triggersBetween(a,b){const out=[];const push=(key,ts,title,body,link,kind)=>{if(ts>=a&&ts<=b)out.push({key,ts,title,body,link,kind})};
 for(const t of S.tasks){if(t.done||!t.date||!t.rem?.length)continue;const due=atTs(t.date,t.time||'09:00'),ln={type:'task',id:t.id};
  t.rem.forEach(m=>push(`t:${t.id}:${t.date}:${m}`,due-m*6e4,t.title,m?`Due in ${minTxt(m)}`:'Due now',ln,'Task'));
  if(t.nag!==false&&S.settings.nagMin>0)push(`t:${t.id}:${t.date}:nag`,due+S.settings.nagMin*6e4,t.title,'Still not done',ln,'Task')}
 let d=addDays(dStr(new Date(a)),-1);const end=dStr(new Date(b));
 for(;d<=end;d=addDays(d,1)){
  for(const bl of blocksOn(d)){if(bl.done)continue;(bl.rem||[]).forEach(m=>push(`b:${bl.bid}:${d}:${m}`,atTs(d,bl.start)-m*6e4,bl.title,m?`Starts in ${minTxt(m)} (${fT(bl.start)})`:`Starting now (${fT(bl.start)})`,{type:'block',id:bl.bid,date:d},'Schedule'))}
  for(const r of S.reminders){if(!r.enabled||!remOn(r,d))continue;if(r.link?.type==='task'){const t=S.tasks.find(x=>x.id===r.link.id);if(!t||t.done)continue}push(`r:${r.id}:${d}`,atTs(d,r.time),r.title,r.note||'Reminder',r.link||{type:'rem',id:r.id},r.auto?'Snoozed':'Reminder')}}
 for(const e of S.exams){const sj=subjOf(e.subject)?.name||'';push(`e:${e.id}:eve`,atTs(addDays(e.date,-1),'18:00'),`${sj} ${e.title}`.trim(),'Tomorrow. Time for a last revision.',{type:'exam',id:e.id},'Exam');push(`e:${e.id}:day`,atTs(e.date,'07:30'),`${sj} ${e.title}`.trim(),`Today at ${fT(e.time||'09:00')}. Good luck.`,{type:'exam',id:e.id},'Exam')}
 return out.sort((x,y)=>x.ts-y.ts)}
function markPast(){const n=Date.now();triggersBetween(n-12*36e5,n).forEach(t=>{if(!S.fired[t.key])S.fired[t.key]=n})}
function permState(){return !('Notification' in window)?'unsupported':Notification.permission}
let swReg=null,swOk=false,installEv=null,bridgeOn=false;
function sys(title,body,tag){if(permState()!=='granted')return;try{if(swReg&&swReg.showNotification)swReg.showNotification(title,{body,tag,icon:'assets/study-planner-icon-192.webp',badge:'assets/study-planner-icon-192.webp',vibrate:[120,60,120]});else new Notification(title,{body,tag})}catch(e){}}
let actx=null;function beep(){if(!S.settings.sound)return;try{actx=actx||new(window.AudioContext||window.webkitAudioContext)();const o=actx.createOscillator(),g=actx.createGain();o.frequency.value=880;g.gain.setValueAtTime(.15,actx.currentTime);g.gain.exponentialRampToValueAtTime(.001,actx.currentTime+.5);o.connect(g);g.connect(actx.destination);o.start();o.stop(actx.currentTime+.5)}catch(e){}}
function deliver(tr,late){const e={id:uid(),key:tr.key,title:tr.title,body:tr.body,ts:Date.now(),due:tr.ts,link:tr.link,kind:tr.kind,late};S.log.unshift(e);S.log=S.log.slice(0,80);
 const acts=[['Snooze 10 min',()=>snooze(e.id,10)]];if(tr.link?.type==='task')acts.push(['Done',()=>{toggleTask(tr.link.id)}]);
 toast(`${tr.title}: ${tr.body}${late?' (late)':''}`,acts,14000);sys(tr.title,tr.body+(late?' (late)':''),tr.key);beep()}
function checkReminders(){const n=Date.now();let any=false;triggersBetween(n-12*36e5,n).forEach(t=>{if(S.fired[t.key])return;S.fired[t.key]=n;any=true;deliver(t,n-t.ts>3*6e4)});
 for(const k in S.fired)if(n-S.fired[k]>4*864e5)delete S.fired[k];if(any){save(true);if(ui.route==='reminders'||ui.route==='today')render()}}
function snooze(logId,min){const e=S.log.find(x=>x.id===logId);if(!e)return;const t=new Date(Date.now()+min*6e4);S.reminders.push({id:uid(),title:e.title,date:dStr(t),time:hhmm(t),repeat:'none',enabled:true,link:e.link?.type==='task'?e.link:null,auto:true,note:'Snoozed reminder'});e.snoozed=true;save();render();toast(`Snoozed until ${fT(hhmm(t))}`)}
function openReminder(id,preset){const r=id?S.reminders.find(x=>x.id===id):null;const nx=new Date(Date.now()+36e5);
 const v=r||{title:'',date:dStr(nx),time:pad(nx.getHours())+':00',repeat:'none',note:'',...preset};ctx={id};
 openSheet(r?'Edit reminder':'New reminder',`${fld('What should I remind you about?',`<input class="in" data-f="title" value="${esc(v.title)}" maxlength="120">`)}
 <div class="two">${fld('Date',`<input class="in" type="date" data-f="date" value="${esc(v.date)}">`)}${fld('Time',`<input class="in" type="time" data-f="time" value="${esc(v.time)}">`)}</div>
 ${fld('Repeat',seg('rep',[['none','Once'],['daily','Daily'],['weekdays','Mon to Fri'],['weekly','Weekly']],v.repeat))}
 ${fld('Note',`<input class="in" data-f="note" value="${esc(v.note||'')}" maxlength="140">`)}<div class="err" id="err"></div>
 <div class="btns"><button class="btn primary grow" data-act="saveRem">${r?'Save changes':'Add reminder'}</button>${r?`<button class="btn danger" data-act="delRem" data-id="${r.id}">${ic('trash',18)}</button>`:''}</div>`)}
function saveRem(){const title=F('title').value.trim(),date=F('date').value,time=F('time').value,rep=segVal('rep')||'none',err=$('#err',sheetEl);
 if(!title){err.textContent='Write what the reminder is for.';return}if(!date||!time){err.textContent='Pick a date and time.';return}
 if(rep==='none'&&atTs(date,time)<=Date.now()){err.textContent='That time has already passed. Pick a time in the future.';return}
 const o={title,date,time,repeat:rep,note:F('note').value.trim()};
 if(ctx.id)Object.assign(S.reminders.find(x=>x.id===ctx.id),o,{auto:false});else S.reminders.push({id:uid(),enabled:true,...o});
 markPast();save();closeSheet();render();toast('Reminder saved')}

/* ---------- study entities ---------- */
function openSubject(id){const s=id?subjOf(id):null;ctx={id};const col=s?.color||SUBJ_COL[S.subjects.length%SUBJ_COL.length];
 openSheet(s?'Edit subject':'New subject',`${fld('Name',`<input class="in" data-f="name" value="${esc(s?.name||'')}" maxlength="50">`)}${fld('Colour',seg('col',SUBJ_COL.map(c=>[c,'●']),col).replace(/class="chip/g,'class="chip').replace(/(data-v="(#[0-9A-Fa-f]+)")/g,'$1 style="color:$2"'))}<div class="err" id="err"></div>
 <div class="btns"><button class="btn primary grow" data-act="saveSubj">Save</button>${s?`<button class="btn danger" data-act="delSubj" data-id="${s.id}">${ic('trash',18)}</button>`:''}</div>`)}
function openExam(id){const e=id?S.exams.find(x=>x.id===id):null;ctx={id};
 openSheet(e?'Edit exam':'New exam',`${fld('Subject',`<select class="in" data-f="subject">${opts(S.subjects.map(s=>[s.id,s.name]),e?.subject)}</select>`)}${fld('Exam name',`<input class="in" data-f="title" value="${esc(e?.title||'')}" placeholder="Quiz, mid-sem, end-sem" maxlength="80">`)}
 <div class="two">${fld('Date',`<input class="in" type="date" data-f="date" value="${esc(e?.date||'')}">`)}${fld('Time',`<input class="in" type="time" data-f="time" value="${esc(e?.time||'09:00')}">`)}</div><div class="err" id="err"></div>
 <div class="btns"><button class="btn primary grow" data-act="saveExam">Save</button>${e?`<button class="btn danger" data-act="delExam" data-id="${e.id}">${ic('trash',18)}</button>`:''}</div>`)}
function openPlan(id,pre){const p=id?S.plans.find(x=>x.id===id):null;ctx={id};const v=p||{subject:pre?.subject||S.subjects[0]?.id||'',date:today(),min:45,note:''};
 openSheet(p?'Edit planned session':'Plan a study session',`${fld('Subject',`<select class="in" data-f="subject">${opts([['','General'],...S.subjects.map(s=>[s.id,s.name])],v.subject)}</select>`)}
 <div class="two">${fld('Date',`<input class="in" type="date" data-f="date" value="${esc(v.date)}">`)}${fld('Minutes',`<input class="in" type="number" min="5" max="480" step="5" data-f="min" value="${v.min}">`)}</div>
 ${fld('Plan or note',`<input class="in" data-f="note" value="${esc(v.note||'')}" maxlength="140">`)}<div class="err" id="err"></div>
 <div class="btns"><button class="btn primary grow" data-act="savePlan">Save</button>${p?`<button class="btn danger" data-act="delPlan" data-id="${p.id}">${ic('trash',18)}</button>`:''}</div>`)}
function openHabit(id){const h=id?S.habits.find(x=>x.id===id):null;ctx={id};
 openSheet(h?'Edit habit':'New habit',`${fld('Habit',`<input class="in" data-f="name" value="${esc(h?.name||'')}" maxlength="60" placeholder="Reading, exercise, sleep by 11 pm">`)}<div class="err" id="err"></div>
 <div class="btns"><button class="btn primary grow" data-act="saveHabit">Save</button>${h?`<button class="btn danger" data-act="delHabit" data-id="${h.id}">${ic('trash',18)}</button>`:''}</div>`)}
function openNote(id,pre){const n=id?S.notes.find(x=>x.id===id):null;ctx={id};const v=n||{title:'',body:'',kind:'text',pinned:false,...pre};
 openSheet(n?'Edit note':'New note',`${fld('Title',`<input class="in" data-f="title" value="${esc(v.title)}" maxlength="100">`)}${fld('Type',seg('kind',[['text','Note'],['list','Checklist']],v.kind))}
 ${fld(v.kind==='list'?'Items (one per line, start with [ ] or [x])':'Text',`<textarea class="in" data-f="body" style="min-height:140px">${esc(v.body)}</textarea>`)}
 <div class="row" style="padding:4px 0;border:0"><div class="grow">Pin to top</div>${sw(v.pinned,'togPin','id="pinSw"')}</div><div class="err" id="err"></div>
 <div class="btns"><button class="btn primary grow" data-act="saveNote">Save</button>${n?`<button class="btn" data-act="note2task" data-id="${n.id}">Make task</button><button class="btn danger" data-act="delNote" data-id="${n.id}">${ic('trash',18)}</button>`:''}</div>`)}
function quickAdd(pre={}){const t0=pre.date||today();ctx={tab:'task'};
 openSheet('Quick add',`<div class="tabs">${seg('qt',[['task','Task'],['rem','Reminder'],['note','Note']],'task')}</div>
 <div id="qa-task">${fld('Task',`<input class="in" data-f="qtitle" placeholder="What needs doing?" maxlength="140">`)}
  <div class="chips"><button class="chip on" data-act="qd" data-d="${t0}">${t0===today()?'Today':fD(t0)}</button><button class="chip" data-act="qd" data-d="${addDays(today(),1)}">Tomorrow</button><button class="chip" data-act="qd" data-d="">No date</button><input class="in" type="time" data-f="qtime" style="width:auto" aria-label="Time"></div>
  ${fld('Priority',seg('pri',priOpts(),'med'))}${fld('Category',`<select class="in" data-f="qcat">${opts(S.cats.map(c=>[c.id,c.name]),'study')}</select>`)}</div>
 <div id="qa-rem" hidden>${fld('Remind me to',`<input class="in" data-f="rtitle" maxlength="120">`)}<div class="two">${fld('Date',`<input class="in" type="date" data-f="rdate" value="${today()}">`)}${fld('Time',`<input class="in" type="time" data-f="rtime" value="${hhmm(Date.now()+36e5).slice(0,3)}00">`)}</div></div>
 <div id="qa-note" hidden>${fld('Quick note',`<textarea class="in" data-f="ntext" style="min-height:110px" placeholder="Ideas you don't want to lose"></textarea>`)}</div>
 <div class="err" id="err"></div><div class="btns"><button class="btn primary grow" data-act="qSave">Add</button><button class="btn" data-act="qMore">More options</button></div>`,w=>{
  ctx.date=t0;w.addEventListener('segchange',e=>{if(e.detail==='qt'){const v=segVal('qt');ctx.tab=v;['task','rem','note'].forEach(k=>$('#qa-'+k,w).hidden=k!==v);$('#err',w).textContent='';const f=$(`#qa-${v} [data-f]`,w);if(f&&matchMedia('(pointer:fine)').matches)f.focus()}});
  w.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.tagName==='INPUT'&&e.target.type!=='time'){e.preventDefault();qSave()}});F('qtitle').focus()})}
function qSave(){const err=$('#err',sheetEl);
 if(ctx.tab==='task'){const title=F('qtitle').value.trim();if(!title){err.textContent='Give the task a title.';return}
  S.tasks.push({id:uid(),created:Date.now(),done:false,title,desc:'',date:ctx.date,time:F('qtime').value,pri:segVal('pri')||'med',cat:F('qcat').value,subject:'',kind:'',repeat:{type:'none',days:[]},rem:ctx.date&&F('qtime').value&&S.settings.remindDefault>=0?[S.settings.remindDefault]:[],nag:true,subs:[]});toast('Task added')}
 else if(ctx.tab==='rem'){const title=F('rtitle').value.trim(),date=F('rdate').value,time=F('rtime').value;if(!title){err.textContent='Write what the reminder is for.';return}if(!date||!time||atTs(date,time)<=Date.now()){err.textContent='Pick a time in the future.';return}
  S.reminders.push({id:uid(),title,date,time,repeat:'none',enabled:true,note:''});toast('Reminder added')}
 else{const b=F('ntext').value.trim();if(!b){err.textContent='Write something first.';return}S.notes.unshift({id:uid(),title:'',body:b,kind:'text',pinned:false,created:Date.now()});toast('Note saved')}
 markPast();save();closeSheet();render()}

/* ---------- queries ---------- */
function itemsOn(d){const it=[];
 S.tasks.forEach(t=>{if(t.date===d)it.push({type:'task',id:t.id,time:t.time,title:t.title,done:t.done,pri:t.pri,over:isOverdue(t)})});
 blocksOn(d).forEach(b=>it.push({type:'block',id:b.bid,time:b.start,end:b.end,title:b.title,done:b.done}));
 S.exams.filter(e=>e.date===d).forEach(e=>it.push({type:'exam',id:e.id,time:e.time,title:`${subjOf(e.subject)?.name||''} ${e.title}`.trim()}));
 S.plans.filter(p=>p.date===d).forEach(p=>it.push({type:'plan',id:p.id,time:'',title:`Study ${subjOf(p.subject)?.name||''} · ${p.min} min`,done:p.done}));
 S.reminders.filter(r=>r.enabled&&remOn(r,d)).forEach(r=>it.push({type:'rem',id:r.id,time:r.time,title:r.title}));
 return it.sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99'))}
const TYPE_LBL={task:'Task',block:'Schedule',exam:'Exam',plan:'Study plan',rem:'Reminder'};
function itemRow(i,d){return `<div class="row tap ${i.done?'done':''}" data-act="openItem" data-type="${i.type}" data-id="${i.id}" data-d="${d}"><div class="mono" style="width:66px;font-size:12.5px;color:var(--muted)">${i.time?fT(i.time):'All day'}</div><div class="grow"><div class="t">${esc(i.title)}</div></div><span class="pill ${i.type==='exam'?'hi':i.over?'hi':''}">${i.over?'Overdue':TYPE_LBL[i.type]}</span></div>`}
const compOn=d=>S.completions.filter(c=>c.date===d);
function dayStats(d){const ids=new Set();S.tasks.forEach(t=>{if(t.date===d)ids.add(t.id)});const done=new Set(compOn(d).map(c=>c.id));done.forEach(i=>ids.add(i));const dn=[...ids].filter(i=>done.has(i)).length;return{total:ids.size,done:dn,pct:ids.size?Math.round(dn/ids.size*100):0}}
const streak=h=>{let d=today(),n=0;if(!h.log[d])d=addDays(d,-1);while(h.log[d]){n++;d=addDays(d,-1)}return n};
const bestStreak=h=>{const ks=Object.keys(h.log).filter(k=>h.log[k]).sort();let b=0,c=0,p='';ks.forEach(k=>{c=p&&addDays(p,1)===k?c+1:1;b=Math.max(b,c);p=k});return b};
const sessOn=d=>S.sessions.filter(s=>dStr(new Date(s.start))===d);
const focusSecOn=d=>sessOn(d).reduce((a,s)=>a+s.sec,0);
const breakSecOn=d=>S.breaks.filter(b=>dStr(new Date(b.start))===d).reduce((a,b)=>a+b.sec,0);
const greet=()=>{const h=new Date().getHours();return h<5?'Late night':h<12?'Good morning':h<17?'Good afternoon':'Good evening'};

/* ---------- views ---------- */
const NAV=[['today','Today','home'],['tasks','Tasks','tasks'],['calendar','Calendar','calendar'],['focus','Focus','focus'],['timetable','Timetable','clock'],['study','Study','book'],['habits','Habits','habit'],['notes','Notes','note'],['files','My Files','book'],['reminders','Reminders','bell'],['insights','Insights','chart'],['prefs','Settings','sliders']];
const PLUS={today:['quickAdd','Quick add'],tasks:['addTask','Add task'],calendar:['calAdd','Add to this day'],timetable:['addBlock','Add timetable activity'],notes:['addNote','Add note'],insights:['quickAdd','Quick add']};
function topBtns(extra=''){const p=ui.route==='files'?[SM.on?'driveUpload':'loginGoogle',SM.on?'Upload files':'Sign in to add files']:PLUS[ui.route];
 return `<div class="head-r${extra?' hr-wrap':''}">${extra}<button class="gem-btn${G.open?' on':''}" data-act="${G.open?'closeGemini':'openGemini'}" aria-label="${esc(AIN())}" title="${esc(AIN())}">${ic('spark',18)}<span>${esc(AIN())}</span></button>${p?`<button class="plus-btn" data-act="${p[0]}" aria-label="${p[1]}" title="${p[1]}">${ic('plus',24,2.5)}</button>`:''}</div>`}
const hdr=(t,sub,right='')=>`<div class="head"><div><h1>${esc(t)}</h1>${sub?`<div class="sub">${sub}</div>`:''}</div>${topBtns(right)}</div>`;
const addBtn=(act,l,extra='')=>`<button class="btn primary" data-act="${act}" ${extra}>${ic('plus',18)}${l}</button>`;
function drawNav(){const main=NAV.slice(0,4);$('#nav').innerHTML=`<div class="brand">Study Planner</div>`+NAV.map(([id,l,i],ix)=>`<button class="nb ${ix>3?'n-extra':''} ${ui.route===id?'on':''}" data-act="go" data-r="${id}">${ic(i,22)}<span>${l}</span></button>`).join('')+`<button class="nb n-more ${ui.route==='more'||NAV.slice(4).some(n=>n[0]===ui.route)?'on':''}" data-act="go" data-r="more">${ic('more',22,3)}<span>More</span></button>`;NavPhys.attach()}
function vMore(){return hdr('More','Everything else in your planner')+`<div class="moregrid">${NAV.slice(4).map(([id,l,i])=>`<button data-act="go" data-r="${id}">${ic(i,22)}${l}</button>`).join('')}</div>`}
function vToday(){const t0=today(),now=Date.now(),nowHM=hhmm(now);
 const over=S.tasks.filter(isOverdue).sort((a,b)=>dueTs(a)-dueTs(b)),pend=S.tasks.filter(t=>!t.done&&t.date===t0&&!isOverdue(t)).sort((a,b)=>(a.time||'99').localeCompare(b.time||'99')),dn=[...new Map(compOn(t0).map(c=>[c.id,c])).values()].map(c=>S.tasks.find(t=>t.id===c.id)).filter(Boolean);
 const st=dayStats(t0),bl=blocksOn(t0),ov=overlaps(bl),cur=bl.find(b=>b.start<=nowHM&&nowHM<b.end&&!b.done),nxt=bl.find(b=>b.start>nowHM&&!b.done);
 const trig=triggersBetween(now,now+48*36e5).slice(0,3);
 const soon=S.tasks.filter(t=>!t.done&&t.date>t0&&t.date<=addDays(t0,7)&&(t.pri==='high'||['Test','Assignment'].includes(t.kind))).sort((a,b)=>dueTs(a)-dueTs(b)).slice(0,4);
 const exams=S.exams.filter(e=>e.date>=t0&&e.date<=addDays(t0,21)).sort((a,b)=>a.date.localeCompare(b.date));
 const hb=S.habits,hd=hb.filter(h=>h.log[t0]).length;
 return `<div class="head"><div><div class="sub">${new Date().toLocaleDateString([],{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div><h1>${greet()}${S.settings.name?', '+esc(S.settings.name):''}</h1></div>${topBtns()}</div>
 ${S.seeded&&(S.tasks.some(x=>x.example)||S.habits.some(x=>x.example))?`<div class="note-box amber"><b>Example data is loaded</b> so you can see how things look. <button class="lnk" data-act="rmExamples">Remove examples</button></div>`:''}
 ${!storageOk?`<div class="note-box bad"><b>Saving is blocked in this browser.</b> Your changes will be lost when you close the page. Export a backup from Settings.</div>`:''}
 ${SM.on&&Sync.st.state==='needsSignin'?`<div class="note-box amber"><b>Google sync is paused.</b> <button class="lnk" data-act="syncSignIn">Sign in again</button></div>`:''}
 ${permState()==='default'?`<div class="note-box">Reminders pop up as notifications once you allow them. <button class="lnk" data-act="go" data-r="reminders">Set up notifications</button></div>`:''}
 <div class="hero"><div style="display:flex;align-items:baseline;justify-content:space-between"><div class="big">${st.done}<span style="color:var(--muted);font-size:24px">/${st.total}</span></div><div class="sub">${st.total?st.pct+'% of today done':'Nothing planned for today yet'}</div></div>
 <div class="stats"><span><b>${pend.length+over.filter(t=>t.date===t0).length}</b>pending</span><span><b>${st.done}</b>completed</span><span><b style="${over.length?'color:var(--hi)':''}">${over.length}</b>overdue</span><span><b>${hd}/${hb.length}</b>habits</span></div>
 <div class="bar"><i style="width:${st.pct}%"></i></div></div>
 <div class="sec-h">Right now</div><div class="panel">${cur?`<div class="row"><span class="pill acc">Now</span><div class="grow"><div class="t">${esc(cur.title)}</div><div class="m">${fT(cur.start)} to ${fT(cur.end)}</div></div></div>`:''}${nxt?`<div class="row"><span class="pill">Next</span><div class="grow"><div class="t">${esc(nxt.title)}</div><div class="m">Starts ${fT(nxt.start)}</div></div></div>`:''}${!cur&&!nxt?`<div class="empty">Nothing else scheduled today. <button class="lnk" data-act="addBlock">Add an activity</button></div>`:''}</div>
 ${over.length?`<div class="sec-h"><span class="warn">Overdue</span></div><div class="panel">${over.map(t=>taskRow(t)).join('')}</div>`:''}
 <div class="sec-h"><span>Today's tasks</span><button class="lnk" data-act="go" data-r="tasks">All tasks</button></div><div class="panel">${pend.length||dn.length?pend.map(t=>taskRow(t)).join('')+dn.map(t=>taskRow(t,true)).join(''):`<div class="empty">No tasks for today. Tap + to add one.</div>`}</div>
 <div class="grid2"><div><div class="sec-h"><span>Upcoming reminders</span><button class="lnk" data-act="go" data-r="reminders">Open</button></div><div class="panel">${trig.length?trig.map(r=>`<div class="row"><div class="mono" style="width:66px;font-size:12.5px;color:var(--muted)">${new Date(r.ts).toDateString()===new Date().toDateString()?fT(hhmm(r.ts)):'Tmrw '+fT(hhmm(r.ts)).replace(' ','')}</div><div class="grow"><div class="t">${esc(r.title)}</div><div class="m">${esc(r.body)}</div></div></div>`).join(''):`<div class="empty">No reminders in the next 2 days.</div>`}</div></div>
 <div><div class="sec-h"><span>Deadlines and exams</span></div><div class="panel">${soon.length||exams.length?exams.map(e=>{const n=Math.round((atTs(e.date,'00:00')-atTs(t0,'00:00'))/864e5);return `<div class="row tap" data-act="openItem" data-type="exam" data-id="${e.id}"><div class="grow"><div class="t">${esc((subjOf(e.subject)?.name||'')+' '+e.title)}</div><div class="m">${fD(e.date)}</div></div><span class="pill ${n<=7?'hi':'acc'}">${n===0?'Today':n+' days'}</span></div>`}).join('')+soon.map(t=>`<div class="row tap" data-act="editTask" data-id="${t.id}"><div class="grow"><div class="t">${esc(t.title)}</div><div class="m">${esc(dueText(t))}</div></div><span class="pill ${priCls(t.pri)}">${esc(priLabel(t.pri))}</span></div>`).join(''):`<div class="empty">No important deadlines this week.</div>`}</div></div></div>
 <div class="sec-h"><span>Today's timetable</span><button class="lnk" data-act="go" data-r="timetable">Open</button></div><div class="panel">${bl.length?bl.map(b=>`<div class="row tap ${b.done?'done':''}" data-act="editBlock" data-id="${b.bid}"><div class="mono" style="width:66px;font-size:12.5px;color:var(--muted)">${fT(b.start)}</div><div class="grow"><div class="t">${esc(b.title)}</div><div class="m">${fT(b.start)} to ${fT(b.end)}${ov.has(b.bid)?' · <span class="warn">Overlaps</span>':''}</div></div></div>`).join(''):`<div class="empty">Your timetable is empty today.</div>`}</div>
 <div class="sec-h"><span>Habits today</span><button class="lnk" data-act="go" data-r="habits">Open</button></div>${hb.length?`<div class="chips">${hb.map(h=>`<button class="chip ${h.log[t0]?'on':''}" data-act="togHabit" data-id="${h.id}" data-d="${t0}">${esc(h.name)}${streak(h)?' · '+streak(h)+'d':''}</button>`).join('')}</div>`:`<div class="panel"><div class="empty">No habits yet.</div></div>`}`}
function taskListHtml(){const f=ui.tf,q=f.q.trim().toLowerCase();let l=S.tasks.filter(t=>(f.status==='all'||(f.status==='pending'&&!t.done)||(f.status==='done'&&t.done)||(f.status==='overdue'&&isOverdue(t)))&&(f.cat==='all'||t.cat===f.cat)&&(!q||(t.title+' '+t.desc).toLowerCase().includes(q)));
 const po={high:0,med:1,low:2};l.sort((a,b)=>f.sort==='pri'?po[a.pri]-po[b.pri]||(a.date||'9').localeCompare(b.date||'9'):f.sort==='new'?b.created-a.created:(a.date?dueTs(a):9e15)-(b.date?dueTs(b):9e15));
 return l.length?l.map(t=>taskRow(t)).join(''):`<div class="empty">${S.tasks.length?'No tasks match these filters.':'No tasks yet. Tap + to add your first one.'}</div>`}
function vTasks(){const f=ui.tf;return hdr('Tasks',`${S.tasks.filter(t=>!t.done).length} open`)+`<input class="in" id="tq" type="search" placeholder="Search tasks" value="${esc(f.q)}" aria-label="Search tasks" style="margin-bottom:10px">
 <div class="chips">${[['pending','Pending'],['overdue','Overdue'],['done','Done'],['all','All']].map(([v,l])=>`<button class="chip ${f.status===v?'on':''}" data-act="tf" data-k="status" data-v="${v}">${l}</button>`).join('')}</div>
 <div class="two" style="margin-bottom:10px"><select class="in" data-tf="cat" aria-label="Category"><option value="all">All categories</option>${opts(S.cats.map(c=>[c.id,c.name]),f.cat)}</select><select class="in" data-tf="sort" aria-label="Sort">${opts([['due','Sort: due date'],['pri','Sort: priority'],['new','Sort: newest']],f.sort)}</select></div><div class="panel" id="tlist">${taskListHtml()}</div>`}
function calItems(d){return itemsOn(d)}
function vCalendar(){const sel=ui.calDate||today();ui.calDate=sel;const anc=ui.calAnchor||sel.slice(0,7)+'-01';ui.calAnchor=anc;const v=ui.calView;let nav='',body='';
 const sh=n=>v==='month'?(()=>{const d=parseD(anc);d.setMonth(d.getMonth()+n);return dStr(d)})():addDays(sel,n*(v==='week'?7:1));
 const title=v==='month'?parseD(anc).toLocaleDateString([],{month:'long',year:'numeric'}):v==='week'?`${fD(mondayOf(sel))} to ${fD(addDays(mondayOf(sel),6))}`:parseD(sel).toLocaleDateString([],{weekday:'long',day:'numeric',month:'long'});
 nav=`<div class="cal-nav"><button class="iconbtn" data-act="calShift" data-n="-1" aria-label="Previous">${ic('l')}</button><div class="grow">${esc(title)}</div><button class="iconbtn" data-act="calShift" data-n="1" aria-label="Next">${ic('r')}</button></div>`;
 if(v==='month'){const first=parseD(anc),start=mondayOf(dStr(first));let cells='';for(let i=0;i<42;i++){const d=addDays(start,i),its=itemsOn(d),n=its.length,red=its.some(x=>x.over||x.type==='exam'||(x.type==='task'&&!x.done&&x.pri==='high')),isOut=d.slice(0,7)!==anc.slice(0,7);if(i>=35&&isOut)break;
   cells+=`<button class="cell ${n>=5?'b3':n>=3?'b2':n?'b1':''} ${d===today()?'today':''} ${d===sel?'sel':''} ${isOut?'out':''}" data-act="calPick" data-d="${d}" aria-label="${fD(d)}, ${n} items"><span>${parseD(d).getDate()}</span><span class="dots">${red?'<i class="r"></i>':''}${its.some(x=>x.type==='task')?'<i class="a"></i>':''}${its.some(x=>x.type==='block')?'<i></i>':''}</span></button>`}
  body=`<div class="mgrid">${['M','T','W','T','F','S','S'].map(x=>`<div class="dow">${x}</div>`).join('')}${cells}</div><div class="legend" style="margin:8px 0"><i class="dot" style="background:var(--hi)"></i>deadline or overdue <i class="dot" style="background:var(--accent);margin-left:8px"></i>task <i class="dot" style="background:var(--ink);opacity:.55;margin-left:8px"></i>schedule. Darker days are busier.</div>`}
 else if(v==='week'){body=Array.from({length:7},(_,i)=>{const d=addDays(mondayOf(sel),i),its=itemsOn(d);return `<div class="sec-h" style="margin:14px 0 6px"><button class="lnk" data-act="calPick" data-d="${d}" style="${d===today()?'':'color:var(--muted)'}">${fD(d)}${d===today()?' · Today':''}</button><span>${its.length||''}</span></div><div class="panel">${its.length?its.map(x=>itemRow(x,d)).join(''):`<div class="empty" style="padding:10px">Free day</div>`}</div>`}).join('')}
 if(v!=='week'){const its=itemsOn(sel);body+=`<div class="sec-h"><span>${fD(sel)}</span><button class="lnk" data-act="calAdd">Add to this day</button></div><div class="panel">${its.length?its.map(x=>itemRow(x,sel)).join(''):`<div class="empty">Nothing planned. ${sel>=today()?'A good day to plan ahead.':''}</div>`}</div>`}
 return hdr('Calendar','',`<div class="btns"><button class="btn" data-act="calTomorrow">Plan tomorrow</button></div>`)+`<div class="tabs">${[['day','Day'],['week','Week'],['month','Month']].map(([k,l])=>`<button class="chip ${v===k?'on':''}" data-act="calView" data-v="${k}">${l}</button>`).join('')}<button class="chip" data-act="calToday">Today</button></div>`+nav+body}
function vTimetable(){const d=ui.tt||today();ui.tt=d;const bl=blocksOn(d),ov=overlaps(bl),nowHM=hhmm(Date.now()),isT=d===today();
 return hdr('Timetable',fD(d)+(isT?' · Today':''))+`<div class="cal-nav"><button class="iconbtn" data-act="ttShift" data-n="-1" aria-label="Previous day">${ic('l')}</button><div class="grow"><button class="lnk" data-act="ttToday">Today</button></div><button class="iconbtn" data-act="ttShift" data-n="1" aria-label="Next day">${ic('r')}</button></div>
 ${ov.size?`<div class="note-box bad"><b>Overlap:</b> some activities share the same time. They are marked below.</div>`:''}
 <div class="panel">${bl.length?bl.map(b=>{const cur=isT&&b.start<=nowHM&&nowHM<b.end,next=isT&&!cur&&b.start>nowHM&&!bl.some(x=>x.start>nowHM&&x.start<b.start);return `<div class="row ${b.done?'done':''}" ${cur?'style="background:var(--accent-soft)"':''}><button class="check ${b.done?'on':''}" data-act="togBlock" data-id="${b.bid}" data-d="${d}" aria-label="Mark as done">${ic('check',16,3)}</button><div class="grow tap" data-act="editBlock" data-id="${b.bid}"><div class="t">${esc(b.title)}</div><div class="m"><span>${fT(b.start)} to ${fT(b.end)}</span>${cur?'<span class="pill acc">Now</span>':''}${next?'<span class="pill">Next</span>':''}${ov.has(b.bid)?'<span class="pill hi">Overlaps</span>':''}${b.repeat?.length?`<span>Repeats ${b.repeat.length===7?'daily':b.repeat.length+' days a week'}</span>`:''}${b.notes?`<span>${esc(b.notes)}</span>`:''}</div></div></div>`}).join(''):`<div class="empty">No activities on this day. Add classes, study blocks, meals, breaks and exercise.</div>`}</div>`}
function weekFocusSec(sub){const m=mondayOf(today());let s=0;for(let i=0;i<7;i++)sessOn(addDays(m,i)).forEach(x=>{if(!sub||x.subject===sub)s+=x.sec});return s}
function vStudy(){const t0=today(),wk=mondayOf(t0),wk7=addDays(wk,6);const exams=S.exams.sort((a,b)=>a.date.localeCompare(b.date)).filter(e=>e.date>=t0);const plans=S.plans.filter(p=>p.date>=wk&&p.date<=wk7).sort((a,b)=>a.date.localeCompare(b.date));
 const planMin=plans.reduce((a,p)=>a+p.min,0),doneMin=Math.round(weekFocusSec()/60);
 return hdr('Study','This week: '+(plans.length?`${plans.filter(p=>p.done).length} of ${plans.length} planned sessions done`:'no sessions planned yet'),`<div class="btns"><button class="btn" data-act="addExam">Exam</button>${addBtn('addSubj','Subject')}</div>`)+
 `<div class="sec-h">Exam countdown</div><div class="panel">${exams.length?exams.map(e=>{const n=Math.round((atTs(e.date,'00:00')-atTs(t0,'00:00'))/864e5);return `<div class="row tap" data-act="openItem" data-type="exam" data-id="${e.id}"><div style="width:62px;text-align:center"><div style="font:700 26px var(--f-display);${n<=7?'color:var(--hi)':''}">${n}</div><div class="sub" style="font-size:11px">${n===1?'day':'days'}</div></div><div class="grow"><div class="t">${esc((subjOf(e.subject)?.name||'')+' '+e.title)}</div><div class="m">${fD(e.date)} · ${fT(e.time||'09:00')}</div></div>${n<=7?'<span class="pill hi">Soon</span>':''}</div>`}).join(''):`<div class="empty">No exams set. Add one to start a countdown.</div>`}</div>
 <div class="sec-h"><span>Planned vs focused (this week)</span></div><div class="panel"><div class="row"><div class="grow"><div class="m" style="margin:0 0 6px"><span>Planned ${planMin} min</span><span>Focused ${doneMin} min</span></div><div class="bar"><i style="width:${planMin?Math.min(100,Math.round(doneMin/planMin*100)):0}%"></i></div></div></div></div>
 <div class="sec-h"><span>Planned sessions</span><button class="lnk" data-act="addPlan">Plan a session</button></div><div class="panel">${plans.length?plans.map(p=>`<div class="row ${p.done?'done':''}"><button class="check ${p.done?'on':''}" data-act="togPlan" data-id="${p.id}" aria-label="Mark session done">${ic('check',16,3)}</button><div class="grow tap" data-act="editPlan" data-id="${p.id}"><div class="t">${esc(subjOf(p.subject)?.name||'General')} · ${p.min} min</div><div class="m">${fD(p.date)}${p.note?' · '+esc(p.note):''}</div></div>${!p.done?`<button class="btn" data-act="startPlan" data-id="${p.id}">Start</button>`:''}</div>`).join(''):`<div class="empty">Nothing planned this week.</div>`}</div>
 <div class="sec-h">Subjects</div><div class="panel">${S.subjects.length?S.subjects.map(s=>{const ts=S.tasks.filter(t=>t.subject===s.id),op=ts.filter(t=>!t.done),open=ui.subjOpen===s.id;return `<div class="row tap" data-act="subjOpen" data-id="${s.id}"><i class="dot" style="background:${s.color};width:12px;height:12px"></i><div class="grow"><div class="t">${esc(s.name)}</div><div class="m"><span>${op.length} open</span><span>${ts.length-op.length} done</span><span>${dur(weekFocusSec(s.id))} focused this week</span></div></div><button class="iconbtn" data-act="editSubj" data-id="${s.id}" aria-label="Edit subject">${ic('edit',18)}</button></div>${open?`<div style="background:var(--surface2)">${ts.length?ts.map(t=>taskRow(t)).join(''):'<div class="empty">No tasks yet.</div>'}<div style="padding:10px 14px"><button class="btn" data-act="addTaskFor" data-id="${s.id}">${ic('plus',16)}Add task for ${esc(s.name)}</button></div></div>`:''}`}).join(''):`<div class="empty">Add your subjects to organise assignments, practicals and revision.</div>`}</div>`}
function vHabits(){const t0=today(),H=S.habits,sel=ui.habSel;const hs=sel==='all'?H:H.filter(h=>h.id===sel);
 const wkd=Array.from({length:7},(_,i)=>addDays(mondayOf(t0),i));const wkDone=H.reduce((a,h)=>a+wkd.filter(d=>d<=t0&&h.log[d]).length,0),wkMax=H.length*wkd.filter(d=>d<=t0).length;
 const start=addDays(mondayOf(t0),-7*14);let cells='';for(let i=0;i<105;i++){const d=addDays(start,i);if(d>t0){cells+='<i class="fut"></i>';continue}const n=hs.length?hs.filter(h=>h.log[d]).length/hs.length:0;cells+=`<i class="${n>=1?'l4':n>=.67?'l3':n>=.34?'l2':n>0?'l1':''}" title="${fD(d)}"></i>`}
 return hdr('Habits',H.length?`${H.filter(h=>h.log[t0]).length} of ${H.length} done today`:'',addBtn('addHabit','New'))+`<div class="panel">${H.length?H.map(h=>`<div class="row"><button class="check ${h.log[t0]?'on':''}" data-act="togHabit" data-id="${h.id}" data-d="${t0}" aria-label="Toggle today">${ic('check',16,3)}</button><div class="grow tap" data-act="editHabit" data-id="${h.id}"><div class="t">${esc(h.name)}</div><div class="m"><span>${streak(h)} day streak</span><span>Best ${bestStreak(h)}</span></div></div><div class="wk" aria-label="This week">${wkd.map(d=>`<i class="${h.log[d]?'on':''}" title="${fD(d)}"></i>`).join('')}</div></div>`).join(''):`<div class="empty">Add habits like reading, revision, exercise, water or sleeping on time.</div>`}</div>
 ${H.length?`<div class="sec-h"><span>This week</span></div><div class="panel"><div class="row"><div class="grow"><div class="bar"><i style="width:${wkMax?Math.round(wkDone/wkMax*100):0}%"></i></div><div class="m">${wkDone} of ${wkMax} check-ins so far (${wkMax?Math.round(wkDone/wkMax*100):0}%)</div></div></div></div>
 <div class="sec-h"><span>Last 15 weeks</span></div><div class="chips"><button class="chip ${sel==='all'?'on':''}" data-act="habSel" data-id="all">All habits</button>${H.map(h=>`<button class="chip ${sel===h.id?'on':''}" data-act="habSel" data-id="${h.id}">${esc(h.name)}</button>`).join('')}</div><div class="panel" style="padding:12px 14px"><div class="heat" role="img" aria-label="Habit heatmap">${cells}</div><div class="legend" style="margin-top:6px">Less <i class="dot" style="background:var(--surface2)"></i><i class="dot" style="background:color-mix(in srgb,var(--accent) 50%,var(--surface2))"></i><i class="dot" style="background:var(--accent)"></i> More. Columns are weeks, rows run Monday to Sunday.</div></div>`:''}`}
function noteListHtml(){const q=ui.noteQ.trim().toLowerCase();const l=S.notes.filter(n=>!q||(n.title+' '+n.body).toLowerCase().includes(q)).sort((a,b)=>b.pinned-a.pinned||b.created-a.created);
 return l.length?l.map(n=>`<div class="noteitem" data-act="editNote" data-id="${n.id}"><div class="t">${n.pinned?ic('pin',14)+' ':''}${esc(n.title||n.body.split('\n')[0].slice(0,50)||'Untitled')}</div>${n.kind==='list'?n.body.split('\n').filter(Boolean).slice(0,4).map((ln,i)=>{const dn=/^\[x\]/i.test(ln);return `<div class="row" style="padding:3px 0;border:0"><button class="check ${dn?'on':''}" style="width:20px;height:20px" data-act="noteLine" data-id="${n.id}" data-i="${i}" aria-label="Toggle item">${ic('check',12,3)}</button><span class="${dn?'done':''}" style="${dn?'text-decoration:line-through;color:var(--muted)':''}">${esc(ln.replace(/^\[[ xX]\]\s*/,''))}</span></div>`}).join(''):(n.title?`<div class="body">${esc(n.body)}</div>`:'')}</div>`).join(''):`<div class="empty">${S.notes.length?'No notes match.':'Capture ideas here so you do not forget them.'}</div>`}
function vNotes(){return hdr('Notes',`${S.notes.length} saved`)+`<div class="two" style="grid-template-columns:1fr auto;margin-bottom:10px"><input class="in" id="nq" placeholder="Quick capture: type and press Enter" maxlength="300" aria-label="Quick capture"><button class="btn primary" data-act="capture">Save</button></div><input class="in" id="nsearch" type="search" placeholder="Search notes" value="${esc(ui.noteQ)}" aria-label="Search notes" style="margin-bottom:10px"><div class="panel" id="nlist">${noteListHtml()}</div>`}
function permBanner(){const p=permState(),std=matchMedia('(display-mode: standalone)').matches;
 return `<div class="note-box ${p==='granted'?'':p==='denied'||p==='unsupported'?'bad':'amber'}"><b>${p==='granted'?'Notifications are on.':p==='denied'?'Notifications are blocked.':p==='unsupported'?'This browser does not support notifications.':'Notifications are off.'}</b> ${p==='default'?'Allow them so reminders can pop up.':p==='denied'?'Allow notifications for this site in your browser or phone settings, then reload.':''}${p==='default'?`<div class="btns" style="margin-top:8px"><button class="btn primary" data-act="askPerm">Allow notifications</button></div>`:''}
 <ul><li>Reminders are checked while this page is open or running in the background of your browser. Android can pause background pages to save battery, so a reminder may be late or missed if the browser was closed or put to sleep.</li><li>Installing as an app helps, but it does not guarantee delivery with the phone locked. For must-not-miss events, also add them to your phone's calendar or alarm clock.</li><li>Installed as app: ${std?'yes':'no'} · Offline support: ${swOk?'ready':'not available in this view'}</li></ul>${installEv?`<div class="btns" style="margin-top:8px"><button class="btn" data-act="install">Install Study Planner</button></div>`:!std?`<div style="margin-top:6px">To install on Android: open the hosted page in Chrome, then use the menu and choose Add to Home screen or Install app.</div>`:''}</div>`}
function vReminders(){const tab=ui.remTab,now=Date.now();let body='';
 if(tab==='up'){const l=triggersBetween(now,now+7*864e5);body=`<div class="panel">${l.length?l.map(r=>`<div class="row"><div class="mono" style="width:74px;font-size:12px;color:var(--muted)">${fD(dStr(new Date(r.ts))).replace(/^[^,]*,\s*/,'')}<br>${fT(hhmm(r.ts))}</div><div class="grow"><div class="t">${esc(r.title)}</div><div class="m"><span class="pill">${r.kind}</span><span>${esc(r.body)}</span></div></div></div>`).join(''):`<div class="empty">No reminders in the next 7 days. Add a task with a due time and a reminder, or create a reminder.</div>`}</div>`}
 else if(tab==='log'){body=`<div class="panel">${S.log.length?S.log.map(e=>`<div class="row"><div class="grow"><div class="t">${esc(e.title)}</div><div class="m"><span>${esc(e.body)}</span><span>${new Date(e.ts).toLocaleString([],{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'})}</span>${e.late?'<span class="pill md">Late</span>':''}${e.snoozed?'<span class="pill">Snoozed</span>':''}</div></div>${!e.snoozed?`<button class="btn" data-act="snoozeLog" data-id="${e.id}">Snooze</button>`:''}${e.link?.type==='task'&&S.tasks.find(t=>t.id===e.link.id&&!t.done)?`<button class="btn" data-act="doneLog" data-id="${e.link.id}">Done</button>`:''}</div>`).join(''):`<div class="empty">Delivered reminders will appear here.</div>`}</div>`}
 else body=`<div class="panel">${S.reminders.length?S.reminders.map(r=>`<div class="row"><div class="grow tap" data-act="editRem" data-id="${r.id}"><div class="t">${esc(r.title)}</div><div class="m"><span>${r.repeat==='none'?fD(r.date):'Repeats '+r.repeat}</span><span>${fT(r.time)}</span>${r.auto?'<span class="pill">Snoozed</span>':''}</div></div>${sw(r.enabled,'togRem','data-id="'+r.id+'" aria-label="Enable reminder"')}<button class="iconbtn" data-act="delRemAsk" data-id="${r.id}" aria-label="Delete reminder">${ic('trash',18)}</button></div>`).join(''):`<div class="empty">No standalone reminders yet.</div>`}</div><div class="hist-n">Reminders for tasks and timetable activities are set inside each task or activity.</div>`;
 return hdr('Reminders','',addBtn('addRem','New'))+permBanner()+`<div class="tabs" style="margin-top:12px">${[['up','Upcoming'],['log','Delivered'],['mine','My reminders']].map(([k,l])=>`<button class="chip ${tab===k?'on':''}" data-act="remTab" data-v="${k}">${l}</button>`).join('')}</div>${body}<div class="btns" style="margin-top:14px"><button class="btn" data-act="ics">Export next 30 days to calendar (.ics)</button></div><div class="hist-n">Phone calendars deliver alarms reliably even when this page is closed. Downloads work in the hosted or installed app, not inside a preview.</div>`}
function vInsights(){const t0=today(),m=mondayOf(t0),days=Array.from({length:7},(_,i)=>addDays(m,i)),st=dayStats(t0);let wd=0,wt=0;days.forEach(d=>{const s=dayStats(d);wd+=s.done;wt+=s.total});const wp=wt?Math.round(wd/wt*100):0;
 const pend=S.tasks.filter(t=>!t.done&&t.date&&t.date<=addDays(m,6)).length;const hb=S.habits,hc=hb.length?Math.round(hb.reduce((a,h)=>a+days.filter(d=>d<=t0&&h.log[d]).length,0)/(hb.length*days.filter(d=>d<=t0).length)*100):0;
 const best=hb.slice().sort((a,b)=>streak(b)-streak(a))[0];const fs=weekFocusSec();const done7=days.flatMap(d=>compOn(d)).map(c=>c.title);
 const msg=wt===0?'Plan a few tasks and this page will start tracking your week.':wp>=70?'Strong week. Keep the same rhythm.':wp>=40?'Good progress. Pick one pending task to finish today.':'A slow start is fine. Finish one small task today to get moving.';
 return hdr('Insights','This week, Monday to Sunday')+`<div class="hero"><div class="sub">${msg}</div><div class="stats"><span><b>${st.pct}%</b>today</span><span><b>${wp}%</b>this week</span><span><b>${wd}</b>completed</span><span><b>${pend}</b>pending</span></div><div class="bar"><i style="width:${wp}%"></i></div></div>
 <div class="sec-h">Tasks completed per day</div><div class="panel"><div class="bars">${days.map(d=>{const c=compOn(d).length,mx=Math.max(1,...days.map(x=>compOn(x).length));return `<div class="col"><u>${c||''}</u><i style="height:${Math.round(c/mx*80)}px;${d>t0?'opacity:.25':''}"></i><span>${DOWN[dow(d)][0]}</span></div>`}).join('')}</div><div style="height:10px"></div></div>
 <div class="sec-h">Habits</div><div class="panel"><div class="row"><div class="grow"><div class="t">${hb.length?hc+'% consistency this week':'No habits yet'}</div><div class="m">${best&&streak(best)?`Longest running streak: ${esc(best.name)}, ${streak(best)} days`:'Check in today to start a streak'}</div></div></div></div>
 <div class="sec-h">Study time</div><div class="panel"><div class="row"><div class="grow"><div class="t">${dur(fs)} focused this week</div><div class="m">${sessOn(t0).length} session${sessOn(t0).length===1?'':'s'} today · goal ${dur(S.settings.goalMin*60)} a day</div></div><button class="btn" data-act="go" data-r="focus">Focus</button></div></div>
 <div class="sec-h">Completed this week</div><div class="panel">${done7.length?done7.slice(-8).map(t=>`<div class="row"><div class="t" style="font-weight:500">${esc(t)}</div></div>`).join(''):`<div class="empty">Nothing completed yet this week.</div>`}</div>`}
function vPrefs(){const s=S.settings;return hdr('Settings','Stored on this device, with optional Google Drive sync')+
 `<div class="sec-h">Profile and theme</div><div class="panel"><div class="row"><div class="grow">Your name</div><input class="in" style="max-width:180px" data-set="name" value="${esc(s.name)}" maxlength="30"></div><div class="row"><div class="grow">Theme</div><select class="in" style="max-width:180px" data-set="theme">${opts([['system','Match device'],['light','Light'],['dark','Dark']],s.theme)}</select></div></div>
 <div class="sec-h">Reminders</div><div class="panel"><div class="row"><div class="grow">Default reminder</div><select class="in" style="max-width:180px" data-set="remindDefault" data-num>${opts([[0,'At due time'],[5,'5 min before'],[10,'10 min before'],[15,'15 min before'],[30,'30 min before'],[60,'1 hour before']],s.remindDefault)}</select></div><div class="row"><div class="grow">Remind again if not done<div class="m">After the due time</div></div><select class="in" style="max-width:180px" data-set="nagMin" data-num>${opts([[0,'Off'],[15,'15 min'],[30,'30 min'],[60,'1 hour']],s.nagMin)}</select></div><div class="row"><div class="grow">Sound with in-app alerts</div>${sw(s.sound,'togSound')}</div></div>
 <div class="sec-h">Priority names</div><div class="panel">${[['high','High'],['med','Medium'],['low','Low']].map(([k,d])=>`<div class="row"><span class="pill ${priCls(k)}">${d}</span><div class="grow"></div><input class="in" style="max-width:180px" data-pri="${k}" value="${esc(s.pri[k])}" maxlength="14"></div>`).join('')}</div>
 <div class="sec-h"><span>Categories</span><button class="lnk" data-act="addCat">Add</button></div><div class="panel">${S.cats.map(c=>`<div class="row"><input type="color" data-catc="${c.id}" value="${c.color}" aria-label="Colour" style="width:36px;height:36px;border:0;background:none;padding:0"><input class="in" data-catn="${c.id}" value="${esc(c.name)}" maxlength="24"><button class="iconbtn" data-act="delCat" data-id="${c.id}" aria-label="Delete category">${ic('trash',18)}</button></div>`).join('')}</div>
 <div class="sec-h">Google account</div><div class="panel"><div class="row"><div class="grow"><div class="t">${SM.on?esc(SM.email||'Google account connected'):'Not signed in'}</div><div class="m">${SM.on?'Your sign-in preference is saved on this device. Google may occasionally request fresh consent.':'Sign in to use Drive folders and cloud sync.'}</div></div>${SM.on?'<button class="btn danger" data-act="logout">Log out</button>':'<button class="btn primary" data-act="loginGoogle">Sign in</button>'}</div></div>
 <div class="sec-h">Sync across devices</div><div id="syncPanel">${Sync.panelHtml()}</div>
 <div class="sec-h">Your data</div><div class="note-box"><b>Where it lives.</b> Everything is saved in this browser on this device, using local storage. Nothing is sent anywhere unless you turn on Google Drive sync, and then it goes only to your own Drive. There is no Study Planner account, and nothing is sold or shared. Clearing site data, using a private window, or uninstalling the browser deletes the copy on this device. Export a backup now and then.</div>
 <div class="btns"><button class="btn" data-act="exportData">Show backup</button><button class="btn" data-act="importData">Restore from backup</button>${S.tasks.some(x=>x.example)||S.habits.some(x=>x.example)?'<button class="btn" data-act="rmExamples">Remove examples</button>':''}<button class="btn danger" data-act="wipe">Delete all data</button></div><div class="legal-links"><a href="terms.html">Terms &amp; Conditions</a><a href="privacy.html">Privacy Policy</a><a href="under-construction.html">Help &amp; Support</a></div>`}

/* ---------- focus: view ---------- */
function weekSec(i){return focusSecOn(addDays(today(),-i))}
function vFocus(){const s=S.settings,t0=today(),fsd=focusSecOn(t0),goal=s.goalMin*60,ss=sessOn(t0);const fs=ui.fs;
 fs.min=fs.min??s.focusMin;fs.subject=fs.subject??'';fs.task=fs.task??'';fs.strict=fs.strict??s.strict;
 const pend=S.tasks.filter(t=>!t.done&&(!fs.subject||t.subject===fs.subject));
 const wk=Array.from({length:7},(_,i)=>weekSec(6-i)),mx=Math.max(1,...wk);
 const bySub={};for(let i=0;i<7;i++)sessOn(addDays(t0,-i)).forEach(x=>{const k=subjOf(x.subject)?.name||'No subject';bySub[k]=(bySub[k]||0)+x.sec});const subRows=Object.entries(bySub).sort((a,b)=>b[1]-a[1]);const smx=Math.max(1,...subRows.map(r=>r[1]));
 let hist=S.sessions.slice().sort((a,b)=>b.start-a.start);if(ui.hist.date)hist=hist.filter(x=>dStr(new Date(x.start))===ui.hist.date);if(ui.hist.subject)hist=hist.filter(x=>x.subject===ui.hist.subject);
 const b=s.block;
 return hdr('Focus','Start quickly, study for real')+`<div class="hero"><div style="display:flex;justify-content:space-between;align-items:baseline"><div class="big">${dur(fsd)}</div><div class="sub">of ${dur(goal)} goal</div></div><div class="bar" style="margin:12px 0 8px"><i style="width:${Math.min(100,Math.round(fsd/goal*100))}%"></i></div>
 <div class="chips" style="margin:0">${[120,240,360].map(m=>`<button class="chip ${s.goalMin===m?'on':''}" data-act="goal" data-v="${m}">${m/60} h</button>`).join('')}<input class="in" type="number" min="15" max="960" step="15" style="width:96px" data-set="goalMin" data-num value="${s.goalMin}" aria-label="Daily goal in minutes"><span class="sub" style="align-self:center">min / day</span></div></div>
 <div class="sec-h">Set up a session</div><div class="panel" style="padding:14px">
 <div class="two"><div class="fld"><span>Subject</span><select class="in" data-fs="subject">${opts([['','Any'],...S.subjects.map(x=>[x.id,x.name])],fs.subject)}</select></div><div class="fld"><span>Task</span><select class="in" data-fs="task">${opts([['','No specific task'],...pend.map(t=>[t.id,t.title])],fs.task)}</select></div></div>
 <div class="fld"><span>Study duration</span><div class="seg">${[25,45,50,60,90].map(m=>`<button class="chip ${String(fs.min)===String(m)?'on':''}" data-act="fsMin" data-v="${m}">${m} min</button>`).join('')}<button class="chip ${fs.min==='custom'?'on':''}" data-act="fsMin" data-v="custom">Custom</button>${fs.min==='custom'?`<input class="in" type="number" min="1" max="600" data-fs="custom" value="${esc(fs.custom||'')}" placeholder="min" style="width:90px" aria-label="Custom minutes">`:''}</div></div>
 <div class="two" style="grid-template-columns:repeat(3,1fr)"><div class="fld"><span>Short break</span><input class="in" type="number" min="1" max="60" data-set="shortMin" data-num value="${s.shortMin}"></div><div class="fld"><span>Long break</span><input class="in" type="number" min="1" max="90" data-set="longMin" data-num value="${s.longMin}"></div><div class="fld"><span>Long break after</span><input class="in" type="number" min="2" max="12" data-set="every" data-num value="${s.every}"></div></div>
 <div class="row" style="padding:6px 0;border:0"><div class="grow">Start a break automatically<div class="m">Pomodoro: focus, short break, long break after ${s.every} sessions</div></div>${sw(s.autoBreak,'togAutoBreak')}</div>
 <div class="row" style="padding:6px 0;border:0"><div class="grow">Strict session<div class="m">Pausing and stopping early need confirmation</div></div>${sw(fs.strict,'fsStrict')}</div>
 <div class="row" style="padding:6px 0;border:0"><div class="grow">Warn before the end</div><select class="in" style="max-width:130px" data-set="warnMin" data-num>${opts([[0,'Off'],[1,'1 min'],[2,'2 min'],[5,'5 min']],s.warnMin)}</select></div>
 <div class="row" style="padding:6px 0;border:0"><div class="grow">Block distracting apps<div class="m">${b.on?'Needs the Android app. See below.':'Off'}</div></div>${sw(b.on,'togBlockApps')}</div>
 <button class="btn primary block" style="margin-top:8px;min-height:52px;font-size:16px" data-act="startFocus">${ic('play',18)} Start Focus Session</button></div>
 <div class="sec-h">Today</div><div class="panel"><div class="row"><div class="grow"><div class="stats" style="margin:0"><span><b>${dur(fsd)}</b>focused</span><span><b>${ss.filter(x=>x.done).length}</b>completed</span><span><b>${ss.filter(x=>!x.done).length}</b>interrupted</span><span><b>${dur(breakSecOn(t0))}</b>breaks</span></div></div></div></div>
 <div class="sec-h">Last 7 days</div><div class="panel"><div class="bars">${wk.map((v,i)=>`<div class="col"><u>${v?dur(v):''}</u><i style="height:${Math.round(v/mx*80)}px"></i><span>${DOWN[dow(addDays(t0,i-6))][0]}</span></div>`).join('')}</div><div style="height:10px"></div></div>
 ${subRows.length?`<div class="sec-h">By subject (7 days)</div><div class="panel">${subRows.map(([k,v])=>`<div class="sbar"><div class="nm">${esc(k)}</div><div class="bar"><i style="width:${Math.round(v/smx*100)}%"></i></div><div class="v">${dur(v)}</div></div>`).join('')}</div>`:''}
 <div class="sec-h">History</div><div class="two" style="margin-bottom:8px"><input class="in" type="date" data-hist="date" value="${esc(ui.hist.date)}" aria-label="Filter by date"><select class="in" data-hist="subject" aria-label="Filter by subject">${opts([['','All subjects'],...S.subjects.map(x=>[x.id,x.name])],ui.hist.subject)}</select></div>
 <div class="panel">${hist.length?hist.slice(0,30).map(x=>`<div class="row"><div class="grow tap" data-act="editSess" data-id="${x.id}"><div class="t">${esc(subjOf(x.subject)?.name||'No subject')} · ${dur(x.sec)}</div><div class="m"><span>${new Date(x.start).toLocaleString([],{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'})} to ${fT(hhmm(x.end))}</span><span class="pill ${x.done?'lo':'md'}">${x.done?'Completed':'Stopped early'}</span>${x.task?`<span>${esc(x.task)}</span>`:''}</div>${x.note?`<div class="m">${esc(x.note)}</div>`:''}</div></div>`).join(''):`<div class="empty">${S.sessions.length?'No sessions match.':'Completed sessions are saved here automatically.'}</div>`}</div>
 <div class="sec-h">Distracting apps (Android)</div><div class="note-box amber"><b>What this website can and cannot do.</b> A website cannot lock other Android apps. Focus Mode here gives you a full-screen, distraction-free timer. Actually blocking Instagram, YouTube or games needs one of these:<ul><li>Your phone's own focus tools, for example Digital Wellbeing's Focus mode or an app limit, if your software has them. Turn them on before you start a session.</li><li>A native Android version of this app. It would need Usage Access, Display over other apps, and Do Not Disturb access, which you grant in Android Settings. You can switch the feature off any time by revoking those permissions or uninstalling the app.</li></ul>This page already prepares for that: it saves your lists below and tells a native wrapper when a session starts, pauses and ends.</div>
 <div class="panel"><div class="row"><div class="grow">Block during focus sessions</div>${sw(b.on,'togBlockApps')}</div><div class="row"><div class="grow"><b>Status:</b> ${bridgeOn?'<span class="pill lo">Native blocking connected</span>':'<span class="pill">Not active. Web only, nothing is being blocked</span>'}</div></div>
 <div style="padding:12px 14px"><div class="sub" style="margin-bottom:6px;font-weight:700">Apps to block</div><div class="chips">${APPS.map(a=>`<button class="chip ${b.apps.includes(a)?'on':''}" data-act="blkApp" data-v="${esc(a)}">${esc(a)}</button>`).join('')}${b.apps.filter(a=>!APPS.includes(a)).map(a=>`<button class="chip on" data-act="blkApp" data-v="${esc(a)}">${esc(a)}</button>`).join('')}</div><div class="two" style="grid-template-columns:1fr auto"><input class="in" id="blkNew" placeholder="Add another app" maxlength="40"><button class="btn" data-act="blkAdd">Add</button></div>
 <div class="sub" style="margin:12px 0 6px;font-weight:700">Always allowed</div><div class="chips">${[...new Set([...ALLOWED_DEF,...b.allowed])].map(a=>`<button class="chip ${b.allowed.includes(a)?'on':''}" data-act="allowApp" data-v="${esc(a)}">${esc(a)}</button>`).join('')}</div>
 <div class="sub" style="margin:12px 0 6px;font-weight:700">When blocking applies</div>${seg('blkmode',[['session','During focus sessions'],['window','Daily time window']],b.mode).replace(/data-act="seg"/g,'data-act="blkMode"')}<div class="two" style="margin-top:10px"><div class="fld"><span>From</span><input class="in" type="time" data-blk="from" value="${b.from}"></div><div class="fld"><span>Until</span><input class="in" type="time" data-blk="to" value="${b.to}"></div></div><div class="hist-n">Access returns to normal when the session ends or the window closes.</div></div></div>`}

/* ---------- focus: timer ---------- */
let T=null,tickIv=null,wl=null;
const phaseMs=()=>T.plannedMs;
const elapsed=()=>T.accumMs+(T.runSince?Date.now()-T.runSince:0);
const remain=()=>phaseMs()-elapsed();
function native(method,payload){try{const n=window.DayPlannerNative;if(n&&typeof n[method]==='function'){n[method](JSON.stringify(payload));bridgeOn=true;return true}}catch(e){}try{window.dispatchEvent(new CustomEvent('dayplanner:focus',{detail:{method,...payload}}))}catch(e){}return false}
function blockPayload(){const b=S.settings.block;return{blocked:b.on?b.apps:[],allowed:b.allowed,mode:b.mode,from:b.from,to:b.to}}
function startFocus(){const fs=ui.fs;let min=fs.min==='custom'?Number(fs.custom):Number(fs.min);if(!(min>=1&&min<=600)){toast('Enter a duration between 1 and 600 minutes');return}
 if(T){if(!$('#focus'))recoverTimer();else toast('A session is already running');return}
 const p=S.pomo,t0=today();if(p.date!==t0){p.cycle=1;p.date=t0}
 const task=S.tasks.find(t=>t.id===fs.task);
 T={sid:uid(),phase:'focus',plannedMs:min*6e4,accumMs:0,runSince:Date.now(),startedAt:Date.now(),subject:fs.subject,taskId:fs.task,taskTitle:task?.title||'',strict:!!fs.strict,cycle:p.cycle,warned:false};
 S.timer=T;save(true);native('startFocus',{sessionId:T.sid,endsAt:Date.now()+T.plannedMs,strict:T.strict,...blockPayload()});openFocus()}
function openFocus(){if(!T)return;closeSheet();closeConfirm();let el=$('#focus');if(!el){el=document.createElement('div');el.id='focus';document.body.appendChild(el)}el.className='fo'+(T.phase==='focus'?'':' brk');drawFocus();if(!tickIv)tickIv=setInterval(tick,250);try{navigator.wakeLock?.request('screen').then(l=>wl=l).catch(()=>{})}catch(e){}}
function drawFocus(){const el=$('#focus');if(!el||!T)return;const s=S.settings,foc=T.phase==='focus',run=!!T.runSince,sj=subjOf(T.subject);
 el.className='fo'+(foc?'':' brk');
 el.innerHTML=`<div class="fo-top"><span class="pill acc">Focus Mode on</span><span class="pill ${bridgeOn?'lo':''}">${bridgeOn?'App blocking on':'App blocking not active (web only)'}</span>${T.strict?'<span class="pill hi">Strict</span>':''}</div>
 <div class="fo-mid"><div class="fo-phase">${foc?`Focus · session ${T.cycle}`:T.phase==='long'?'Long break':'Short break'}${run?'':' · Paused'}</div><div class="ringbox"><svg viewBox="0 0 240 240"><circle class="tr" cx="120" cy="120" r="108" fill="none" stroke-width="10"/><circle class="pg" id="ring" cx="120" cy="120" r="108" fill="none" stroke-width="10" stroke-linecap="round" stroke-dasharray="678.6" stroke-dashoffset="0"/></svg><div class="fo-time" id="foTime">${clock(remain())}</div></div>
 <div class="cyc">${Array.from({length:s.every},(_,i)=>`<i class="${i<=(T.cycle-1)%s.every?'on':''}"></i>`).join('')}</div>
 <div class="fo-task">${foc?esc(T.taskTitle||sj?.name||'Focus time'):'Rest. Look away from the screen.'}</div>${foc&&T.taskTitle&&sj?`<div class="sub">${esc(sj.name)}</div>`:''}<div class="bar" style="width:100%"><i id="foBar" style="width:0%"></i></div><div class="sub" id="foSub"></div></div>
 <div class="fo-btns"><button class="btn" data-act="${T.strict&&foc&&run?'foPauseStrict':'foPause'}">${run?ic('pause',18)+(T.strict&&foc?' Emergency pause':' Pause'):ic('play',18)+' Resume'}</button><button class="btn ${foc?'danger':''}" data-act="foEnd">${foc?'End session':'Skip break'}</button></div>`;tick()}
function tick(){if(!T){clearInterval(tickIv);tickIv=null;return}const r=remain(),el=$('#foTime');if(el)el.textContent=clock(r);const fr=Math.min(1,Math.max(0,elapsed()/phaseMs()));const ring=$('#ring');if(ring)ring.style.strokeDashoffset=String(678.6*fr);const bar=$('#foBar');if(bar)bar.style.width=Math.round(fr*100)+'%';const sub=$('#foSub');if(sub)sub.textContent=`${Math.round(fr*100)}% done · ends around ${fT(hhmm(Date.now()+Math.max(0,r)))}`;
 const w=S.settings.warnMin;if(T.phase==='focus'&&w&&!T.warned&&T.runSince&&r<=w*6e4&&r>0&&phaseMs()>w*6e4*2){T.warned=true;save(true);toast(`${w} minute${w>1?'s':''} left`);sys('Almost done',`${w} minute${w>1?'s':''} left in this session`,'warn-'+T.sid);beep()}
 if(r<=0&&T.runSince)finishPhase()}
function recordSession(sec,done){if(!T||T.phase!=='focus')return;if(S.sessions.some(x=>x.id===T.sid))return;if(sec<30){toast('Session under 30 seconds was not saved');return}
 S.sessions.push({id:T.sid,subject:T.subject,taskId:T.taskId,task:T.taskTitle,start:T.startedAt,end:Date.now(),sec:Math.round(sec),planned:Math.round(T.plannedMs/1000),done,strict:T.strict,note:''})}
function recordBreak(sec){if(sec>=5)S.breaks.push({id:uid(),start:T.startedAt,sec:Math.round(sec)})}
function endTimer(){T=null;S.timer=null;save();$('#focus')?.remove();try{wl?.release();wl=null}catch(e){}}
function finishPhase(atTs0){if(!T)return;const wasFocus=T.phase==='focus',p=S.pomo;
 if(wasFocus){recordSession(T.plannedMs/1000,true);native('stopFocus',{sessionId:T.sid,reason:'complete'});sys('Session complete',`${dur(T.plannedMs/1000)} of focus saved. Take a break.`,'end-'+T.sid);beep();toast(`Session saved: ${dur(T.plannedMs/1000)}`);
  const cyc=T.cycle,long=cyc%S.settings.every===0;p.cycle=cyc+1;p.date=today();const old=T;
  if(S.settings.autoBreak){T={...old,sid:uid(),phase:long?'long':'short',plannedMs:(long?S.settings.longMin:S.settings.shortMin)*6e4,accumMs:0,runSince:Date.now(),startedAt:Date.now(),warned:true};S.timer=T;save(true);drawFocus();return}
  endTimer();render()}
 else{recordBreak(T.plannedMs/1000);sys('Break over','Ready for the next session?','brk-'+T.sid);beep();toast('Break over. Ready for the next session?');endTimer();render()}}
function endEarly(){if(!T)return;const foc=T.phase==='focus',sec=elapsed()/1000;
 if(foc){recordSession(sec,false);native('stopFocus',{sessionId:T.sid,reason:'ended'});toast(sec>=30?`Saved ${dur(sec)} of actual study time`:'Session ended')}else recordBreak(sec);
 endTimer();render()}
function pauseT(){if(!T||!T.runSince)return;T.accumMs+=Date.now()-T.runSince;T.runSince=null;save(true);native('pauseFocus',{sessionId:T.sid});drawFocus()}
function resumeT(){if(!T||T.runSince)return;T.runSince=Date.now();save(true);native('resumeFocus',{sessionId:T.sid,endsAt:Date.now()+remain()});drawFocus()}
function recoverTimer(){const t=S.timer;if(!t)return;T=t;let seen=0;try{seen=Number(localStorage.getItem(SEEN))||0}catch(e){}
 if(!T.runSince){openFocus();return}
 const endAt=T.runSince+(T.plannedMs-T.accumMs),n=Date.now();
 if(n>=endAt){if(T.phase!=='focus'){recordBreak(T.plannedMs/1000);endTimer();return}
  const until=Math.max(T.runSince,Math.min(seen||T.runSince,endAt)),partial=T.accumMs+(until-T.runSince);
  openSheet('Your session ended while the app was closed',`<p style="margin:0 0 12px">A running timer can only keep counting by the clock. This page cannot track what you did while it was closed, so please say how much to record.</p><div class="btns" style="flex-direction:column;align-items:stretch"><button class="btn primary" data-act="recFull">Count the full ${dur(T.plannedMs/1000)}</button><button class="btn" data-act="recPart" data-s="${Math.round(partial/1000)}">Count until I last had it open (${dur(partial/1000)})</button><button class="btn danger" data-act="recNone">Do not record</button></div>`);return}
 if(seen&&n-seen>45e3)toast('Timer kept running by the clock while the page was closed. Check the time still matches your study.',[],6000);openFocus()}

/* ---------- Google Drive file library ---------- */
let driveFolderId='',driveItems=[],driveLoaded=false,driveLoading=false;
function vFiles(){
 if(!SM.on)return hdr('My Files','Your folders and study materials')+`<div class="note-box amber">Sign in with Google to create folders and store files in your own Google Drive.</div><button class="btn primary" data-act="loginGoogle">Sign in with Google</button>`;
 const folder=driveFolderId?driveItems.find(x=>x.id===driveFolderId):null;
 return hdr('My Files','Folders, notes, slides, documents and lecture videos')+
 `<div class="drive-tools"><button class="btn primary" data-act="driveUpload">${ic('plus',17)} Upload files</button><button class="btn" data-act="driveFolder">＋ New folder</button>${driveFolderId?'<button class="btn" data-act="driveUp">← Back</button>':''}</div>
 <div class="note-box">Files are stored in your Google Drive. Choose a file to preview it inside Study Planner. Large uploads depend on your connection and available Drive storage.</div>
 <div class="drive-breadcrumb">My Drive ${folder?' / '+esc(folder.name):''}</div>
 <div class="panel">${driveLoading?'<div class="empty"><span class="spinner"></span> Loading your Drive…</div>':driveItems.length?driveItems.map(f=>`<div class="row drive-row"><div class="file-symbol">${f.mimeType==='application/vnd.google-apps.folder'?'📁':'📄'}</div><div class="grow"><div class="t">${esc(f.name)}</div><div class="m">${f.mimeType==='application/vnd.google-apps.folder'?'Folder':esc(f.mimeType||'File')} · ${f.modifiedTime?new Date(f.modifiedTime).toLocaleDateString():''}</div></div><button class="btn" data-act="driveOpen" data-id="${f.id}">Open</button><button class="iconbtn" data-act="driveDelete" data-id="${f.id}" aria-label="Delete ${esc(f.name)}">${ic('trash',17)}</button></div>`).join(''):'<div class="empty">This folder is empty. Upload your first study file or create a folder.</div>'}</div>
 <p class="hist-n">Preview support depends on the file type. PDFs, images, audio and video can be previewed in-browser; Office documents use Google Drive's embedded preview.</p>`;
}
const DriveFiles={
 async load(){if(!SM.on||driveLoading)return;driveLoading=true;driveLoaded=false;if(ui.route==='files')render();try{const parent=driveFolderId||'root';const q=encodeURIComponent(`'${parent}' in parents and trashed=false`);const r=await Sync.api(`https://www.googleapis.com/drive/v3/files?q=${q}&pageSize=100&orderBy=folder,name&fields=files(id,name,mimeType,modifiedTime,size,webViewLink,parents)`);const j=await r.json();driveItems=j.files||[];driveLoaded=true}catch(e){toast('Could not load Google Drive: '+(e.message||e))}finally{driveLoading=false;if(ui.route==='files')render()}},
 async folder(){if(!SM.on){toast('Sign in with Google first');return}const name=prompt('Name this study folder');if(!name||!name.trim())return;try{await Sync.api('https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:name.trim(),mimeType:'application/vnd.google-apps.folder',parents:[driveFolderId||'root']})});toast('Folder created');await this.load()}catch(e){toast('Folder creation failed: '+e.message)}},
 async upload(files){if(!SM.on){toast('Sign in with Google first');return}for(const file of files){try{toast('Uploading '+file.name+'…');const meta={name:file.name,parents:[driveFolderId||'root']};const start=await Sync.api('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name',{method:'POST',headers:{'Content-Type':'application/json; charset=UTF-8','X-Upload-Content-Type':file.type||'application/octet-stream','X-Upload-Content-Length':String(file.size)},body:JSON.stringify(meta)});const uploadUrl=start.headers.get('Location');if(!uploadUrl)throw new Error('Google did not return an upload address');await Sync.api(uploadUrl,{method:'PUT',headers:{'Content-Type':file.type||'application/octet-stream'},body:file});}catch(e){toast('Upload failed for '+file.name+': '+e.message);break}}toast('Upload finished');await this.load()},
 async remove(id){const f=driveItems.find(x=>x.id===id);if(!f)return;if(!confirm(`Move “${f.name}” to Drive trash?`))return;try{await Sync.api(`https://www.googleapis.com/drive/v3/files/${id}`,{method:'DELETE'});toast('Moved to Drive trash');await this.load()}catch(e){toast('Could not delete file: '+e.message)}},
 open(id){const f=driveItems.find(x=>x.id===id);if(!f)return;if(f.mimeType==='application/vnd.google-apps.folder'){driveFolderId=f.id;this.load();return}$('#viewerTitle').textContent=f.name;$('#viewerFrame').src=`https://drive.google.com/file/d/${encodeURIComponent(f.id)}/preview`;$('#driveViewer').hidden=false;document.body.classList.add('viewer-open')},
 close(){ $('#viewerFrame').src='about:blank';$('#driveViewer').hidden=true;document.body.classList.remove('viewer-open')}
};

/* ---------- render + data ---------- */
const VIEWS={today:vToday,tasks:vTasks,calendar:vCalendar,focus:vFocus,timetable:vTimetable,study:vStudy,habits:vHabits,notes:vNotes,files:vFiles,reminders:vReminders,insights:vInsights,prefs:vPrefs,more:vMore};
function render(){const m=$('#main'),y=window.scrollY;m.innerHTML=(VIEWS[ui.route]||vToday)();drawNav();if(ui.keepScroll){window.scrollTo(0,y);ui.keepScroll=false}}
function go(r){ui.route=VIEWS[r]?r:'today';render();if(ui.route==='files'&&SM.on)DriveFiles.load();window.scrollTo(0,0);try{location.hash=ui.route}catch(e){}}
function restoreRouteFromHistory(){const r=(location.hash||'').slice(1);if(VIEWS[r]&&r!==ui.route){ui.route=r;render();window.scrollTo(0,0);if(ui.route==='files'&&SM.on)DriveFiles.load()}}
window.addEventListener('hashchange',restoreRouteFromHistory);window.addEventListener('popstate',restoreRouteFromHistory);
function applyTheme(){const t=S.settings.theme,r=document.documentElement;if(t==='system')r.removeAttribute('data-theme');else r.setAttribute('data-theme',t)}
function exportJson(){return JSON.stringify({app:'Study Planner',exported:new Date().toISOString(),data:S},null,1)}
function dl(name,text,mime){try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:mime}));a.download=name;document.body.appendChild(a);a.click();a.remove()}catch(e){}}
function rmExamples(){['subjects','exams','tasks','blocks','habits','notes'].forEach(k=>S[k]=S[k].filter(x=>!x.example));save();render();toast('Examples removed')}
function icsText(){const n=Date.now(),l=triggersBetween(n,n+30*864e5);const f=ts=>new Date(ts).toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');const e=s=>String(s).replace(/([,;\\])/g,'\\$1').replace(/\n/g,'\\n');
 return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Study Planner//EN',...l.flatMap(t=>['BEGIN:VEVENT',`UID:${t.key}@dayplanner`,`DTSTAMP:${f(n)}`,`DTSTART:${f(t.ts)}`,`DTEND:${f(t.ts+9e5)}`,`SUMMARY:${e(t.title)}`,`DESCRIPTION:${e(t.body)}`,'BEGIN:VALARM','TRIGGER:PT0S','ACTION:DISPLAY',`DESCRIPTION:${e(t.title)}`,'END:VALARM','END:VEVENT']),'END:VCALENDAR'].join('\r\n')}
function openItem(type,id,d){if(type==='task')openTask(id);else if(type==='block')openBlock(id,d);else if(type==='exam')openExam(id);else if(type==='plan')openPlan(id);else if(type==='rem')openReminder(id)}

/* ---------- actions ---------- */
const A={
 openGemini:()=>Gem.open(),closeGemini:()=>Gem.close(),gSend:()=>Gem.send(),gMic:()=>Gem.mic(),gSpeak:()=>Gem.toggleSpeak(),gTalk:()=>Gem.toggleTalk(),gNew:()=>Gem.reset(),gKey:()=>Gem.keySheet(),gSaveKey:()=>Gem.saveKey(),gClearKey:()=>Gem.clearKey(),
 gAttach:()=>Gem.attachMenu(),gDevice:()=>{closeSheet();$('#gemFileInput').click()},gDrive:()=>Gem.pickerOpen(),gRm:el=>Gem.rmAtt(+el.dataset.i),
 gpFolder:el=>Gem.pickerFolder(el.dataset.id),gpFile:el=>Gem.pickerFile(el.dataset.id),gpBack:()=>Gem.pickerBack(),gpSignIn:()=>{closeSheet();Sync.signIn()},
 go:el=>go(el.dataset.r),closeSheet:()=>closeSheet(),closeConf:()=>closeConfirm(),
 seg:el=>{const p=el.parentElement;if(p.dataset.multi)el.classList.toggle('on');else{$$('.chip',p).forEach(c=>c.classList.remove('on'));el.classList.add('on')}sheetEl?.dispatchEvent(new CustomEvent('segchange',{detail:p.dataset.seg}))},
 quickAdd:()=>quickAdd(),addTask:()=>openTask(null),editTask:el=>openTask(el.dataset.id),toggleTask:el=>toggleTask(el.dataset.id,!!el.dataset.undo),
 postpone:el=>postponeSheet(el.dataset.id),mv:el=>window.__mv(el.dataset.d),mvPick:()=>{const v=F('pd').value;if(v)window.__mv(v)},
 togNag:el=>{el.classList.toggle('on');el.setAttribute('aria-checked',el.classList.contains('on'))},
 addSub:()=>addSub(),subTog:el=>{ctx.subs[+el.dataset.i].d=!ctx.subs[+el.dataset.i].d;drawSubs()},subDel:el=>{ctx.subs.splice(+el.dataset.i,1);drawSubs()},saveTask:()=>saveTask(),
 delTask:el=>confirmBox('Delete this task? This cannot be undone.','Delete',()=>{S.tasks=S.tasks.filter(t=>t.id!==el.dataset.id);save();closeSheet();render();toast('Task deleted')}),
 tf:el=>{ui.tf[el.dataset.k]=el.dataset.v;render()},
 addBlock:()=>openBlock(null,ui.tt||today()),editBlock:el=>openBlock(el.dataset.id,ui.tt),saveBlock:()=>saveBlock(),
 delBlock:el=>confirmBox('Delete this activity, including all its repeats?','Delete',()=>{S.blocks=S.blocks.filter(b=>b.id!==el.dataset.id);save();closeSheet();render()}),
 togBlock:el=>{const b=S.blocks.find(x=>x.id===el.dataset.id);b.doneDates=b.doneDates||{};b.doneDates[el.dataset.d]=!b.doneDates[el.dataset.d];save();render()},
 ttShift:el=>{ui.tt=addDays(ui.tt||today(),+el.dataset.n);render()},ttToday:()=>{ui.tt=today();render()},
 calShift:el=>{const n=+el.dataset.n;if(ui.calView==='month'){const d=parseD(ui.calAnchor);d.setMonth(d.getMonth()+n);ui.calAnchor=dStr(d)}else{ui.calDate=addDays(ui.calDate,n*(ui.calView==='week'?7:1))}render()},
 calPick:el=>{ui.calDate=el.dataset.d;ui.calAnchor=ui.calDate.slice(0,7)+'-01';if(ui.calView==='week')ui.calView='day';ui.keepScroll=true;render()},calView:el=>{ui.calView=el.dataset.v;render()},calToday:()=>{ui.calDate=today();ui.calAnchor=today().slice(0,7)+'-01';render()},
 calTomorrow:()=>{ui.calView='day';ui.calDate=addDays(today(),1);ui.calAnchor=ui.calDate.slice(0,7)+'-01';render()},calAdd:()=>quickAdd({date:ui.calDate}),
 openItem:el=>openItem(el.dataset.type,el.dataset.id,el.dataset.d),
 qd:el=>{$$('[data-act=qd]',sheetEl).forEach(c=>c.classList.remove('on'));el.classList.add('on');ctx.date=el.dataset.d},
 qSave:()=>qSave(),qMore:()=>{const title=ctx.tab==='task'?F('qtitle').value.trim():'';const date=ctx.date;const tab=ctx.tab,t=F('qtime')?.value,rt=F('rtitle')?.value,nt=F('ntext')?.value;closeSheet();if(tab==='task')openTask(null,{title,date,time:t});else if(tab==='rem')openReminder(null,{title:rt});else openNote(null,{body:nt})},
 addExam:()=>{if(!S.subjects.length){toast('Add a subject first');return}openExam(null)},saveExam:()=>{const o={subject:F('subject').value,title:F('title').value.trim(),date:F('date').value,time:F('time').value},err=$('#err',sheetEl);if(!o.title){err.textContent='Name the exam.';return}if(!o.date){err.textContent='Pick the exam date.';return}if(ctx.id)Object.assign(S.exams.find(x=>x.id===ctx.id),o);else S.exams.push({id:uid(),...o});markPast();save();closeSheet();render()},
 delExam:el=>confirmBox('Delete this exam?','Delete',()=>{S.exams=S.exams.filter(x=>x.id!==el.dataset.id);save();closeSheet();render()}),
 addSubj:()=>openSubject(null),editSubj:el=>{openSubject(el.dataset.id)},subjOpen:el=>{ui.subjOpen=ui.subjOpen===el.dataset.id?'':el.dataset.id;ui.keepScroll=true;render()},
 saveSubj:()=>{const name=F('name').value.trim(),err=$('#err',sheetEl);if(!name){err.textContent='Name the subject.';return}const color=segVal('col')||SUBJ_COL[0];if(ctx.id)Object.assign(subjOf(ctx.id),{name,color});else S.subjects.push({id:uid(),name,color});save();closeSheet();render()},
 delSubj:el=>confirmBox('Delete this subject? Its tasks stay, but lose the subject tag.','Delete',()=>{S.subjects=S.subjects.filter(s=>s.id!==el.dataset.id);S.tasks.forEach(t=>{if(t.subject===el.dataset.id)t.subject=''});S.exams=S.exams.filter(e=>e.subject!==el.dataset.id);save();closeSheet();render()}),
 addTaskFor:el=>openTask(null,{subject:el.dataset.id,cat:'study'}),
 addPlan:()=>openPlan(null),editPlan:el=>openPlan(el.dataset.id),savePlan:()=>{const min=Number(F('min').value),date=F('date').value,err=$('#err',sheetEl);if(!date){err.textContent='Pick a date.';return}if(!(min>=5&&min<=480)){err.textContent='Minutes must be between 5 and 480.';return}const o={subject:F('subject').value,date,min,note:F('note').value.trim()};if(ctx.id)Object.assign(S.plans.find(x=>x.id===ctx.id),o);else S.plans.push({id:uid(),done:false,...o});save();closeSheet();render()},
 delPlan:el=>confirmBox('Delete this planned session?','Delete',()=>{S.plans=S.plans.filter(x=>x.id!==el.dataset.id);save();closeSheet();render()}),togPlan:el=>{const p=S.plans.find(x=>x.id===el.dataset.id);p.done=!p.done;save();render()},
 startPlan:el=>{const p=S.plans.find(x=>x.id===el.dataset.id);ui.fs.subject=p.subject;ui.fs.min=[25,45,50,60,90].includes(p.min)?p.min:'custom';ui.fs.custom=p.min;go('focus')},
 addHabit:()=>openHabit(null),editHabit:el=>openHabit(el.dataset.id),saveHabit:()=>{const name=F('name').value.trim();if(!name){$('#err',sheetEl).textContent='Name the habit.';return}if(ctx.id)S.habits.find(h=>h.id===ctx.id).name=name;else S.habits.push({id:uid(),name,log:{}});save();closeSheet();render()},
 delHabit:el=>confirmBox('Delete this habit and its history?','Delete',()=>{S.habits=S.habits.filter(h=>h.id!==el.dataset.id);save();closeSheet();render()}),
 togHabit:el=>{const h=S.habits.find(x=>x.id===el.dataset.id),d=el.dataset.d;h.log[d]=!h.log[d];if(!h.log[d])delete h.log[d];save();ui.keepScroll=true;render()},habSel:el=>{ui.habSel=el.dataset.id;ui.keepScroll=true;render()},
 addNote:()=>openNote(null),editNote:el=>openNote(el.dataset.id),togPin:el=>el.classList.toggle('on'),
 saveNote:()=>{const o={title:F('title').value.trim(),body:F('body').value.trim(),kind:segVal('kind')||'text',pinned:$('#pinSw',sheetEl).classList.contains('on')};if(!o.title&&!o.body){$('#err',sheetEl).textContent='Write something first.';return}if(ctx.id)Object.assign(S.notes.find(x=>x.id===ctx.id),o);else S.notes.unshift({id:uid(),created:Date.now(),...o});save();closeSheet();render()},
 delNote:el=>confirmBox('Delete this note?','Delete',()=>{S.notes=S.notes.filter(n=>n.id!==el.dataset.id);save();closeSheet();render()}),
 note2task:el=>{const n=S.notes.find(x=>x.id===el.dataset.id);const title=(n.title||n.body.split('\n')[0]).replace(/^\[[ xX]\]\s*/,'').slice(0,140);closeSheet();openTask(null,{title,desc:n.title?n.body:'',date:today()})},
 noteLine:(el,ev)=>{ev.stopPropagation();const n=S.notes.find(x=>x.id===el.dataset.id),ls=n.body.split('\n').filter(Boolean),i=+el.dataset.i;ls[i]=/^\[x\]/i.test(ls[i])?ls[i].replace(/^\[x\]/i,'[ ]'):/^\[ \]/.test(ls[i])?ls[i].replace('[ ]','[x]'):'[x] '+ls[i];n.body=ls.join('\n');save();$('#nlist').innerHTML=noteListHtml()},
 capture:()=>{const i=$('#nq'),v=i.value.trim();if(!v)return;S.notes.unshift({id:uid(),title:'',body:v,kind:'text',pinned:false,created:Date.now()});save();render();toast('Captured');$('#nq')?.focus()},
 addRem:()=>openReminder(null),editRem:el=>openReminder(el.dataset.id),saveRem:()=>saveRem(),delRem:el=>confirmBox('Delete this reminder?','Delete',()=>{S.reminders=S.reminders.filter(r=>r.id!==el.dataset.id);save();closeSheet();render()}),delRemAsk:el=>confirmBox('Delete this reminder?','Delete',()=>{S.reminders=S.reminders.filter(r=>r.id!==el.dataset.id);save();render()}),
 togRem:el=>{const r=S.reminders.find(x=>x.id===el.dataset.id);r.enabled=!r.enabled;markPast();save();render()},remTab:el=>{ui.remTab=el.dataset.v;render()},
 snoozeLog:el=>snooze(el.dataset.id,10),doneLog:el=>{toggleTask(el.dataset.id)},
 askPerm:()=>{try{const r=Notification.requestPermission();(r&&r.then?r:Promise.resolve(r)).then(()=>render())}catch(e){toast('This view cannot ask for notifications. Open the hosted app.')}},
 install:()=>{installEv?.prompt();installEv=null;render()},ics:()=>{dl('study-planner-reminders.ics',icsText(),'text/calendar');toast('If nothing downloaded, open the hosted app and try again.')},
 rmExamples:()=>rmExamples(),
 syncSignIn:()=>Sync.signIn(),syncNow:()=>Sync.run(true),syncSetup:()=>Sync.showSetup(),syncResolve:()=>Sync.showConflict(),syncKeepLocal:()=>Sync.keepLocal(),syncUseCloud:()=>Sync.useCloud(),
 syncOut:()=>confirmBox('Log out of Google on this device? Your planner data stays on this device and in your Drive.','Log out',()=>{localStorage.removeItem('studyplanner.guest');Sync.signOut();location.href='logout.html?done=1';},0,false),
 loginGoogle:()=>Sync.signIn(),continueGuest:()=>{localStorage.setItem('studyplanner.guest','1');hideLoginGate();},logout:()=>confirmBox('Log out of your Google account on this device? Your local planner data and Drive files will not be deleted.','Log out',()=>{localStorage.removeItem('studyplanner.guest');Sync.signOut();location.href='logout.html?done=1';},0,false),
 driveFolder:()=>DriveFiles.folder(),driveUpload:()=>$('#driveFileInput').click(),driveUp:()=>{driveFolderId='';DriveFiles.load()},driveOpen:el=>DriveFiles.open(el.dataset.id),driveDelete:el=>DriveFiles.remove(el.dataset.id),closeViewer:()=>DriveFiles.close(),
 syncDelCloud:()=>confirmBox('Delete the copy in Google Drive? Data on this device is not affected, and other devices keep their own copies.','Delete cloud copy',()=>Sync.delCloud()),
 togSound:el=>{S.settings.sound=!S.settings.sound;save();render()},
 addCat:()=>{S.cats.push({id:uid(),name:'New category',color:'#6B7C93'});save();render()},delCat:el=>{if(S.cats.length<=1){toast('Keep at least one category');return}confirmBox('Delete this category? Its tasks move to the last category.','Delete',()=>{S.cats=S.cats.filter(c=>c.id!==el.dataset.id);const fb=S.cats[S.cats.length-1].id;S.tasks.forEach(t=>{if(t.cat===el.dataset.id)t.cat=fb});save();render()})},
 exportData:()=>{const j=exportJson();openSheet('Backup',`<p style="margin:0 0 10px">Copy this text and keep it somewhere safe, or download it as a file. Restore it later from Settings.</p><textarea class="in" id="bk" style="min-height:160px;font-family:var(--f-mono);font-size:12px" readonly>${esc(j)}</textarea><div class="btns" style="margin-top:10px"><button class="btn primary" data-act="copyBk">Copy</button><button class="btn" data-act="dlBk">Download file</button></div><div class="hist-n">Downloads may be blocked inside a preview. Copying always works.</div>`)},
 copyBk:()=>{const t=$('#bk');try{navigator.clipboard.writeText(t.value).then(()=>toast('Copied'),()=>{t.select();toast('Select and copy the text')})}catch(e){t.select();toast('Select and copy the text')}},dlBk:()=>{dl(`study-planner-backup-${today()}.json`,exportJson(),'application/json')},
 importData:()=>openSheet('Restore from backup',`<p style="margin:0 0 10px">This replaces everything currently in the app.</p><input type="file" accept=".json,application/json" id="bkfile" class="in"><div class="fld" style="margin-top:10px"><span>Or paste the backup text</span><textarea class="in" id="bkpaste" style="min-height:120px"></textarea></div><div class="err" id="err"></div><button class="btn primary block" data-act="doImport">Restore</button>`,w=>{$('#bkfile',w).addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{$('#bkpaste',w).value=String(r.result)};r.readAsText(f)})}),
 doImport:()=>{const err=$('#err',sheetEl);try{const o=JSON.parse($('#bkpaste').value);const d=o.data||o;if(!d||!Array.isArray(d.tasks)||!d.settings)throw 0;confirmBox('Replace all current data with this backup?','Restore',()=>{S=merge(defaults(),d);S.timer=null;T=null;S.seeded=true;save();closeSheet();applyTheme();render();toast('Backup restored')},0,false)}catch(e){err.textContent='That does not look like a Study Planner backup.'}},
 wipe:()=>confirmBox('Delete all tasks, notes, habits, sessions and settings from this device? This cannot be undone.'+(SM.on?' Your Google Drive copy is not deleted. Use Delete cloud copy first if you want it gone.':''),'Delete everything',()=>{Sync.reset();T=null;try{localStorage.removeItem(LS);localStorage.removeItem(SEEN)}catch(e){}$('#focus')?.remove();S=defaults();S.seeded=true;S.settings.name='';save();applyTheme();ui.route='today';render();toast('All data deleted')},2),
 goal:el=>{S.settings.goalMin=+el.dataset.v;save();render()},
 fsMin:el=>{ui.fs.min=el.dataset.v==='custom'?'custom':+el.dataset.v;render()},fsStrict:()=>{ui.fs.strict=!ui.fs.strict;render()},togAutoBreak:()=>{S.settings.autoBreak=!S.settings.autoBreak;save();render()},
 togBlockApps:()=>{S.settings.block.on=!S.settings.block.on;save();render()},blkApp:el=>{const b=S.settings.block,v=el.dataset.v;b.apps=b.apps.includes(v)?b.apps.filter(x=>x!==v):[...b.apps,v];save();ui.keepScroll=true;render()},
 blkAdd:()=>{const i=$('#blkNew'),v=i.value.trim();if(v&&!S.settings.block.apps.includes(v)){S.settings.block.apps.push(v);save();ui.keepScroll=true;render()}},allowApp:el=>{const b=S.settings.block,v=el.dataset.v;b.allowed=b.allowed.includes(v)?b.allowed.filter(x=>x!==v):[...b.allowed,v];save();ui.keepScroll=true;render()},
 blkMode:el=>{S.settings.block.mode=el.dataset.v;save();ui.keepScroll=true;render()},
 startFocus:()=>startFocus(),foPause:()=>T?.runSince?pauseT():resumeT(),
 foPauseStrict:()=>confirmBox('Pause a strict session? Only pause for a real interruption.','Pause',()=>pauseT(),0,false),
 foEnd:()=>{if(!T)return;if(T.phase!=='focus'){endEarly();return}const m=`End this session now? ${dur(elapsed()/1000)} of study time will be saved.`;confirmBox(T.strict?m+' This is a strict session, so please be sure.':m,'End session',()=>endEarly(),T.strict?5:0)},
 recFull:()=>{closeSheet();if(T){T.accumMs=T.plannedMs;T.runSince=null;recordSession(T.plannedMs/1000,true);native('stopFocus',{sessionId:T.sid,reason:'complete'});endTimer();render();toast('Session recorded')}},
 recPart:el=>{closeSheet();if(T){recordSession(+el.dataset.s,false);endTimer();render();toast('Partial session recorded')}},recNone:()=>{closeSheet();endTimer();render()},
 editSess:el=>{const x=S.sessions.find(s=>s.id===el.dataset.id);openSheet('Session',`<p style="margin:0 0 10px"><b>${esc(subjOf(x.subject)?.name||'No subject')}</b> · ${dur(x.sec)} focused of ${dur(x.planned)} planned</p>${fld('Notes',`<textarea class="in" data-f="note" placeholder="What did you cover?">${esc(x.note||'')}</textarea>`)}<div class="btns"><button class="btn primary grow" data-act="saveSess" data-id="${x.id}">Save note</button><button class="btn danger" data-act="delSess" data-id="${x.id}">${ic('trash',18)}</button></div>`)},
 saveSess:el=>{S.sessions.find(s=>s.id===el.dataset.id).note=F('note').value.trim();save();closeSheet();render()},delSess:el=>confirmBox('Delete this session from your history?','Delete',()=>{S.sessions=S.sessions.filter(s=>s.id!==el.dataset.id);save();closeSheet();render()})
};
document.addEventListener('click',e=>{const el=e.target.closest('[data-act]');if(!el)return;const f=A[el.dataset.act];if(f){if(el.closest('.sheet,.fo,.hero,#main,nav,#fab,.toast')||true){f(el,e)}}});
document.addEventListener('change',e=>{const t=e.target;
 if(t.dataset.set){const k=t.dataset.set;let v=t.type==='number'||'num' in t.dataset?Number(t.value):t.value;if(t.type==='number'&&!(v>=Number(t.min||0)))return;S.settings[k]=v;save();if(k==='theme')applyTheme();if(k==='name'||k==='goalMin'||k==='theme')render()}
 else if(t.dataset.pri){S.settings.pri[t.dataset.pri]=t.value.trim()||t.dataset.pri;save()}
 else if(t.dataset.catn){catOf(t.dataset.catn).name=t.value.trim()||'Category';save()}else if(t.dataset.catc){catOf(t.dataset.catc).color=t.value;save()}
 else if(t.dataset.tf){ui.tf[t.dataset.tf]=t.value;render()}
 else if(t.dataset.fs){ui.fs[t.dataset.fs]=t.value;if(t.dataset.fs==='subject')ui.fs.task='';if(t.dataset.fs!=='custom'){ui.keepScroll=true;render()}}
 else if(t.dataset.hist){ui.hist[t.dataset.hist]=t.value;ui.keepScroll=true;render()}
 else if(t.dataset.blk){S.settings.block[t.dataset.blk]=t.value;save()}
 else if(t.dataset.sm){SM[t.dataset.sm]=t.value.trim();saveSM();Sync.refreshPanel()}});
document.addEventListener('input',e=>{const t=e.target;if(t.id==='tq'){ui.tf.q=t.value;$('#tlist').innerHTML=taskListHtml()}else if(t.id==='nsearch'){ui.noteQ=t.value;$('#nlist').innerHTML=noteListHtml()}else if(t.dataset.fs==='custom')ui.fs.custom=t.value});
document.addEventListener('input',e=>{if(e.target.id==='loginClientId'){SM.clientId=e.target.value.trim();saveSM()}});
$('#driveFileInput')?.addEventListener('change',e=>{const files=[...e.target.files];e.target.value='';if(files.length)DriveFiles.upload(files)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(confEl)closeConfirm();else if(sheetEl)closeSheet()}if(e.key==='Enter'&&e.target.id==='nq'){e.preventDefault();A.capture()}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){checkReminders();Sync.pulse();if(T&&$('#focus')){try{navigator.wakeLock?.request('screen').then(l=>wl=l).catch(()=>{})}catch(e){}tick()}}});


/* ---------- Google Drive sync (hosted app only) ---------- */
const SK='dayplanner.sync',SYNC_FILE='studyplanner-data.json',SCOPE='https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email';
let SM={clientId:'',email:'',base:0,fileId:'',on:false};
function loadSM(){try{Object.assign(SM,JSON.parse(localStorage.getItem(SK)||'{}'))}catch(e){}}
function saveSM(){try{localStorage.setItem(SK,JSON.stringify(SM))}catch(e){}}
const pristine=()=>['tasks','blocks','habits','notes','subjects','exams','plans','reminders'].every(k=>(S[k]||[]).every(x=>x.example))&&!S.sessions.length&&!S.completions.length;
const Sync=(()=>{
 let tok=null,exp=0,gis=null,busy=false,again=false,tm=null,lastRun=0,pending=null,ia=false;
 const st={state:'off',msg:'',last:0};
 const cid=()=>String(window.STUDYPLANNER_GOOGLE_CLIENT_ID||window.DAYPLANNER_GOOGLE_CLIENT_ID||'').trim()||SM.clientId;
 const avail=()=>/^https?:$/.test(location.protocol);
 const payload=()=>JSON.stringify({app:'Study Planner',v:1,modified:S.modified,data:{...S,timer:null}});
 function refreshPanel(){const el=$('#syncPanel');if(el)el.innerHTML=panelHtml()}
 function setSt(state,msg){st.state=state;st.msg=msg||'';refreshPanel();if(ui.route==='today'&&!sheetEl&&!confEl&&!T){ui.keepScroll=true;render()}}
 function panelHtml(){
  if(!avail())return `<div class="note-box amber"><b>Google sync is not available here.</b> It works once the app is hosted at its own web address. See the setup steps in the app folder.</div>`;
  const hasId=!!cid();
  if(!SM.on)return `<div class="note-box"><b>Keep your data in your own Google Drive.</b> Sign in once on each device and your tasks, notes, habits and study history stay the same everywhere. The data goes into a hidden app folder in your Drive that only Study Planner can open.</div>
   ${hasId?'':`<div class="fld"><span>Google client ID</span><input class="in" data-sm="clientId" value="${esc(SM.clientId)}" placeholder="123456-abc.apps.googleusercontent.com" autocomplete="off" spellcheck="false"></div>`}
   ${st.msg?`<div class="err">${esc(st.msg)}</div>`:''}
   <div class="btns"><button class="btn primary" data-act="syncSignIn" ${hasId?'':'disabled'}>Sign in with Google</button><button class="btn" data-act="syncSetup">Setup steps</button></div>`;
  const label={idle:'Up to date',syncing:'Syncing',error:'Sync problem',needsSignin:'Sign in again to continue',conflict:'Needs your decision',off:'Connected'}[st.state]||'';
  const main=st.state==='needsSignin'?'<button class="btn primary" data-act="syncSignIn">Sign in again</button>':st.state==='conflict'?'<button class="btn primary" data-act="syncResolve">Choose a copy</button>':'<button class="btn primary" data-act="syncNow">Sync now</button>';
  return `<div class="panel"><div class="row"><div class="grow"><div class="t">${esc(SM.email||'Google account')}</div><div class="m"><span class="pill ${st.state==='idle'?'lo':st.state==='error'||st.state==='conflict'?'hi':st.state==='needsSignin'?'md':''}">${label}</span>${st.last?`<span>Last synced ${new Date(st.last).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}</span>`:''}</div>${st.msg?`<div class="m warn">${esc(st.msg)}</div>`:''}</div></div></div>
   <div class="btns" style="margin-top:10px">${main}<button class="btn" data-act="syncOut">Sign out</button><button class="btn danger" data-act="syncDelCloud">Delete cloud copy</button></div>
   <div class="hist-n">Changes upload a few seconds after you make them and download when you open the app on another device. If you edit on two devices while offline, you choose which copy to keep.</div>`}
 function loadGis(){if(window.google&&google.accounts&&google.accounts.oauth2)return Promise.resolve();if(gis)return gis;
  gis=new Promise((res,rej)=>{const sc=document.createElement('script');sc.src='https://accounts.google.com/gsi/client';sc.async=true;sc.onload=()=>res();sc.onerror=()=>{gis=null;rej(new Error('Google sign-in could not load. This is expected in a preview, and when you are offline. Use the hosted app with an internet connection.'))};document.head.appendChild(sc)});return gis}
 function getToken(interactive){if(tok&&Date.now()<exp-6e4)return Promise.resolve(tok);
  const ask=()=>new Promise((res,rej)=>{let to=null;if(!interactive)to=setTimeout(()=>rej(new Error('timeout')),20000);
   if(!cid()){rej(new Error('invalid_client: no client ID'));return}
   const c=google.accounts.oauth2.initTokenClient({client_id:cid(),scope:SCOPE,
    callback:r=>{clearTimeout(to);if(r.error)rej(new Error(r.error+(r.error_description?': '+r.error_description:'')));else{tok=r.access_token;exp=Date.now()+(Number(r.expires_in)||3600)*1000;res(tok)}},
    error_callback:e=>{clearTimeout(to);rej(new Error((e&&e.type)||'popup_failed'))}});
   const o={};if(SM.email)o.login_hint=SM.email;if(!interactive)o.prompt='';c.requestAccessToken(o)});
  // If Google's script is already loaded, open the popup synchronously inside the click so browsers do not block it.
  return (window.google&&google.accounts&&google.accounts.oauth2)?ask():loadGis().then(ask)}
 async function api(url,o={}){const go=async()=>{const t=await getToken(ia);return fetch(url,{...o,headers:{...(o.headers||{}),Authorization:'Bearer '+t}})};
  let r=await go();if(r.status===401){tok=null;r=await go()}
  if(!r.ok){const e=new Error('Google Drive error '+r.status);e.status=r.status;throw e}return r}
 async function findFile(){const r=await api('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&pageSize=1&fields=files(id,modifiedTime)&q='+encodeURIComponent(`name='${SYNC_FILE}'`));const j=await r.json();return (j.files||[])[0]||null}
 async function readFile(id){return (await api(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`)).json()}
 async function writeFile(id,body){
  if(id){await api(`https://www.googleapis.com/upload/drive/v3/files/${id}?uploadType=media`,{method:'PATCH',headers:{'Content-Type':'application/json'},body});return id}
  const b='dpb'+uid(),meta=JSON.stringify({name:SYNC_FILE,parents:['appDataFolder']});
  const mp=`--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${b}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${b}--`;
  const r=await api('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+b},body:mp});return (await r.json()).id}
 function pull(rem){const t=S.timer;S=merge(defaults(),rem.data||{});S.timer=t;S.modified=Number(rem.modified)||Date.now();S.seeded=true;save(true);applyTheme();render()}
 function fail(e){const m=String((e&&e.message)||e);
  if(/popup|access_denied|interaction|immediate|timeout|login_required|consent/i.test(m))setSt('needsSignin','Google needs you to sign in again.');
  else if(e&&e.status===403)setSt('error','Google Drive refused the request. Check that the Drive API is enabled and that you allowed access to app data.');
  else if(!navigator.onLine||/Failed to fetch|NetworkError|Load failed/i.test(m))setSt('error','You are offline. Changes will sync when you are back online.');
  else setSt('error',m)}
 async function run(manual){
  if(!SM.on||!cid()||!avail())return;
  if(sheetEl||confEl){clearTimeout(tm);tm=setTimeout(run,15000);return}
  if(busy){again=true;return}
  busy=true;ia=!!manual;lastRun=Date.now();setSt('syncing');let cf=false;
  try{const f=await findFile();
   if(!f){const m=S.modified;SM.fileId=await writeFile('',payload());SM.base=m}
   else{SM.fileId=f.id;const rem=await readFile(f.id),rm=Number(rem.modified)||0;
    if(rm===S.modified)SM.base=rm;
    else if(SM.base&&rm===SM.base&&S.modified>SM.base){const m=S.modified;await writeFile(f.id,payload());SM.base=m}
    else if((SM.base&&S.modified===SM.base&&rm>SM.base)||(!SM.base&&pristine())){pull(rem);SM.base=rm}
    else{pending=rem;cf=true}}
   saveSM();
   if(cf){setSt('conflict','This device and Google Drive both have changes.');showConflict()}else{st.last=Date.now();setSt('idle')}
  }catch(e){fail(e)}finally{busy=false;ia=false;if(again){again=false;queue()}}}
 function queue(){if(!SM.on)return;clearTimeout(tm);tm=setTimeout(run,4000)}
 function pulse(force){if(!SM.on||st.state==='conflict')return;if(!force&&Date.now()-lastRun<30000)return;run()}
 function showConflict(){const rem=pending;if(!rem)return;const c=d=>`${(d.tasks||[]).length} tasks, ${(d.notes||[]).length} notes, ${(d.habits||[]).length} habits, ${(d.sessions||[]).length} study sessions`;
  openSheet('Which copy do you want to keep?',`<p style="margin:0 0 12px">Both this device and your Google Drive changed since they last matched. Pick one. The other one is replaced.</p>
  <div class="panel"><div class="row"><div class="grow"><div class="t">Google Drive copy</div><div class="m">${c(rem.data||{})}<br>Saved ${new Date(rem.modified).toLocaleString()}</div></div></div><div class="row"><div class="grow"><div class="t">This device</div><div class="m">${c(S)}<br>Edited ${new Date(S.modified).toLocaleString()}</div></div></div></div>
  <div class="btns" style="margin-top:12px;flex-direction:column;align-items:stretch"><button class="btn primary" data-act="syncUseCloud">Use the Google Drive copy</button><button class="btn" data-act="syncKeepLocal">Keep this device's copy</button></div>
  <div class="hist-n">Not sure? Close this, export a backup from Settings, then come back.</div>`)}
 function useCloud(){if(!pending)return;const rem=pending;pending=null;pull(rem);SM.base=Number(rem.modified)||S.modified;saveSM();closeSheet();st.last=Date.now();setSt('idle');toast('Loaded the Google Drive copy')}
 async function keepLocal(){closeSheet();pending=null;busy=true;ia=true;setSt('syncing');try{const m=S.modified;await writeFile(SM.fileId||(await findFile())?.id||'',payload());SM.base=m;saveSM();st.last=Date.now();setSt('idle');toast('Google Drive now matches this device')}catch(e){fail(e)}finally{busy=false;ia=false}}
 async function signIn(){if(!avail()){toast('Open the hosted app to sign in');return}if(!cid()){showSetup();return}
  try{setSt('syncing','');await getToken(true);const r=await fetch('https://www.googleapis.com/oauth2/v3/userinfo',{headers:{Authorization:'Bearer '+tok}});const u=r.ok?await r.json():{};SM.email=u.email||SM.email||'';SM.on=true;saveSM();localStorage.removeItem('studyplanner.guest');hideLoginGate();await run(true)}
  catch(e){const m=String((e&&e.message)||e);const msg=/popup_failed_to_open/.test(m)?'Your browser blocked the Google sign-in popup. Allow popups for this site, then try again.':/access_denied/.test(m)?'Access was denied. If the app is in Testing mode, add your Google account as a test user (or publish the app).':/popup_closed/.test(m)?'The sign-in window was closed. If Google showed an error such as origin_mismatch, add '+location.origin+' under Authorized JavaScript origins for this client ID.':/redirect|origin|invalid_client|unauthorized_client|idpiframe|400/i.test(m)?'Google rejected this web address or client ID ('+location.origin+'). Check the setup steps.':m;setSt(SM.on?'needsSignin':'off',msg);const le=$('#loginError');if(le)le.textContent=msg}}
 function reset(){try{if(tok&&window.google&&google.accounts&&google.accounts.oauth2)google.accounts.oauth2.revoke(tok,()=>{})}catch(e){}tok=null;exp=0;pending=null;clearTimeout(tm);SM.on=false;SM.email='';SM.base=0;SM.fileId='';saveSM();st.state='off';st.msg=''}
 function signOut(){reset();refreshPanel();toast('Signed out. Your data stays on this device.');}
 async function delCloud(){ia=true;try{const f=await findFile();if(f)await api(`https://www.googleapis.com/drive/v3/files/${f.id}`,{method:'DELETE'});SM.base=0;SM.fileId='';saveSM();setSt('idle','');toast('Cloud copy deleted. The next sync uploads a fresh one.')}catch(e){fail(e)}finally{ia=false}}
 function showSetup(){openSheet('Set up Google sync',`<p style="margin:0 0 10px">You do this once, and it is free. Google needs to know this app exists before it lets you sign in.</p>
  <ol style="margin:0 0 12px;padding-left:20px;display:flex;flex-direction:column;gap:8px">
  <li>Open <b>console.cloud.google.com</b> and create a project called Study Planner.</li>
  <li>Go to <b>APIs and services, Library</b>, search for <b>Google Drive API</b> and click Enable.</li>
  <li>Open the <b>OAuth consent screen</b> (Google Auth Platform). Choose External, name it Study Planner and add your email. Add the scopes <b>drive.appdata</b>, <b>drive.file</b> and <b>userinfo.email</b>, then publish the app to Production. These scopes need no Google review. In Testing mode you must add your own email as a test user, and Google asks you to sign in again every 7 days.</li>
  <li>Go to <b>Credentials, Create credentials, OAuth client ID</b> and choose <b>Web application</b>. Under Authorized JavaScript origins add this exact address:<br><span class="mono" style="user-select:all;overflow-wrap:anywhere">${esc(location.origin)}</span></li>
  <li>Copy the Client ID. Paste it into <b>config.js</b> in the app folder and upload again, or paste it into the box under Settings on each device.</li></ol>`)}
 if(avail()&&cid())setTimeout(()=>loadGis().catch(()=>{}),400);
 return{st,run,queue,pulse,reset,signIn,signOut,delCloud,showConflict,useCloud,keepLocal,refreshPanel,panelHtml,showSetup,avail,cid,api,getToken}
})();

/* ---------- Gemini side panel ---------- */
const Gem=(()=>{
 const KEYLS='studyplanner.gemkey',MAXF=15*1024*1024,MAXALL=18*1024*1024;
 let found=null;
 const verOf=n=>{const m=/gemini-(\d+(?:\.\d+)?)/.exec(n);return m?parseFloat(m[1]):0};
 // Ask Google which models this key can use, and prefer the newest plain "flash" model.
 async function discover(key){if(found)return found;try{const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200',{headers:{'x-goog-api-key':key}});if(!r.ok)return [];const j=await r.json();
   const ok=(j.models||[]).filter(m=>(m.supportedGenerationMethods||[]).includes('generateContent')).map(m=>m.name.replace(/^models\//,'')).filter(n=>/^gemini-/.test(n)&&!/(lite|image|tts|live|audio|embed|thinking|robotics|computer|learnlm|vision)/i.test(n));
   const rank=n=>verOf(n)*10+(/flash/.test(n)?5:0)+(/preview|exp/.test(n)?-3:0)+(/latest/.test(n)?-1:0);
   const fl=ok.filter(n=>/flash/.test(n));found=(fl.length?fl:ok).sort((x,y)=>rank(y)-rank(x)).slice(0,4)}catch(e){found=[]}return found}
 async function models(key){const cfg=String(window.STUDYPLANNER_GEMINI_MODEL||'').trim();const d=await discover(key);return [...new Set([cfg,...d,'gemini-3.8-flash','gemini-flash-latest','gemini-2.5-flash'].filter(Boolean))]}
 const getKey=()=>{let k=String(window.STUDYPLANNER_GEMINI_API_KEY||'').trim();if(k)return k;try{return localStorage.getItem(KEYLS)||''}catch(e){return ''}};
 const OK_MIME=/^(application\/pdf|image\/(png|jpe?g|webp|heic|heif|gif)|text\/.+|application\/json|audio\/.+|video\/.+)$/i;
 /* Markdown + LaTeX renderer. Maths is pulled out first so markdown rules cannot damage it, then typeset with KaTeX. */
 const KV='0.16.9',KB='https://cdnjs.cloudflare.com/ajax/libs/KaTeX/'+KV+'/';let kState=0;
 function loadKatex(){if(kState)return;kState=1;try{const l=document.createElement('link');l.rel='stylesheet';l.href=KB+'katex.min.css';document.head.appendChild(l);
   const sc=document.createElement('script');sc.src=KB+'katex.min.js';sc.async=true;sc.onload=()=>{kState=2;draw()};sc.onerror=()=>{kState=3};document.head.appendChild(sc)}catch(e){kState=3}}
 const mdHtml=t=>{const hold=[];const keep=h=>{hold.push(h);return '\u0000'+(hold.length-1)+'\u0000'};let x=String(t);
  x=x.replace(/```[\w-]*\n?([\s\S]*?)```/g,(m,c)=>keep(`<pre><code>${esc(c.replace(/\n$/,''))}</code></pre>`));
  x=x.replace(/`([^`\n]+)`/g,(m,c)=>keep(`<code>${esc(c)}</code>`));
  let hasMath=false;const math=(tex,disp)=>{hasMath=true;const raw=(disp?'$$':'$')+tex+(disp?'$$':'$');
   return keep(kState===2&&window.katex?(()=>{try{return window.katex.renderToString(tex,{displayMode:disp,throwOnError:false,output:'html'})}catch(e){return esc(raw)}})():`<span class="tex-raw">${esc(raw)}</span>`)};
  x=x.replace(/\$\$([\s\S]+?)\$\$/g,(m,c)=>math(c.trim(),true)).replace(/\\\[([\s\S]+?)\\\]/g,(m,c)=>math(c.trim(),true)).replace(/\\\(([\s\S]+?)\\\)/g,(m,c)=>math(c.trim(),false))
   .replace(/(^|[^\\$\w])\$(?!\s)([^$\n]+?)(?<!\s)\$(?![\d$])/g,(m,p,c)=>p+math(c,false));
  if(hasMath&&!kState)loadKatex();
  let h=esc(x);
  h=h.replace(/^\s*(?:-{3,}|\*{3,})\s*$/gm,'<hr>').replace(/^#{1,4}\s*(.+)$/gm,'<b>$1</b>').replace(/^(\s*)[*-]\s+(.+)$/gm,'$1• $2')
   .replace(/\*\*([^*\n]+)\*\*/g,'<b>$1</b>').replace(/(^|[^*\w])\*([^*\n]+)\*(?![*\w])/g,'$1<i>$2</i>');
  return h.replace(/\u0000(\d+)\u0000/g,(m,i)=>hold[+i])};
 const pane=()=>$('#gemPane');
 function chatLink(){const e=SM.email;return 'https://gemini.google.com/app'+(e?'?authuser='+encodeURIComponent(e):'')}
 function draw(){const p=pane();if(!p)return;
  $('#gemWho').innerHTML=SM.on&&SM.email?`<span class="pill lo" title="${esc(AIN())} uses this Google account">${esc(SM.email)}</span>`:`<button class="lnk" data-act="loginGoogle">Sign in with Google</button>`;
  const key=getKey();$('#gemSetup').innerHTML=(key||SM.on)?'':`<div class="note-box amber"><b>Sign in to chat with ${esc(AIN())}.</b> It is free and there is no API key to set up.<div class="btns" style="margin-top:8px"><button class="btn primary" data-act="loginGoogle">Sign in with Google</button></div></div>`;
  const m=$('#gemMsgs');const name=S.settings.name?esc(S.settings.name):'there';
  m.innerHTML=(G.msgs.length?G.msgs.map(x=>`<div class="gem-m ${x.role==='user'?'u':'a'}"><div class="gem-b">${x.show.files?.length?`<div class="gem-f">${x.show.files.map(f=>`<span class="pill">${ic('clip',11)} ${esc(f)}</span>`).join('')}</div>`:''}${x.role==='user'?esc(x.show.text):mdHtml(x.show.text)}</div></div>`).join('')+(G.busy&&G.msgs.at(-1)?.role!=='model'?`<div class="gem-m a"><div class="gem-b"><span class="spinner"></span> Thinking…</div></div>`:''):`<div class="gem-hello">${ic('spark',28)}<h2>Hi ${name}</h2><p>Ask ${esc(AIN())} anything while your planner stays open on the left. Tap the microphone to talk, or use the paperclip to attach a file from My Files (Google Drive) or from this device.</p></div>`)+(G.err?`<div class="gem-m a"><div class="gem-b gem-err" role="alert"><b>${esc(AIN())} could not answer.</b><br>${esc(G.err)}</div></div>`:'');
  m.scrollTop=m.scrollHeight;
  $('#gemAtt').innerHTML=G.att.map((a,i)=>`<span class="pill acc">${ic('clip',11)} ${esc(a.name)} <button class="gem-x" data-act="gRm" data-i="${i}" aria-label="Remove ${esc(a.name)}">✕</button></span>`).join('');
  voiceUI();$('#gemSend').disabled=G.busy;$('#gemOpenWeb').href=chatLink()}
 function open(){G.open=true;document.body.classList.add('g-open');pane().hidden=false;ui.keepScroll=true;render();draw();if(matchMedia('(pointer:fine)').matches)setTimeout(()=>$('#gemText')?.focus(),50)}
 function close(){stopVoice();G.open=false;document.body.classList.remove('g-open');pane().hidden=true;ui.keepScroll=true;render()}
 function reset(){if(G.busy)return;stopVoice();G.msgs=[];G.att=[];draw()}
 function saveKey(){const v=String($('#gemKeyIn')?.value||'').trim();if(!v){toast('Paste your API key first');return}try{localStorage.setItem(KEYLS,v)}catch(e){toast('Could not store the key in this browser');return}toast('Key saved on this device');draw()}
 function clearKey(){try{localStorage.removeItem(KEYLS)}catch(e){}closeSheet();draw()}
 function keySheet(){openSheet('Gemini API key',`<p style="margin:0 0 10px"><b>Optional.</b> ${esc(AIN())} already works without a key when you are signed in. Add your own key from aistudio.google.com/apikey only if you want higher limits or files up to 15 MB. The key is stored only in this browser. ${window.STUDYPLANNER_GEMINI_API_KEY?'This site also has a key set in config.js, which takes priority.':''}</p><div class="gem-keyrow"><input class="in" id="gemKeyIn" type="password" autocomplete="off" placeholder="AIza…"><button class="btn primary" data-act="gSaveKey">Save</button></div><div class="btns" style="margin-top:12px"><button class="btn danger" data-act="gClearKey">Remove saved key</button></div>`)}
 const b64=blob=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).split(',')[1]||'');r.onerror=()=>rej(new Error('Could not read the file'));r.readAsDataURL(blob)});
 const total=()=>G.att.reduce((a,x)=>a+x.size,0);
 async function addBlob(name,mime,blob){if(!OK_MIME.test(mime)){toast(`${AIN()} can't read “${name}” (${mime||'unknown type'}). Try a PDF, image, text, audio or video file.`,[],6000);return false}
  if(!getKey()&&total()+blob.size>3*1024*1024){toast(`“${name}” is too big for the built-in assistant (limit about 3 MB in total). Add your own API key with the ⚙ icon for files up to 15 MB.`,[],7000);return false}
  if(blob.size>MAXF||total()+blob.size>MAXALL){toast(`“${name}” is too large to attach (limit about 15 MB per file).`,[],5000);return false}
  G.att.push({name,mime,size:blob.size,data:await b64(blob)});draw();return true}
 async function addDevice(files){for(const f of files){try{await addBlob(f.name,f.type||'application/octet-stream',f)}catch(e){toast(e.message)}}}
 function attachMenu(){openSheet('Attach a file',`<div class="btns" style="flex-direction:column;align-items:stretch"><button class="btn" data-act="gDrive">${ic('folder',18)} From My Files (Google Drive)</button><button class="btn" data-act="gDevice">${ic('clip',18)} From this device</button></div><div class="hist-n">Supported: PDF, images, text, audio and video. Google Docs, Sheets and Slides are converted automatically.</div>`)}
 /* Drive picker */
 async function pickerLoad(){const g=G.gp;g.loading=true;pickerDraw();try{const q=encodeURIComponent(`'${g.folder||'root'}' in parents and trashed=false`);const r=await Sync.api(`https://www.googleapis.com/drive/v3/files?q=${q}&pageSize=100&orderBy=folder,name&fields=files(id,name,mimeType,size)`);g.items=(await r.json()).files||[]}catch(e){g.items=[];toast('Could not load Google Drive: '+(e.message||e))}g.loading=false;pickerDraw()}
 function pickerDraw(){const g=G.gp;const folderName=g.stack.length?g.stack[g.stack.length-1].name:'My Drive';
  openSheet('Choose a file',`<div class="drive-breadcrumb" style="margin-top:0">${g.stack.length?`<button class="lnk" data-act="gpBack">← Back</button> · `:''}${esc(folderName)}</div><div class="panel">${g.loading?'<div class="empty"><span class="spinner"></span> Loading…</div>':g.items.length?g.items.map(f=>{const fo=f.mimeType==='application/vnd.google-apps.folder';return `<button class="row tap gem-pick" data-act="${fo?'gpFolder':'gpFile'}" data-id="${f.id}"><div class="file-symbol">${fo?'📁':'📄'}</div><div class="grow"><div class="t">${esc(f.name)}</div><div class="m">${fo?'Folder':esc(f.mimeType||'File')}</div></div></button>`}).join(''):'<div class="empty">This folder is empty.</div>'}</div>`)}
 function pickerOpen(){closeSheet();if(!SM.on){openSheet('Sign in first',`<p style="margin:0 0 12px">Sign in with Google to attach files from your Drive.</p><button class="btn primary block" data-act="gpSignIn">Sign in with Google</button>`);return}G.gp={folder:'',stack:[],items:[],loading:false};pickerLoad()}
 function pickerFolder(id){const f=G.gp.items.find(x=>x.id===id);if(!f)return;G.gp.stack.push({id:G.gp.folder,name:f.name});G.gp.folder=id;pickerLoad()}
 function pickerBack(){const p=G.gp.stack.pop();G.gp.folder=p?p.id:'';pickerLoad()}
 async function pickerFile(id){const f=G.gp.items.find(x=>x.id===id);if(!f)return;closeSheet();toast('Attaching '+f.name+'…');
  try{let url,mime=f.mimeType||'';const GA='application/vnd.google-apps.';
   if(mime.startsWith(GA)){const map={document:'text/plain',spreadsheet:'text/csv',presentation:'application/pdf'};const kind=mime.slice(GA.length);if(!map[kind]){toast(`“${f.name}” can't be sent to ${AIN()}.`);return}mime=map[kind];url=`https://www.googleapis.com/drive/v3/files/${id}/export?mimeType=${encodeURIComponent(mime)}`}
   else{if(!OK_MIME.test(mime)){toast(`Gemini can't read “${f.name}” (${mime}). Try a PDF, image, text, audio or video file.`,[],6000);return}if(Number(f.size)>MAXF){toast(`“${f.name}” is too large to attach (limit about 15 MB).`,[],5000);return}url=`https://www.googleapis.com/drive/v3/files/${id}?alt=media`}
   const r=await Sync.api(url);const blob=await r.blob();if(await addBlob(f.name,mime,blob))toast('Attached '+f.name)}catch(e){toast('Could not attach: '+(e.message||e))}}
 function rmAtt(i){G.att.splice(i,1);draw()}
 const API='https://generativelanguage.googleapis.com/v1beta';
 const wait=ms=>new Promise(z=>setTimeout(z,ms));
 /* Read a Server-Sent-Events stream and report the growing text. */
 async function readStream(resp,onText){const rd=resp.body.getReader(),dec=new TextDecoder();let buf='',all='',block='';
  for(;;){const {done,value}=await rd.read();if(done)break;buf+=dec.decode(value,{stream:true});let i;
   while((i=buf.indexOf('\n'))>=0){const line=buf.slice(0,i).replace(/\r$/,'');buf=buf.slice(i+1);if(!line.startsWith('data:'))continue;const d=line.slice(5).trim();if(!d||d==='[DONE]')continue;
    let j;try{j=JSON.parse(d)}catch(e){continue}
    if(j.error)throw new Error(j.error.message||'The assistant stopped unexpectedly.');
    const t=(j.candidates?.[0]?.content?.parts||[]).map(p=>p.text||'').join('');if(t){all+=t;onText(all)}
    if(j.promptFeedback?.blockReason)block=j.promptFeedback.blockReason}}
  return{text:all,block}}
 async function openProxy(payload){let tok;try{tok=await Sync.getToken(false)}catch(e){tok=await Sync.getToken(true)}
  const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),45000);let r;
  try{r=await fetch('/api/gemini',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+tok},body:JSON.stringify(payload),signal:ctl.signal})}finally{clearTimeout(to)}
  if(r.ok)return r;const x=await r.json().catch(()=>({}));
  if(r.status===404)throw new Error('The built-in assistant is not set up on this site yet. The site owner needs to add GEMINI_API_KEY in Vercel. You can also add your own key with the ⚙ icon.');
  if(r.status===413)throw new Error('That message or file is too big. Keep files under about 3 MB, or add your own API key with the ⚙ icon for bigger files.');
  throw new Error((x.error&&x.error.message)||('The assistant returned error '+r.status))}
 async function openDirect(payload,key){let last='';
  for(const m of await models(key)){let think=true;
   for(let n=0;n<3;n++){const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),25000);let r;
    try{r=await fetch(`${API}/models/${encodeURIComponent(m)}:streamGenerateContent?alt=sse`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify(think?{...payload,generationConfig:{thinkingConfig:{thinkingBudget:0}}}:payload),signal:ctl.signal})}
    catch(e){clearTimeout(to);if(e.name==='AbortError'){last=m+' did not answer within 25 seconds';break}throw e}
    clearTimeout(to);if(r.ok)return r;
    const x=await r.json().catch(()=>({}));last=(x.error?.message||('HTTP '+r.status))+(x.error?.status?' ['+x.error.status+']':'');
    if(r.status===400&&think&&/thinking/i.test(last)){think=false;continue}
    if([500,502,503,504].includes(r.status)&&n===0){await wait(1200);continue}
    if(r.status===404||r.status===429||r.status>=500||/not found|no longer available|not supported for generateContent|overloaded/i.test(last))break;
    throw new Error(last)}}
  throw new Error('Google\'s servers did not answer (they are sometimes busy). Last message: '+last+'. Wait a minute and send again.')}
 function errText(e){const m=e.name==='AbortError'?AIN()+' took too long to answer. Try again.':String(e.message||e);
  return /API key not valid|API_KEY_INVALID/i.test(m)?'Your API key was rejected. Tap ⚙ to paste a fresh key from aistudio.google.com/apikey. ('+m+')':/referer|referrer|HTTP_REFERRER/i.test(m)?'This key is restricted to other website addresses. In Google AI Studio allow this site\'s address ('+location.origin+') for the key. ('+m+')':/quota|RESOURCE_EXHAUSTED|429/i.test(m)?'The free quota is used up for now. Wait a minute and try again. ('+m+')':/Failed to fetch|NetworkError|Load failed/i.test(m)?'Could not connect. Check your internet connection, and that no ad-blocker or school/work network is blocking the request.':m}
 async function send(){if(G.busy)return;const ta=$('#gemText'),text=ta.value.trim();if(!text&&!G.att.length)return;
  const key=getKey();if(!key&&!SM.on){G.err='Sign in with Google to chat with '+AIN()+'. No API key is needed.';draw();return}
  stopListen();stopSpeech();const speakNow=G.voiceTurn||G.speak||G.talk;G.voiceTurn=false;
  const att=G.att,parts=[...att.map(a=>({inlineData:{mimeType:a.mime,data:a.data}})),{text:text||'Please look at the attached file(s) and summarise them.'}];
  G.err='';G.msgs.push({role:'user',parts,show:{text,files:att.map(a=>a.name)}});G.att=[];ta.value='';ta.style.height='';G.busy=true;draw();
  const sys=`You are ${AIN()}, a friendly study assistant built into the Study Planner app.${S.settings.name?' The student is called '+S.settings.name+'.':''} Today is ${new Date().toDateString()}. Be clear and concise. Write maths in LaTeX using $...$ and $$...$$.`;
  const payload={systemInstruction:{parts:[{text:sys}]},contents:G.msgs.map(m=>({role:m.role,parts:m.parts}))};
  let bubble=null,pend=0;const sched=()=>{if(!pend){pend=1;setTimeout(()=>{pend=0;draw()},70)}};
  const live=t=>{if(!bubble){bubble={role:'model',parts:[{text:''}],show:{text:''}};G.msgs.push(bubble)}bubble.show.text=t;bubble.parts[0].text=t;sched();if(speakNow)feedSpeech(t,false)};
  try{const resp=key?await openDirect(payload,key):await openProxy(payload);
   const {text:out,block}=await readStream(resp,live);
   if(out&&speakNow)feedSpeech(out,true);
   if(!out)throw new Error(block?AIN()+' blocked this request ('+block+').':AIN()+' sent back an empty reply. Try rephrasing.')}
  catch(e){const msg=errText(e);G.talk=false;stopSpeech();voiceUI();if(bubble&&bubble.show.text){G.err=msg}else{if(bubble)G.msgs.pop();G.msgs.pop();G.att=att;ta.value=text;G.err=msg}}
  finally{G.busy=false;draw();ta.focus()}}
 /* ---------- Voice: speech in (mic), speech out (read aloud), hands-free talk mode ---------- */
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition,TTS=window.speechSynthesis;
 const SPK='studyplanner.speak';
 try{G.speak=localStorage.getItem(SPK)==='1'}catch(e){G.speak=false}
 G.listening=false;G.talk=false;G.voiceTurn=false;let rec=null,sp={idx:0,pending:0,done:false};
 const vlang=()=>navigator.language||'en-IN';
 function speakMath(t){return t.replace(/\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g,' $1 over $2 ').replace(/\\sqrt\s*\{([^{}]*)\}/g,' square root of $1 ').replace(/\^\{?2\}?/g,' squared ').replace(/\^\{?3\}?/g,' cubed ')
  .replace(/\^\{([^{}]*)\}|\^(\w)/g,(m,a,b)=>' to the power '+(a||b)+' ').replace(/_\{([^{}]*)\}|_(\w)/g,(m,a,b)=>' sub '+(a||b)+' ').replace(/\\(cdot|times)/g,' times ').replace(/\\(le|leq)\b/g,' less than or equal to ').replace(/\\(ge|geq)\b/g,' greater than or equal to ')
  .replace(/\\([a-zA-Z]+)/g,' $1 ').replace(/[{}]/g,'').replace(/=/g,' equals ').replace(/\+/g,' plus ').replace(/(^|\s)-(\s*\w)/g,'$1minus $2').replace(/\s+/g,' ').trim()}
 function forSpeech(t){return String(t).replace(/```[\s\S]*?```/g,' code omitted. ').replace(/\$\$([\s\S]+?)\$\$/g,(m,c)=>' '+speakMath(c)+' ').replace(/\\\[([\s\S]+?)\\\]/g,(m,c)=>' '+speakMath(c)+' ').replace(/\\\(([\s\S]+?)\\\)/g,(m,c)=>' '+speakMath(c)+' ')
  .replace(/\$([^$\n]+?)\$/g,(m,c)=>' '+speakMath(c)+' ').replace(/`([^`]*)`/g,'$1').replace(/https?:\/\/\S+/g,' link ').replace(/[*#•]+/g,' ').replace(/\s*\n\s*/g,'. ').replace(/\s+/g,' ').trim()}
 function pickVoice(lang){try{const vs=TTS.getVoices();return vs.find(v=>v.lang===lang)||vs.find(v=>v.lang&&v.lang.slice(0,2)===lang.slice(0,2))||null}catch(e){return null}}
 function stopSpeech(){try{TTS&&TTS.cancel()}catch(e){}sp={idx:0,pending:0,done:false}}
 function say(txt){const c=forSpeech(txt);if(!c||!TTS)return;const mine=sp,u=new SpeechSynthesisUtterance(c);u.lang=vlang();const v=pickVoice(u.lang);if(v)u.voice=v;u.rate=1.03;mine.pending++;
  const end=()=>{mine.pending--;settle(mine)};u.onend=end;u.onerror=end;try{TTS.speak(u)}catch(e){mine.pending--}}
 function settle(mine){if(mine!==sp||!mine.done||mine.pending>0)return;if(G.talk)setTimeout(()=>{if(G.talk&&!G.busy&&!G.listening)listen()},250);voiceUI()}
 function feedSpeech(t,final){if(!TTS)return;const rest=t.slice(sp.idx);let cut=0;
  if(final)cut=rest.length;else{const re=/[.!?\n](?=\s)/g;let m;while((m=re.exec(rest))){const upto=rest.slice(0,m.index+1);if((upto.match(/\$/g)||[]).length%2===0&&(upto.match(/```/g)||[]).length%2===0&&upto.trim().length>20)cut=m.index+1}}
  if(cut>0){const chunk=rest.slice(0,cut);sp.idx+=cut;say(chunk)}
  if(final){sp.done=true;settle(sp)}}
 function voiceUI(){const m=$('#gemMic'),s=$('#gemSpk'),t=$('#gemTalk');if(!m)return;
  m.classList.toggle('rec',!!G.listening);m.setAttribute('aria-pressed',String(!!G.listening));m.hidden=!SR;
  s.classList.toggle('on',!!G.speak);s.innerHTML=ic(G.speak?'speaker':'speakerOff',18);s.setAttribute('aria-pressed',String(!!G.speak));s.hidden=!TTS;
  t.classList.toggle('on',!!G.talk);t.setAttribute('aria-pressed',String(!!G.talk));t.hidden=!(SR&&TTS)}
 function stopListen(){try{rec&&rec.abort()}catch(e){}rec=null;G.listening=false}
 function listen(){if(!SR){toast('Voice input is not supported in this browser. Try Chrome, Edge or Safari.',[],5000);return}
  if(G.busy)return;stopSpeech();stopListen();const ta=$('#gemText'),base=ta.value.trim();let finalT='',err='';
  try{rec=new SR()}catch(e){toast('Could not start the microphone.');return}
  rec.lang=vlang();rec.interimResults=true;rec.continuous=false;rec.maxAlternatives=1;
  rec.onresult=e=>{let interim='';for(let i=e.resultIndex;i<e.results.length;i++){const r=e.results[i];if(r.isFinal)finalT+=r[0].transcript;else interim+=r[0].transcript}
   ta.value=(base+' '+finalT+interim).trim();ta.style.height='auto';ta.style.height=Math.min(140,ta.scrollHeight)+'px'};
  rec.onerror=e=>{err=e.error||'error'};
  rec.onend=()=>{G.listening=false;rec=null;voiceUI();const heard=finalT.trim();
   if(heard){G.voiceTurn=true;send();return}
   if(err==='not-allowed'||err==='service-not-allowed'){G.talk=false;voiceUI();G.err='Microphone access is blocked. Allow the microphone for this site in your browser settings, then tap the mic again.';draw()}
   else if(err==='no-speech'||!err){if(G.talk){G.talk=false;voiceUI();toast('Talk mode stopped because I did not hear anything.')}else toast('I did not hear anything. Tap the mic and try again.')}
   else if(err!=='aborted'){G.talk=false;voiceUI();toast('Voice input problem: '+err+'. Check your internet connection and microphone.',[],5000)}};
  try{rec.start();G.listening=true;voiceUI()}catch(e){G.listening=false;toast('Could not start the microphone.')}}
 function mic(){if(G.listening){stopListen();voiceUI();return}listen()}
 function toggleSpeak(){G.speak=!G.speak;try{localStorage.setItem(SPK,G.speak?'1':'0')}catch(e){}if(!G.speak){stopSpeech();G.talk=false}voiceUI();toast(G.speak?'Buddy will read answers aloud':'Read aloud is off')}
 function toggleTalk(){G.talk=!G.talk;if(G.talk){G.speak=true;voiceUI();toast('Talk mode on. Speak, and Buddy will answer out loud.');listen()}else{stopListen();stopSpeech();voiceUI()}}
 function stopVoice(){G.talk=false;stopListen();stopSpeech();voiceUI()}

 const ta=$('#gemText');
 ta?.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();send()}});
 ta?.addEventListener('input',()=>{ta.style.height='auto';ta.style.height=Math.min(140,ta.scrollHeight)+'px'});
 $('#gemFileInput')?.addEventListener('change',e=>{const f=[...e.target.files];e.target.value='';if(f.length)addDevice(f)});
 return{mic,toggleSpeak,toggleTalk,open,close,reset,send,saveKey,clearKey,keySheet,attachMenu,pickerOpen,pickerFolder,pickerFile,pickerBack,rmAtt,draw}
})();
// Keep the panel's account badge in step with sign-in changes.
setInterval(()=>{if(G.open&&!sheetEl)Gem.draw()},4000);

const needLogin=()=>(!SM.on&&localStorage.getItem('studyplanner.guest')!=='1')||new URLSearchParams(location.search).get('login')==='1';
const hasName=()=>!!String((S.settings&&S.settings.name)||'').trim();
function showNameGate(){const el=$('#nameGate');if(!el)return;el.hidden=false;setTimeout(()=>$('#nameInput')?.focus(),50)}
function submitName(){const v=String($('#nameInput').value||'').trim().slice(0,30);if(!v){$('#nameError').textContent='Please enter your name to continue.';return}
 S.settings.name=v;save();$('#nameGate').hidden=true;render();gate()}
function showLoginGate(){const el=$('#loginGate');if(el){const h=$('#loginTitle');if(h)h.textContent=hasName()?'Welcome, '+S.settings.name:'Welcome to Study Planner';el.hidden=false}}
function hideLoginGate(){const el=$('#loginGate');if(el)el.hidden=true;if(location.search.includes('login=1'))history.replaceState(null,'',location.pathname+location.hash)}
// Order at start-up: 1) ask for the name, 2) then show the sign-in page.
function gate(){if(!hasName()){showNameGate();return}if(needLogin())showLoginGate()}
function startSplash(){const s=$('#splash');setTimeout(()=>{s?.classList.add('splash-out');setTimeout(()=>{if(s)s.remove();gate()},650)},1700)}
$('#nameForm')?.addEventListener('submit',e=>{e.preventDefault();submitName()});
/* ---------- Liquid glass tab pill: drag, spring physics, device gravity ---------- */
const NavPhys=(()=>{
 const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
 let nav=null,pill=null,raf=0,last=0,drag=null,suppress=0,gSide=0,gTarget=0,sensorOn=false,permAsked=false;
 const P={x:0,y:0,w:0,h:0,vx:0,vy:0,vw:0,vh:0,tx:0,ty:0,tw:0,th:0,init:false,lift:0};
 const vertical=()=>nav&&getComputedStyle(nav).flexDirection==='column';
 const tabs=()=>$$('.nb',nav).filter(b=>b.offsetWidth>0);
 const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
 function rectOf(b){const nr=nav.getBoundingClientRect(),r=b.getBoundingClientRect(),v=vertical();
  const ix=v?0:4,iy=v?2:2;return{x:r.left-nr.left-nav.clientLeft+ix,y:r.top-nr.top-nav.clientTop+iy,w:r.width-ix*2,h:r.height-iy*2}}
 function setTarget(){if(drag&&drag.moved)return;const b=nav.querySelector('.nb.on')||tabs()[0];if(!b||!b.offsetWidth)return;const r=rectOf(b);
  const lim=bounds();P.tx=vertical()?r.x:clamp(r.x+gSide*14,lim.min,lim.max);P.ty=vertical()?clamp(r.y,lim.min,lim.max):r.y;P.tw=r.w;P.th=r.h;
  if(!P.init||reduce){P.x=P.tx;P.y=P.ty;P.w=P.tw;P.h=P.th;P.vx=P.vy=P.vw=P.vh=0;P.init=true;paint()}}
 function bounds(){const t=tabs();if(!t.length)return{min:0,max:0};const a=rectOf(t[0]),z=rectOf(t[t.length-1]);return vertical()?{min:a.y,max:z.y}:{min:a.x,max:z.x}}
 function paint(){if(!pill)return;const v=vertical(),spd=Math.abs(v?P.vy:P.vx),st=1+Math.min(.3,spd/3200),sq=1-Math.min(.14,spd/6500),lift=1+P.lift*.09;
  const sx=(v?sq:st)*lift,sy=(v?st:sq)*lift;pill.style.width=P.w+'px';pill.style.height=P.h+'px';pill.style.transform=`translate(${P.x}px,${P.y}px) scale(${sx.toFixed(3)},${sy.toFixed(3)})`;
  pill.style.setProperty('--hx',(35+gSide*34).toFixed(1)+'%')}
 function step(now){const dt=Math.min(.033,(now-last)/1000||.016);last=now;
  const d=drag&&drag.moved,k=d?900:300,c=d?62:21;let busy=false;
  for(const [p,vk,t] of [['x','vx','tx'],['y','vy','ty'],['w','vw','tw'],['h','vh','th']]){const a=k*(P[t]-P[p])-c*P[vk];P[vk]+=a*dt;P[p]+=P[vk]*dt;if(Math.abs(P[vk])>.4||Math.abs(P[t]-P[p])>.12)busy=true}
  P.lift+=((d?1:0)-P.lift)*Math.min(1,dt*14);if(Math.abs((d?1:0)-P.lift)>.01)busy=true;
  paint();raf=busy||drag?requestAnimationFrame(step):0;if(!raf){P.x=P.tx;P.y=P.ty;P.w=P.tw;P.h=P.th;P.vx=P.vy=P.vw=P.vh=0;paint()}}
 const kick=()=>{if(!raf){last=performance.now();raf=requestAnimationFrame(step)}};
 function attach(){nav=$('#nav');if(!nav)return;if(!pill){pill=document.createElement('div');pill.id='navPill';pill.setAttribute('aria-hidden','true')}
  nav.prepend(pill);setTarget();kick()}
 function nearest(){const v=vertical(),c=v?P.ty+P.h/2:P.tx+P.w/2;let best=null,bd=1e9;for(const b of tabs()){const r=rectOf(b),m=v?r.y+r.h/2:r.x+r.w/2;if(Math.abs(m-c)<bd){bd=Math.abs(m-c);best=b}}return best}
 function markUnder(){const n=nearest();$$('.nb',nav).forEach(b=>b.classList.toggle('under',b===n));if(drag&&n&&drag.under!==n){drag.under=n;try{navigator.vibrate&&navigator.vibrate(6)}catch(e){}}}
 function down(e){const b=e.target.closest('.nb');if(!b||(e.pointerType==='mouse'&&e.button!==0))return;askSensor();
  const nr=nav.getBoundingClientRect();drag={id:e.pointerId,sx:e.clientX,sy:e.clientY,moved:false,nr,under:null}}
 function move(e){if(!drag||e.pointerId!==drag.id)return;const v=vertical(),d=v?e.clientY-drag.sy:e.clientX-drag.sx;
  if(!drag.moved){if(Math.abs(d)<7)return;drag.moved=true;nav.classList.add('drag');try{nav.setPointerCapture(e.pointerId)}catch(_){}kick()}
  const nr=nav.getBoundingClientRect(),lim=bounds();
  if(v){P.ty=clamp(e.clientY-nr.top-P.h/2,lim.min,lim.max)}else{P.tx=clamp(e.clientX-nr.left-P.w/2,lim.min,lim.max)}
  markUnder();e.preventDefault()}
 function up(e){if(!drag||e.pointerId!==drag.id)return;const was=drag.moved;let n=null;if(was){n=nearest();suppress=Date.now()+350}
  drag=null;nav.classList.remove('drag');$$('.nb',nav).forEach(b=>b.classList.remove('under'));
  if(was&&n){if(n.dataset.r&&n.dataset.r!==ui.route)go(n.dataset.r);else{setTarget()}}kick()}
 function askSensor(){if(permAsked)return;permAsked=true;try{if(typeof DeviceMotionEvent!=='undefined'&&typeof DeviceMotionEvent.requestPermission==='function')DeviceMotionEvent.requestPermission().then(r=>{if(r==='granted')startSensor()}).catch(()=>{})}catch(e){}}
 function startSensor(){if(sensorOn||typeof DeviceMotionEvent==='undefined')return;sensorOn=true;
  window.addEventListener('devicemotion',e=>{const a=e.accelerationIncludingGravity;if(!a||a.x==null||vertical())return;
   const ang=((screen.orientation&&screen.orientation.angle)||window.orientation||0),ios=/iPhone|iPad|iPod/.test(navigator.userAgent);
   // Positive = screen's right edge is lower. Android reports the reaction force, older iOS the opposite.
   const raw=ang===0?-a.x:ang===90?a.y:(ang===270||ang===-90)?-a.y:a.x;
   gTarget=clamp((ios?-1:1)*raw/9.8,-1,1);
   const n=gSide+(gTarget-gSide)*.12;if(Math.abs(n-gSide)>.004){gSide=n;setTarget();kick()}},{passive:true})}
 function init(){nav=$('#nav');nav.addEventListener('pointerdown',down);window.addEventListener('pointermove',move,{passive:false});window.addEventListener('pointerup',up);window.addEventListener('pointercancel',up);
  nav.addEventListener('click',e=>{if(Date.now()<suppress){e.stopPropagation();e.preventDefault()}},true);
  try{new ResizeObserver(()=>{if(!drag){setTarget();kick()}}).observe(nav)}catch(e){window.addEventListener('resize',()=>{setTarget();kick()})}
  window.addEventListener('load',()=>{setTarget();kick()});
  startSensor()}
 return{attach,init,tilt:v=>{gSide=v;setTarget();kick()}}
})();

/* ---------- boot ---------- */
function applyAIName(){const n=AIN();$('#gemName')&&($('#gemName').textContent=n);$('#gemPane')?.setAttribute('aria-label',n+' assistant');$('#gemText')?.setAttribute('placeholder','Ask '+n+'…');$('#gemText')?.setAttribute('aria-label','Message '+n);document.title=document.title}
function boot(){applyAIName();NavPhys.init();loadSM();const r=load();S=defaults();if(r)merge(S,r);if(!S.seeded){seed();markPast();save(true)}if(!S.modified){S.modified=Date.now();save(true)}applyTheme();
 const h=(location.hash||'').slice(1);if(VIEWS[h])ui.route=h;
 render();startSplash();if(ui.route==='files'&&SM.on)setTimeout(()=>DriveFiles.load(),1800);
 try{if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)){navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(r=>{swReg=r;swOk=true;if(ui.route==='reminders')render()}).catch(()=>{})}}catch(e){}
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEv=e;if(ui.route==='reminders')render()});
 recoverTimer();checkReminders();
 if(SM.on)setTimeout(()=>Sync.run(),1500);
 setInterval(()=>Sync.pulse(),180000);window.addEventListener('online',()=>Sync.pulse(true));
 setInterval(()=>{checkReminders();try{localStorage.setItem(SEEN,String(Date.now()))}catch(e){}},5000);
 setInterval(()=>{if(ui.route==='today'&&!sheetEl&&!T)render()},60000)}
boot();
})();
