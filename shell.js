/* Helix shared shell: one header, one account, one notification feed for every page.
   Usage: <script src="/shell.js" data-section="store|showcase|faq|commission|home|account" data-sub="..."></script> */
(()=>{
const SC=document.currentScript,TK='helix_tok',LOGO='/images/logo.webp';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tok=()=>{try{return localStorage.getItem(TK)}catch(_){return null}};
const call=async(p,o={})=>{const k=tok(),r=await fetch('/api'+p,{...o,headers:{'content-type':'application/json',...(k?{authorization:'Bearer '+k}:{})}});if(!r.ok){const x=new Error('http '+r.status);try{x.detail=(await r.json()).error}catch(_){}x.code=r.status===401?'signed-out':'http '+r.status;throw x}return r.json()};
let ME=null,V=0,last=null,subs=[],pt=null,booted=null,CFG={};
/* ---- data layer (same shim the pages already use) ---- */
const snap=c=>({docs:Object.entries((last||{})[c]||{}).map(([id,d])=>({id,data:()=>d}))});
async function poll(f){if(document.hidden&&!f)return;try{const j=await call('/sync?v='+(f?0:V));if(j.same)return;V=j.v;last=j.data;subs.forEach(([c,fn])=>fn(snap(c)))}catch(_){}}
setInterval(()=>poll(),6000);document.addEventListener('visibilitychange',()=>poll());
const boot=()=>booted||(booted=(async()=>{if(tok())try{ME=await call('/me')}catch(_){try{localStorage.removeItem(TK)}catch(_){}}})());
window.helixCall=call;
window.claude={use:async n=>{if(n==='user'){await boot();return{isOwner:async()=>!!(ME&&ME.owner),id:async()=>ME&&ME.id,profiles:ids=>call('/profiles?ids='+ids.join(','))}}
 return{collection:c=>({onSnapshot:f=>{subs.push([c,f]);clearTimeout(pt);pt=setTimeout(()=>poll(1),40)}}),
  doc:p=>{const[c,i]=p.split('/');return{set:async d=>{await call(`/doc/${c}/${i}`,{method:'PUT',body:JSON.stringify(d)});await poll(1)},delete:async()=>{await call(`/doc/${c}/${i}`,{method:'DELETE'});await poll(1)}}}}}};

/* ---- shared model: roles + notification feed ---- */
const D={PD:{},OR:{},E:{},C:{},IN:{},CH:{},AP:{},SA:{},SP:{},SL:{},PR:{}},NM={},STG=['Concept','Draft','Revisions','Finished'];
const COLS={products:'PD',orders:'OR',editors:'E',commissions:'C',inbox:'IN',chats:'CH',applications:'AP',sellerapps:'SA',support:'SP',sellers:'SL',profiles:'PR'};
const ST=(u,cid)=>((D.IN[u]||{}).st||{})[cid]||'',key=(c,e)=>c+':'+e;
const isOwner=()=>!!(ME&&ME.owner),isEditor=()=>isOwner()||!!(ME&&D.E[ME.id]),isSeller=()=>isOwner()||!!(ME&&D.SL[ME.id]);
const CATS=['thumbnails','pr','3d'],mine=()=>isOwner()?CATS:((ME&&D.E[ME.id]||{}).cats||[]);
const eopen=u=>!(D.PR[u]||{}).closed;
const allC=()=>Object.entries(D.C).flatMap(([u,d])=>(d.items||[]).map(c=>({...c,from:u})));
const claimer=c=>{let b=null,t=Infinity;for(const u of Object.keys(D.IN))if(['accepted','done'].includes(ST(u,c.id))){const x=((D.IN[u].sa||{})[c.id])||0;if(b===null||x<t||(x===t&&u<b)){b=u;t=x}}return b};
const cinfo=c=>{const cl=claimer(c);return{eds:c.to==='person'?[c.uid]:(cl?[cl]:[])}};
const inbox=()=>{const out=[];if(!ME)return out;for(const c of allC()){const cl=claimer(c),p=c.to==='person'&&c.uid===ME.id,k=c.to==='cat'&&mine().includes(c.cat)&&(cl?cl===ME.id:(eopen(ME.id)||ST(ME.id,c.id)));if(p||k)out.push(c)}return out};
const nm=u=>u?(NM[u]&&NM[u].name||'Someone'):'Helix Studio';
function events(){if(!ME)return[];const U=ME.id,o=[],th=[],CHAT='/commission/#chats';
 for(const c of allC())if(c.from===U)for(const e of cinfo(c).eds)th.push({c,cl:U,e});
 for(const c of inbox()){o.push(['new:'+c.id,1,'New commission request from '+nm(c.from),'/editor/']);if(['accepted','done'].includes(ST(U,c.id)))th.push({c,cl:c.from,e:U})}
 for(const{c,cl,e}of th){const k=key(c.id,e),oth=U===cl?e:cl,who=nm(oth),cnt=(d,f)=>(((D.CH[d]||{})[f]||{})[k]||[]).length,ms=((D.IN[e]||{}).ms||{})[c.id]??-1;
  o.push(['msg:'+k,cnt(oth,'m'),'New message from '+who,CHAT],['dl:'+k,cnt(e,'dl'),who+' shared a deliverable',CHAT],['rev:'+k,cnt(cl,'rev'),'Revision requested by '+nm(cl),CHAT]);
  if(U===cl)o.push(['st:'+k,ST(e,c.id),who+' marked your request '+ST(e,c.id),CHAT],['ms:'+k,ms,'Milestone reached: '+(STG[ms]||'updated'),CHAT])}
 if(isOwner()){for(const[id,pr]of Object.entries(D.PD))if(pr.status==='pending')o.push(['pp:'+id,1,'Product awaiting review: '+pr.title,'/admin/#products']);
  for(const[id,od]of Object.entries(D.OR))o.push(['ord:'+id,od.status,(od.status==='refunded'?'Refund: ':'New sale: ')+((od.items||[]).map(i=>i.name).join(', ')||'Payhip order'),'/admin/#orders']);
  for(const[u,a]of Object.entries(D.AP))if(a.status==='pending')o.push(['ap:'+u,1,'Editor application from '+nm(u),'/admin/#applications']);
  for(const[u,a]of Object.entries(D.SA))if(a.status==='pending')o.push(['sa:'+u,1,'Seller application from '+nm(u),'/admin/#applications']);
  for(const[u,d]of Object.entries(D.SP))for(const t of d.items||[]){const k='sup_'+t.id+':'+u;o.push(['sup:'+k,(((D.CH[u]||{}).m||{})[k]||[]).length,'Support message from '+nm(u),'/commission/#support'])}}
 else{for(const[id,pr]of Object.entries(D.PD))if(pr.seller===U&&['published','rejected'].includes(pr.status))o.push(['prod:'+id,pr.status,'Your product "'+pr.title+'" was '+(pr.status==='published'?'approved':'rejected'),'/seller/']);
  const a=D.AP[U],s=D.SA[U];if(a&&a.status!=='pending')o.push(['ap:me',a.status,'Your editor application was '+a.status,'/commission/#apply']);if(s&&s.status!=='pending')o.push(['sa:me',s.status,'Your seller application was '+s.status,'/commission/#apply']);
  for(const t of(D.SP[U]||{}).items||[]){const k='sup_'+t.id+':'+U;let n=0;for(const u of Object.keys(D.CH))if(u!==U)n+=(((D.CH[u]||{}).m||{})[k]||[]).length;o.push(['sup:'+k,n,'Support replied: '+t.s,'/commission/#support'])}}
 return o}
let SEEN=null,T0=Date.now(),shown=new Set();
const seenKey=()=>'helix_seen_'+(ME?ME.id:'');
const loadSeen=()=>{try{return JSON.parse(localStorage.getItem(seenKey())||'null')}catch(_){return null}};
const saveSeen=()=>{try{localStorage.setItem(seenKey(),JSON.stringify(SEEN))}catch(_){}};
const isNew=([k,v])=>typeof v==='number'?v>(SEEN[k]??(k.startsWith('ms:')?-1:0)):!!v&&v!=='pending'&&SEEN[k]!==v;
function feed(){const ev=events();if(!SEEN){SEEN=loadSeen();if(!SEEN){SEEN=Object.fromEntries(ev.filter(e=>!/^(new|ap|sa|pp):/.test(e[0])).map(e=>[e[0],e[1]]));saveSeen()}}return ev.filter(isNew)}
function toast(t,href){const w=document.getElementById('hs-toasts')||document.body.appendChild(Object.assign(document.createElement('div'),{id:'hs-toasts'}));const d=document.createElement('a');d.className='hs-toast';d.href=href||'#';d.textContent=t;w.appendChild(d);setTimeout(()=>d.remove(),6500)}
async function names(){const ids=new Set([ME&&ME.id]);for(const m of Object.values(D))for(const u of Object.keys(m))ids.add(u);const need=[...ids].filter(i=>i&&!NM[i]);if(need.length)try{Object.assign(NM,await call('/profiles?ids='+need.join(',')))}catch(_){}}
async function refresh(){if(!ME)return;await names();const f=feed();renderBell(f);renderAuth();
 if(Date.now()-T0>3500)for(const e of f)if(!shown.has(e[0]+':'+e[1])){shown.add(e[0]+':'+e[1]);toast(e[2],e[3])}else{}
 else f.forEach(e=>shown.add(e[0]+':'+e[1]))}

/* ---- header ---- */
const TABS=[['store','Store','/store'],['showcase','Showcase','/showcase/#thumbnails'],['faq','FAQ','/faq/'],['commission','Commission','/commission/#request']];
const SUBS={store:[['animations','Animations','/store/animations'],['builds','Builds','/store/builds'],['plugins','Plugins','/store/plugins']],
 showcase:[['thumbnails','Thumbnails','/showcase/#thumbnails'],['montage','Montage','/showcase/#montage']],
 commission:[['request','Requests','/commission/#request'],['chats','Conversations','/commission/#chats'],['apply','Apply','/commission/#apply'],['support','Support','/commission/#support']]};
let SECT=SC.dataset.section||'',SUB=SC.dataset.sub||'';
const css=`.hs,.hs *{box-sizing:border-box}.hs{--c:#22d3ee;--v:#8b5cf6;--l:rgba(255,255,255,.1);--m:#9aa3b8;--t:#eef1f8;position:sticky;top:0;z-index:50;background:rgba(6,7,12,.86);backdrop-filter:blur(10px);border-bottom:1px solid var(--l);font:600 14px Manrope,system-ui,sans-serif;color:var(--t)}
.hs a{color:inherit;text-decoration:none}.hs-in{width:min(1180px,100% - 24px);margin:0 auto;display:flex;align-items:center;gap:14px;padding:8px 0}
.hs-logo{display:flex;align-items:center;gap:9px;font:700 18px "Pixelify Sans","Courier New",monospace;white-space:nowrap}.hs-logo img{width:30px;height:30px;image-rendering:pixelated}
.hs-tabs{display:flex;gap:2px;margin-left:8px}.hs-tabs a{padding:8px 13px;border-radius:8px;color:var(--m)}.hs-tabs a:hover{color:var(--t);background:rgba(255,255,255,.06)}
.hs-tabs a[aria-current]{color:#06070c;background:linear-gradient(135deg,var(--c),var(--v))}
.hs-right{margin-left:auto;display:flex;align-items:center;gap:10px}
.hs-search{position:relative}.hs-search input{width:190px;background:rgba(255,255,255,.06);border:1px solid var(--l);color:var(--t);border-radius:99px;padding:7px 14px;font:600 13px Manrope,system-ui,sans-serif}
.hs-res{position:absolute;right:0;top:110%;width:min(340px,86vw);background:#0d0f17;border:1px solid var(--l);border-radius:12px;padding:6px;display:none;max-height:60vh;overflow:auto}.hs-res.on{display:block}
.hs-res a{display:flex;justify-content:space-between;gap:10px;padding:8px 10px;border-radius:8px}.hs-res a:hover{background:rgba(255,255,255,.07)}.hs-res small{color:var(--m);white-space:nowrap}.hs-res p{margin:0;padding:8px 10px;color:var(--m)}
.hs-btn{background:rgba(255,255,255,.06);border:1px solid var(--l);color:var(--t);border-radius:99px;padding:7px 13px;font:700 13px Manrope,system-ui,sans-serif;cursor:pointer;position:relative}
.hs-btn b{position:absolute;top:-5px;right:-5px;background:#f472b6;color:#06070c;border-radius:99px;font-size:11px;min-width:18px;height:18px;line-height:18px;text-align:center}
.hs-menu{position:relative}.hs-pop{position:absolute;right:0;top:115%;width:min(320px,88vw);background:#0d0f17;border:1px solid var(--l);border-radius:12px;padding:8px;display:none;z-index:60}.hs-pop.on{display:block}
.hs-pop a,.hs-pop button{display:block;width:100%;text-align:left;background:none;border:0;color:var(--t);padding:9px 10px;border-radius:8px;font:600 14px Manrope,system-ui,sans-serif;cursor:pointer}.hs-pop a:hover,.hs-pop button:hover{background:rgba(255,255,255,.07)}
.hs-pop h4{margin:4px 10px 6px;font:700 12px Manrope,system-ui,sans-serif;color:var(--m);text-transform:uppercase;letter-spacing:.06em}.hs-pop p{margin:0;padding:8px 10px;color:var(--m)}
.hs-av{display:inline-block;width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,var(--c),var(--v));vertical-align:middle;margin-right:6px;overflow:hidden}.hs-av img{width:100%;height:100%;object-fit:cover}
.hs-subbar{border-top:1px solid var(--l);background:rgba(255,255,255,.02)}.hs-subbar .hs-in{padding:0;gap:4px;overflow-x:auto}.hs-subbar a{padding:10px 14px;color:var(--m);border-bottom:2px solid transparent;white-space:nowrap}.hs-subbar a:hover{color:var(--t)}.hs-subbar a[aria-current]{color:var(--t);border-color:var(--c)}
#hs-banner{font:700 14px Manrope,system-ui,sans-serif;text-align:center;padding:8px 12px;background:linear-gradient(90deg,#8b5cf6,#3b82f6 55%,#22d3ee);color:#04050a}#hs-banner .t{background:#04050a;color:#22d3ee;padding:2px 9px;border-radius:99px;font-size:12px;margin-right:6px}#hs-banner button{font:inherit;border:1px dashed #04050a;background:rgba(255,255,255,.25);border-radius:6px;padding:2px 8px;cursor:pointer;margin:0 6px}#hs-banner .x{border:0;background:none;font-size:18px;padding:0 4px}
.hs-foot{border-top:1px solid rgba(255,255,255,.1);margin-top:50px;padding:34px 0 26px;font:500 14px Manrope,system-ui,sans-serif;color:#9aa3b8;background:rgba(0,0,0,.25)}.hs-foot a{color:#c9d0e0;text-decoration:none}.hs-foot a:hover{color:#22d3ee}
.hs-fg{width:min(1180px,100% - 24px);margin:0 auto;display:grid;grid-template-columns:1.4fr repeat(3,1fr);gap:24px}.hs-fg h4{margin:0 0 10px;font:700 12px Manrope,system-ui,sans-serif;text-transform:uppercase;letter-spacing:.08em;color:#eef1f8}.hs-fg ul{list-style:none;margin:0;padding:0;display:grid;gap:7px}
.hs-fn{width:min(1180px,100% - 24px);margin:22px auto 0;padding-top:16px;border-top:1px solid rgba(255,255,255,.08);font-size:13px}@media(max-width:700px){.hs-fg{grid-template-columns:1fr 1fr}}
#hs-toasts{position:fixed;right:14px;bottom:14px;display:grid;gap:8px;z-index:80}.hs-toast{background:#0d0f17;border:1px solid var(--c,#22d3ee);color:#eef1f8;padding:10px 14px;border-radius:10px;font:600 14px Manrope,system-ui,sans-serif;text-decoration:none;max-width:300px}
@media(max-width:820px){.hs-in{flex-wrap:wrap}.hs-subbar .hs-in{flex-wrap:nowrap}.hs-tabs{order:3;width:100%;margin:0;overflow-x:auto}.hs-search input{width:120px}.hs-logo span{display:none}.hs-logo.nologo span{display:inline}}`;
document.head.appendChild(Object.assign(document.createElement('style'),{textContent:css}));
const host=document.createElement('div');host.id='hs-root';
host.innerHTML=`<div id="hs-banner" hidden></div><header class="hs"><div class="hs-in"><a class="hs-logo" href="/" aria-label="Helix Studio home"><img src="${LOGO}" alt="" onerror="this.style.display='none';this.parentNode.classList.add('nologo')"><span>Helix Studio</span></a>
<nav class="hs-tabs" aria-label="Main">${TABS.map(([k,l,h])=>`<a href="${h}" data-s="${k}">${l}</a>`).join('')}</nav>
<div class="hs-right"><div class="hs-search"><input type="search" id="hs-q" placeholder="Search" aria-label="Search the site" autocomplete="off"><div class="hs-res" id="hs-res"></div></div><div class="hs-menu" id="hs-bell"></div><div class="hs-menu" id="hs-auth"></div></div></div><div class="hs-subbar" id="hs-sub" hidden><div class="hs-in"></div></div></header>`;
document.body.prepend(host);
function renderNav(){document.querySelectorAll('.hs-tabs a').forEach(a=>a.dataset.s===SECT?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'));
 const sb=document.getElementById('hs-sub'),L=SUBS[SECT];sb.hidden=!L;if(!L)return;
 const h=location.hash.replace(/^#\/?/,'').split('/'),cur=h[0].split('?')[0];
 const act=SECT==='store'?SUB:(L.some(x=>x[0]===cur)?cur:SUB||L[0][0]);
 sb.firstElementChild.innerHTML=L.map(([k,l,u])=>`<a href="${u}" ${k===act?'aria-current="page"':''}>${l}</a>`).join('')}
addEventListener('hashchange',()=>{if(SC.dataset.section!=='home'&&!SC.dataset.hashed)return renderNav();renderNav()});
/* ---- banner (sale) ---- */
let bT;function setBanner(B){clearInterval(bT);const el=document.getElementById('hs-banner');
 if(!B||!B.enabled||!B.confirmed||!(Date.parse(B.endsAt)>Date.now())||sessionStorage.getItem('hs_ann')===B.code+B.endsAt){el.hidden=true;return}
 const tick=()=>{const ms=Date.parse(B.endsAt)-Date.now();if(ms<=0){el.hidden=true;clearInterval(bT);return}const s=Math.floor(ms/1e3),d=Math.floor(s/864e2),f=n=>String(n).padStart(2,'0');document.getElementById('hs-cd').textContent=(d?d+'d ':'')+f(Math.floor(s%864e2/3600))+':'+f(Math.floor(s%3600/60))+':'+f(s%60)};
 el.hidden=false;el.innerHTML=`<span class="t">${esc(B.badge)}</span> ${esc(B.text)} <button id="hs-cc" title="Copy code">${esc(B.code)}</button> Ends in <b id="hs-cd"></b> <button class="x" aria-label="Dismiss">×</button>`;
 el.querySelector('.x').onclick=()=>{sessionStorage.setItem('hs_ann',B.code+B.endsAt);el.hidden=true};document.getElementById('hs-cc').onclick=e=>{try{navigator.clipboard.writeText(B.code)}catch(_){}e.target.textContent='Copied'};tick();bT=setInterval(tick,1e3)}
/* ---- public data (shared by search, the Store and the home page) ---- */
let pubP=null;const pub=force=>{if(force||!pubP)pubP=(async()=>{await boot();return fetch('/api/sync',{headers:tok()?{authorization:'Bearer '+tok()}:{}}).then(r=>r.json()).then(j=>j.data||{})})();return pubP};
function setStoreTabs(tabs){if(!tabs||!tabs.length)return;SUBS.store=tabs.map(t=>[t.id,t.name,'/store/'+t.id]);if(SECT==='store')renderNav()}
/* ---- search ---- */
let IDX=null;async function index(){if(IDX)return IDX;IDX=[];const ids=new Set();try{const d0=await pub();for(const[id,x]of Object.entries(d0.products||{}))if(x.status==='published'){ids.add(id);IDX.push({t:x.title,x:(x.tags||[]).join(' ')+' '+(x.short||''),s:'Store',u:'/store/'+x.cat+'/'+id})}}catch(_){}
 try{const s=await fetch('/site.json').then(r=>r.json());for(const[k,a]of Object.entries(s.stores||{}))for(const p of a)if(!ids.has(p.id))IDX.push({t:p.n,x:(p.tags||[]).join(' ')+' '+(p.d||''),s:'Store',u:'/store/'+k+'/'+p.id})}catch(_){}
 try{const d=await pub();for(const[u,x]of Object.entries(d.works||{}))for(const w of x.items||[])IDX.push({t:w.t,x:(w.tags||[]).join(' ')+' '+(w.d||''),s:'Showcase',u:'/showcase/#'+(w.cat==='thumbnails'?'thumbnails':'montage')});
  const f=(d.faq||{}).main;for(const q of(f&&f.items)||[])IDX.push({t:q.q,x:q.a||'',s:'FAQ',u:'/faq/#'+q.id})}catch(_){}
 (window.HX_S&&window.HX_S.items||[]).forEach(w=>IDX.push({t:w.t,x:(w.tags||[]).join(' '),s:'Showcase',u:'/showcase/#'+(w.tab==='thumbnails'?'thumbnails':'montage')}));
 (window.HX_FAQ||[]).forEach(q=>IDX.push({t:q.q,x:q.a||'',s:'FAQ',u:'/faq/#'+q.id}));return IDX}
const qi=document.getElementById('hs-q'),qr=document.getElementById('hs-res');
qi.addEventListener('focus',index);qi.addEventListener('input',async()=>{const q=qi.value.trim().toLowerCase();if(!q){qr.classList.remove('on');return}const ix=await index(),r=ix.filter(i=>(i.t+' '+i.x).toLowerCase().includes(q)).slice(0,8);
 qr.innerHTML=r.map(i=>`<a href="${esc(i.u)}"><span>${esc(i.t)}</span><small>${i.s}</small></a>`).join('')||'<p>No results.</p>';qr.classList.add('on')});
qi.addEventListener('keydown',e=>{if(e.key==='Escape'){qr.classList.remove('on');qi.blur()}if(e.key==='Enter'){const a=qr.querySelector('a');if(a)location.href=a.href}});
document.addEventListener('click',e=>{if(!e.target.closest('.hs-search'))qr.classList.remove('on');if(!e.target.closest('.hs-menu'))document.querySelectorAll('.hs-pop').forEach(p=>p.classList.remove('on'))});
/* ---- bell + account ---- */
function renderBell(f){const el=document.getElementById('hs-bell');if(!ME){el.innerHTML='';return}f=f||feed();const open=el.querySelector('.hs-pop.on');
 el.innerHTML=`<button class="hs-btn" aria-label="Notifications" aria-haspopup="true">🔔${f.length?`<b>${f.length>9?'9+':f.length}</b>`:''}</button><div class="hs-pop${open?' on':''}"><h4>Notifications</h4>${f.map((e,i)=>`<a href="${esc(e[3])}" data-n="${i}">${esc(e[2])}</a>`).join('')||'<p>You are all caught up.</p>'}${f.length?'<button data-all="1">Mark all as read</button>':''}</div>`;
 const pop=el.querySelector('.hs-pop');el.querySelector('.hs-btn').onclick=e=>{e.stopPropagation();document.querySelectorAll('.hs-pop').forEach(p=>p!==pop&&p.classList.remove('on'));pop.classList.toggle('on')};
 pop.querySelectorAll('a[data-n]').forEach(a=>a.addEventListener('click',()=>{const e=f[+a.dataset.n];SEEN[e[0]]=e[1];saveSeen()}));
 const all=pop.querySelector('[data-all]');if(all)all.onclick=()=>{events().forEach(e=>SEEN[e[0]]=e[1]);saveSeen();renderBell()}}
function renderAuth(){const el=document.getElementById('hs-auth');
 if(ME){const p=NM[ME.id]||{},av=p.avatarUrl||ME.avatarUrl,open=el.querySelector('.hs-pop.on');
  el.innerHTML=`<button class="hs-btn" aria-haspopup="true"><span class="hs-av">${av?`<img src="${esc(av)}" alt="" referrerpolicy="no-referrer">`:''}</span>${esc((p.name||ME.name||'Account').split(' ')[0])}</button><div class="hs-pop${open?' on':''}"><a href="/dashboard/">Dashboard</a>${isEditor()?'<a href="/editor/">Editor dashboard</a>':''}${isSeller()?'<a href="/seller/">Seller dashboard</a>':''}${isOwner()?'<a href="/admin/">Admin</a>':''}<button data-so="1">Sign out</button></div>`;
  const pop=el.querySelector('.hs-pop');el.querySelector('.hs-btn').onclick=e=>{e.stopPropagation();document.querySelectorAll('.hs-pop').forEach(x=>x!==pop&&x.classList.remove('on'));pop.classList.toggle('on')};
  el.querySelector('[data-so]').onclick=()=>{try{localStorage.removeItem(TK)}catch(_){}location.reload()};return}
 if(el.dataset.g)return;el.dataset.g=1;
 el.innerHTML='<button class="hs-btn" id="hs-si">Sign In</button>';
 if(!CFG.googleClientId){el.firstChild.onclick=()=>alert('Sign-in is not set up yet.');return}
 el.firstChild.onclick=()=>alert('Sign-in is still loading. Check your connection and try again.');
 const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.onload=()=>{if(!window.google)return;google.accounts.id.initialize({client_id:CFG.googleClientId,callback:async x=>{try{const j=await call('/auth',{method:'POST',body:JSON.stringify({credential:x.credential})});localStorage.setItem(TK,j.token);location.reload()}catch(_){alert('Sign-in failed. Try again.')}}});el.innerHTML='';google.accounts.id.renderButton(el,{theme:'filled_black',size:'medium',text:'signin'})};document.head.append(s)}

/* ---- footer (same on every page) ---- */
const foot=document.createElement('footer');foot.className='hs-foot';foot.id='hs-foot';
foot.innerHTML=`<div class="hs-fg"><div><b style="color:#eef1f8;font:700 18px 'Pixelify Sans','Courier New',monospace">Helix Studio</b><p>Minecraft animation templates, builds, plugins and custom work.</p></div>
<div><h4>Navigate</h4><ul><li><a href="/store">Store</a></li><li><a href="/showcase/#thumbnails">Showcase</a></li><li><a href="/faq/">FAQ</a></li><li><a href="/commission/#request">Commission</a></li></ul></div>
<div><h4>Support</h4><ul><li><a href="/commission/#support">Contact support</a></li><li><a href="/faq/">Read the FAQ</a></li><li><a id="hs-mail" href="/commission/#support">Email</a></li></ul></div>
<div><h4>Legal</h4><ul><li><a href="/privacy.html">Privacy</a></li><li><a href="/terms.html">Terms</a></li><li><a href="/license.html">License terms</a></li></ul></div></div>
<div class="hs-fn" id="hs-note">&copy; Helix Studio. Not affiliated with Mojang or Microsoft.</div>`;
const setMail=()=>{const m=document.getElementById('hs-mail');if(m&&CFG.email){m.href='mailto:'+CFG.email;m.textContent=CFG.email}};
const addFoot=()=>{if(!document.getElementById('hs-foot'))document.body.appendChild(foot);setMail()};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addFoot);else addFoot();
/* ---- start ---- */
renderNav();
const ready=(async()=>{try{CFG=await fetch('/site.json').then(r=>r.json())}catch(_){}setBanner(CFG.banner);setMail();await boot();renderAuth();
 if(ME){const db=await claude.use('db');for(const[c,k]of Object.entries(COLS))db.collection(c).onSnapshot(s=>{D[k]=Object.fromEntries(s.docs.map(d=>[d.id,d.data()]));refresh()})}
 return ME})();
window.Helix={LOGO,call,ready,pub,setStoreTabs,me:()=>ME,isOwner,isEditor,isSeller,data:D,names:NM,esc,
 setSection(s,sub){SECT=s;SUB=sub||'';renderNav()},setBanner,config:()=>CFG,setNote(t){document.getElementById('hs-note').textContent=t}};
})();
