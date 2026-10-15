(()=>{
const S=window.HX_S,PAGE=window.HX.page;
const CATS={thumbnails:'YouTube Thumbnails',pr:'Premiere Pro + After Effects','3d':'Blender / Cinema 4D'};
const PTABS={showcase:['thumbnails','montage'],commission:['request','chats','apply','support'],admin:['overview','home','applications','support','store'],dashboard:[],editor:[],seller:[]};
const ROUTE={request:'/commission/#request',chats:'/commission/#chats',apply:'/commission/#apply',support:'/commission/#support',dashboard:'/dashboard/',editor:'/editor/',seller:'/seller/',admin:'/admin/'};
const $=id=>document.getElementById(id),LOGO=Helix.LOGO;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hashTab=()=>{const h=location.hash.slice(1).split('?')[0],l=PTABS[PAGE]||[];return l.includes(h)?h:(l[0]||'')};
let tab=hashTab();
let HOME={},HLOAD=false,HREV={},HD=null,HDD=false,HOPEN=-1,HMSG='',SJ=null,DB=null,U=null,UID=null,OWNER=false,E={},W={},C={},IN={},AP={},SA={},SL={},SP={},SET={},NM={},CH={},PR={},RV={},FORM={},pre='',rt=0,flash='';
if(PAGE==='commission'){try{pre=sessionStorage.getItem('hx_pre')||'';sessionStorage.removeItem('hx_pre')}catch(_){}}
const nm=id=>id?(NM[id]&&NM[id].name||'Someone'):'Helix Studio',open=()=>SET.open??S.open;
const isEd=()=>OWNER||!!E[UID],mine=()=>OWNER?Object.keys(CATS):(E[UID]&&E[UID].cats||[]);
const ST=(u,cid)=>((IN[u]||{}).st||{})[cid]||'',key=(c,e)=>c+':'+e;
const links=t=>esc(t).replace(/https?:\/\/[^\s<]+/g,u=>`<a href="${u}" target="_blank" rel="noopener" style="color:var(--cy)">${u}</a>`);
const SOC=[['yt','YouTube',h=>'https://youtube.com/@'+h],['x','X',h=>'https://x.com/'+h],['ig','Instagram',h=>'https://instagram.com/'+h],['site','Portfolio',h=>'https://'+h],['dc','Discord',null]];
const socials=u=>{const p=PR[u]||{};return SOC.filter(s=>p[s[0]]).map(([k,l,f])=>{const v=String(p[k]);if(!f)return `<span class="tag">${l}: ${esc(v)}</span>`;const url=/^https?:\/\//.test(v)?v:f(v.replace(/^@/,''));return `<a class="tag" href="${esc(url)}" target="_blank" rel="noopener">${l}</a>`}).join('')};
function msgs(cid,cl,e){const k=key(cid,e),g=u=>(((CH[u]||{}).m||{})[k]||[]).map(m=>({...m,by:u}));return [...g(cl),...g(e)].sort((a,b)=>a.at-b.at)}
const STG=['Concept','Draft','Revisions','Finished'];
const rat=u=>{const a=[];for(const d of Object.values(RV))for(const[k,v]of Object.entries(d.r||{}))if(k.split(':')[1]===u)a.push(v);return a.sort((x,y)=>y.at-x.at)};
const stars=n=>'★'.repeat(n)+'☆'.repeat(5-n);
const isSell=()=>OWNER||!!SL[UID];
const eopen=u=>!(PR[u]||{}).closed,allC=()=>Object.entries(C).flatMap(([u,d])=>(d.items||[]).map(c=>({...c,from:u})));
const claimer=c=>{let b=null,t=Infinity;for(const u of Object.keys(IN))if(['accepted','done'].includes(ST(u,c.id))){const x=((IN[u].sa||{})[c.id])||0;if(b===null||x<t||(x===t&&u<b)){b=u;t=x}}return b};
const meta=c=>c.bud||c.due?`<p class="mu">${c.bud?'💰 '+esc(c.bud):''} ${c.due?'📅 due '+esc(c.due):''}</p>`:'';
const when=t=>new Date(t).toLocaleDateString();
async function names(ids){ids=[...new Set(ids.filter(Boolean))].filter(i=>!NM[i]);if(ids.length&&U)try{Object.assign(NM,await U.profiles(ids))}catch(e){}}
async function wr(p,d){try{await DB.doc(p).set(d);return''}catch(e){return e.code||e.message||'failed'}}
const tags=a=>(a||[]).map(g=>`<span class="tag">${esc(g)}</span>`).join('');
const CUBE='<div class="cube"><i></i><i></i><i></i><i></i><i></i><i></i></div>',TL='<div class="tl"><div><i style="left:2%;width:34%"></i><i class="b" style="left:40%;width:30%"></i></div><div><i class="b" style="left:12%;width:26%"></i><i style="left:44%;width:44%"></i></div><div><i style="left:0;width:22%"></i><i class="b" style="left:28%;width:50%"></i></div><span class="ph"></span></div>';
function thumb(it,k){if(k==='yt')return `<div class="th yt" style="--h:${it.h}"><div class="burst"></div><div class="big">${esc(it.t)}</div><div class="play">▶</div><span class="dur">${esc(it.dur||'10:24')}</span></div>`;
 return `<div class="th" style="--h:${it.h}"><span class="rec">${it.sw==='pr'?'REC · PREMIERE / AE':'REC · BLENDER / C4D'}</span>${it.sw==='pr'?TL:CUBE}</div>`}
function works(){const a=S.items.map(i=>({...i,sw:i.tab==='thumbnails'?'thumbnails':i.sw,by:null}));
 for(const[u,d]of Object.entries(W))for(const w of d.items||[])a.push({...w,sw:w.cat,by:u});return a}
const need=()=>`<div class="panel"><p><b>Sign in needed.</b> Use the Sign In button at the top right. Anyone can browse; requests, chats and dashboards need an account.</p></div>`;
/* ONE chat component for every conversation (commission chats and support threads) */
function thread(o){return `<div class="chat"><b>${o.title}</b> ${o.tag?`<span class="tag st-${o.tagCls||o.tag}">${esc(o.tag)}</span>`:''}${o.note?`<p class="mu">${o.note}</p>`:''}${o.pre||''}
 <div class="msgs">${o.msgs.map(m=>`<div class="m ${m.by===UID?'me':''}"><small>${esc(nm(m.by))} · ${new Date(m.at).toLocaleString()}</small><br>${links(m.x)}</div>`).join('')||(o.ok?`<p class="mu">${o.empty||'Say hi and share the details.'}</p>`:'')}</div>
 ${o.ok?`<div class="send"><input id="m-${o.sfx}" maxlength="500" placeholder="Message…"><button class="btn sm" ${o.send}>Send</button></div>`:''}${o.extra||''}</div>`}
function chat(cid,cl,e){const s=ST(e,cid),ok=s==='accepted'||s==='done',k=key(cid,e),ed=e===UID,sfx=cid+'-'+e;
 const n=s==='done'?3:(((IN[e]||{}).ms||{})[cid]??-1),dl=((CH[e]||{}).dl||{})[k]||[],rv=((RV[cl]||{}).r||{})[k],rq=((CH[cl]||{}).rev||{})[k]||[];
 const pre=ok?`<div class="stg">${STG.map((g,i)=>`<span class="${i<=n?'on':''}">${g}</span>`).join('')}</div>`:'';
 const extra=ok?`<div class="drop"><b>📦 Deliverables</b>${dl.map(d=>`<p><a href="${esc(d.u)}" target="_blank" rel="noopener" style="color:var(--cy)">${esc(d.l||d.u)}</a> <span class="mu">${when(d.at)}</span></p>`).join('')||'<p class="mu">Nothing handed over yet.</p>'}${ed?`<div class="send"><input id="dl-l-${sfx}" maxlength="60" placeholder="Label (Final video)"><input id="dl-u-${sfx}" placeholder="https:// link to files"><button class="btn sm" data-a="dl" data-id="${cid}" data-e="${e}">Add</button></div>`:''}</div>
 <div class="drop"><b>🔁 Revisions: ${rq.length}</b>${rq.map((q,i)=>`<p>#${i+1} <span class="mu">${when(q.at)}</span> ${esc(q.x||'No note')}</p>`).join('')}${UID===cl&&s==='accepted'?`<div class="send"><input id="rq-${sfx}" maxlength="300" placeholder="What should change?"><button class="btn sm" data-a="rev" data-id="${cid}" data-e="${e}">Request revision</button></div>`:''}</div>`:'';
 const rev=s==='done'?`<div class="drop"><b>⭐ Review</b>${rv?`<p class="rs">${stars(rv.s)}</p><p class="mu">${esc(rv.x)}</p>`:UID===cl?`<div class="send"><select id="rv-s-${sfx}" style="width:auto">${[5,4,3,2,1].map(i=>`<option value="${i}">${stars(i)}</option>`).join('')}</select><input id="rv-t-${sfx}" maxlength="300" placeholder="Short feedback"><button class="btn sm" data-a="rv" data-id="${cid}" data-e="${e}">Post</button></div>`:'<p class="mu">Waiting for the client to review.</p>'}</div>`:'';
 return thread({title:'Chat with '+esc(nm(ed?cl:e)),tag:s||'pending',note:ok?'':(s==='declined'?'Declined: chat is closed.':'Chat unlocks when the editor accepts.'),pre,msgs:msgs(cid,cl,e),ok,empty:'Say hi and share deadlines, details and requirements.',sfx,send:`data-a="msg" data-id="${cid}" data-e="${e}" data-c="${cl}"`,extra:extra+rev})}
const cinfo=c=>{const cl=claimer(c),eds=c.to==='person'?[c.uid]:(cl?[cl]:[]);return{eds,s:eds.length?(ST(eds[0],c.id)||'pending'):'pending'}};
const stTag=s=>`<span class="tag st-${s}">${s}</span>`;
function inbox(){const out=[];for(const c of allC()){const cl=claimer(c),p=c.to==='person'&&c.uid===UID,k=c.to==='cat'&&mine().includes(c.cat)&&(cl?cl===UID:(eopen(UID)||ST(UID,c.id)));if(p||k)out.push(c)}return out.sort((a,b)=>b.at-a.at)}
const supMsgs=k=>Object.keys(CH).flatMap(u=>(((CH[u]||{}).m||{})[k]||[]).map(m=>({...m,by:u}))).sort((a,b)=>a.at-b.at);

const hero=()=>`<section class="hero"><img src="${LOGO}" alt="" onerror="this.style.display='none'"><div><h1>Helix <span>Showcase</span></h1><p class="mu" style="max-width:520px">Portfolio of YouTube thumbnails and Minecraft montage work by the Helix team. Like something? Commission its editor.</p><a class="pill" href="/commission/#request" style="text-decoration:none;color:inherit"><span class="dot ${open()?'':'off'}"></span>Commissions ${open()?'open':'closed'}</a></div></section>`;
const card=(it,i,k)=>`<button class="card" style="animation-delay:${i*60}ms" data-a="view" data-id="${esc(it.id)}">${thumb(it,k)}<div class="b"><h3>${esc(it.t)}</h3><p>${esc(it.d)} · <b>${esc(nm(it.by))}</b></p>${tags(it.tags)}</div></button>`;
function vWorks(){const all=works(),T={k:tab==='montage'?'cube':'yt'};
 const grp=tab==='montage'?[['pr','Premiere Pro + After Effects'],['3d','Blender / Cinema 4D']]:[['thumbnails','']];
 return hero()+`<h2 style="font-size:28px">${tab==='montage'?'Montage':'YouTube Thumbnails'}</h2><input id="sq" type="search" placeholder="Search works" aria-label="Search works" style="max-width:260px;margin:6px 0 10px">`+grp.map(([g,t])=>`${t?`<div class="sec"><h3>${t}</h3></div>`:''}<div class="grid">${all.filter(i=>i.sw===g&&(i.t+' '+(i.tags||[]).join(' ')).toLowerCase().includes(SQ)).map((it,i)=>card(it,i,T.k)).join('')||'<p class="mu">Nothing here yet.</p>'}</div>`).join('')}
function vEditors(){const es=Object.entries(E);
 return `<h2 class="hx-h">Pick an editor</h2><p class="mu">Commission someone directly from their profile.</p><div class="grid">${es.map(([u,e])=>`<div class="panel ed"><img src="${esc(NM[u]&&NM[u].avatarUrl||'')}" alt=""><h3>${esc(nm(u))}</h3><div>${tags((e.cats||[]).map(c=>CATS[c]))}</div><p class="mu">${((W[u]||{}).items||[]).length} works</p><div>${socials(u)}</div>${(()=>{const a=rat(u);return a.length?`<p class="rs">★ ${(a.reduce((t,v)=>t+v.s,0)/a.length).toFixed(1)} <span class="mu">(${a.length})</span></p>${a.filter(v=>v.x).slice(0,2).map(v=>`<p class="mu" style="font-size:13px">“${esc(v.x)}”</p>`).join('')}`:''})()}${open()&&eopen(u)?`<button class="btn" data-a="to" data-id="${u}">Commission ${esc(nm(u).split(' ')[0])}</button>`:eopen(u)?'':'<span class="tag st-declined">Commissions closed</span>'}</div>`).join('')||'<p class="mu">No editors yet.</p>'}</div><button class="btn g" data-k="apply" style="margin-bottom:60px">Apply to become an editor</button>`}
function vComm(){const ed=Object.entries(E);let cat=FORM.cc||'thumbnails',to=FORM.tt||'cat';
 if(pre&&E[pre]&&eopen(pre)){cat=E[pre].cats[0]||cat;to=pre}
 const opts=c=>{const el=ed.filter(([u,e])=>(e.cats||[]).includes(c)&&eopen(u));return `<option value="cat">All open editors in this category (${el.length})</option>`+el.map(([u])=>`<option value="${u}" ${u===to?'selected':''}>${esc(nm(u))}</option>`).join('')};
 setTimeout(()=>{const c=$('cc');if(c)c.onchange=()=>{FORM.cc=c.value;FORM.tt='cat';$('tt').innerHTML=opts(c.value)}},0);
 return `<div class="com"><div class="panel"><div class="status ${open()?'on':'off'}">${open()?'● OPEN':'● CLOSED'}</div><p>${open()?`Taking custom work. ${SET.slots?`<b>${SET.slots}</b> slots left.`:''}`:'Not accepting new commissions right now.'}</p>${SET.note?`<p class="mu">${esc(SET.note)}</p>`:''}<p class="mu" style="font-size:13px">Your request goes straight to the editor's dashboard on this site. No email.</p></div>
 <div class="panel"><h2 style="font-size:24px" id="request-form">Request a commission</h2>${!UID?need():!open()?'<p class="mu">Commissions are closed, so the form is off.</p>':`<label>Category<select id="cc">${Object.entries(CATS).map(([k,v])=>`<option value="${k}" ${k===cat?'selected':''}>${v}</option>`).join('')}</select></label><label>Send to<select id="tt">${opts(cat)}</select></label><label>What do you need?<textarea id="dt" placeholder="Describe it, style, deadline, budget"></textarea></label><label>Reference links / notes (optional)<textarea id="rf" style="min-height:70px" placeholder="Links to examples, assets, channel, extra notes"></textarea></label><label>Budget (optional)<select id="bd"><option value="">Not sure yet</option><option>Under $50</option><option>$50–$100</option><option>$100+</option></select></label><label>Deadline (optional)<input id="du" type="date"></label><button class="btn" data-a="send">Send request</button> <span class="mu" id="ms">${esc(flash)}</span>`}</div></div>`}
let DASH='',SQ='';
/* ---- Store editor (owner): edits site.json through /api/site, which commits to GitHub ---- */
let SITE=null,SHA='',SMSG='',SG=0,SEC='banner';
async function loadSite(){try{const j=await helixCall('/site');SITE=JSON.parse(j.json);SHA=j.sha;SMSG=''}catch(e){SMSG='Could not load the store data: '+(e.detail||e.code||e.message)}render()}
async function saveSite(){SMSG='Saving…';render();try{const r=await helixCall('/site',{method:'PUT',body:JSON.stringify({json:JSON.stringify(SITE,null,2)+'\n',sha:SHA})});SHA=r.sha;SMSG='Saved. The store redeploys in about a minute.'}catch(e){SMSG='Save failed: '+(e.detail||e.code||e.message)}render()}
function setField(f,el){const p=f.split('.'),key=p[p.length-1],v=el.value,ck=el.type==='checkbox';
 let o=p[0]==='b'?SITE.banner:p[0]==='c'?SITE:p[0]==='l'?SITE.stores[p[1]][+p[2]]:SITE.creators[+p[1]];
 o[key]=ck?(el.checked?1:0):key==='price'?Math.max(0,+v||0):key==='pct'?Math.min(90,Math.max(0,+v||0)):key==='tags'?v.split(',').map(x=>x.trim()).filter(Boolean):key==='endsAt'?(v?new Date(v).toISOString():''):v}
document.addEventListener('input',e=>{const f=e.target.dataset&&e.target.dataset.f;if(f&&SITE)setField(f,e.target)});
document.addEventListener('click',e=>{const b=e.target.closest('[data-st]');if(!b)return;const a=b.dataset.st,k=b.dataset.sk,i=+b.dataset.ix,rid=()=>Math.random().toString(36).slice(2,8);
 if(a==='sec'){SEC=k;SG++;return render()}
 if(a==='reload'){SITE=null;SMSG='';return render()}if(!SITE)return;if(a==='save')return saveSite();
 if(a==='add')SITE.stores[k].push({id:'x'+rid(),n:'New listing',price:0,tags:k==='animations'?['Objects']:[],...(k==='animations'?{cat:'Object'}:{}),link:'',d:''});
 if(a==='del'){if(!confirm('Delete this listing?'))return;SITE.stores[k].splice(i,1)}
 if(a==='addc')SITE.creators.push({id:'c'+rid(),name:'',subs:'',url:'',avatar:''});
 if(a==='delc'){if(!confirm('Delete this creator?'))return;SITE.creators.splice(i,1)}
 SG++;render()});
function pStore(){if(!SITE){if(!SMSG)loadSite();return `<div class="panel wide"><p class="mu">${esc(SMSG||'Loading the store data…')}</p>${SMSG?'<button class="btn sm" data-st="reload">Retry</button>':''}</div>`}
 const B=SITE.banner,GR='display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px',
 loc=iso=>{const d=new Date(iso);if(isNaN(d))return'';d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,16)},
 fld=(p,l,v,t)=>`<label>${l}<input id="s${SG}:${p}" data-f="${p}" type="${t||'text'}" ${t==='number'?'step="any" min="0"':''} value="${esc(v)}"></label>`,
 chk=(p,l,v)=>`<label><input type="checkbox" id="s${SG}:${p}" data-f="${p}" ${v?'checked':''} style="width:auto"> ${l}</label>`;
 const lists=Object.entries(SITE.stores).filter(([k])=>k===SEC).map(([k,a])=>`<div class="panel wide"><h3>${esc(k)} (${a.length})</h3>${a.map((p,i)=>`<div class="own"><b>${esc(p.n||'Untitled')}</b><div style="${GR}">${fld(`l.${k}.${i}.n`,'Name',p.n)}${fld(`l.${k}.${i}.price`,'Price (USD)',p.price,'number')}${fld(`l.${k}.${i}.size`,'Size',p.size)}${fld(`l.${k}.${i}.tags`,'Tags (comma separated)',(p.tags||[]).join(', '))}${fld(`l.${k}.${i}.link`,'Purchase link',p.link)}${fld(`l.${k}.${i}.img`,'Image path (e.g. images/x.webp)',p.img)}</div>${fld(`l.${k}.${i}.d`,'Description',p.d)}<p>${chk(`l.${k}.${i}.new`,'New',p.new)} ${chk(`l.${k}.${i}.popular`,'Popular',p.popular)} ${chk(`l.${k}.${i}.best`,'Best value',p.best)} <button class="btn g sm" data-st="del" data-sk="${k}" data-ix="${i}">Delete</button></p></div>`).join('')||'<p class="mu">No listings yet.</p>'}<button class="btn sm" data-st="add" data-sk="${k}">+ Add listing</button></div>`).join('');
 return `<div class="panel wide"><h3>Store editor</h3><p class="mu">Changes are committed to GitHub when you save, and the store redeploys in about a minute. Prefer editing in place? <a href="/#/store/animations" style="color:var(--cy)">Open the store</a>. You're signed in as owner there too, and every tab has Edit buttons with image upload.</p><button class="btn" data-st="save">Save to store</button> <button class="btn g" data-st="reload">Discard and reload</button> <span class="mu">${esc(SMSG)}</span></div>
 <div class="seg">${[['banner','Banner'],['contact','Contact'],['creators','Creators'],...Object.keys(SITE.stores).map(k=>[k,k[0].toUpperCase()+k.slice(1)])].map(([k,l])=>`<button class="btn ${k===SEC?'':'g'} sm" data-st="sec" data-sk="${k}">${l}</button>`).join(' ')}</div>
 ${SEC==='banner'?`<div class="panel"><h3>Sale banner</h3>${chk('b.enabled','Show the banner',B.enabled)}${fld('b.badge','Badge',B.badge)}${fld('b.text','Text',B.text)}${fld('b.code','Coupon code',B.code)}${fld('b.pct','Discount shown on prices (%)',B.pct,'number')}${fld('b.endsAt','Offer ends',loc(B.endsAt),'datetime-local')}</div>`:''}
 ${SEC==='contact'?`<div class="panel"><h3>Contact</h3>${fld('c.email','Contact email',SITE.email)}${fld('c.discordUrl','Discord invite link (empty hides it)',SITE.discordUrl)}${fld('c.formEndpoint','Commission form endpoint (Formspree)',SITE.formEndpoint)}</div>`:''}
 ${SEC==='creators'?`<div class="panel wide"><h3>Creators using Helix</h3>${(SITE.creators||[]).map((c,i)=>`<div class="own"><div style="${GR}">${fld(`cr.${i}.name`,'Name',c.name)}${fld(`cr.${i}.subs`,'Subscribers',c.subs)}${fld(`cr.${i}.url`,'Channel link',c.url)}${fld(`cr.${i}.avatar`,'Avatar path',c.avatar)}</div><button class="btn g sm" data-st="delc" data-ix="${i}">Delete</button></div>`).join('')||'<p class="mu">No creators yet.</p>'}<button class="btn sm" data-st="addc">+ Add creator</button></div>`:''}${lists}
 <div class="panel wide"><button class="btn" data-st="save">Save to store</button> <span class="mu">${esc(SMSG)}</span></div>`}
document.addEventListener('input',e=>{if(e.target.id==='sq'){SQ=e.target.value.toLowerCase();render()}});


/* ---------- Commission hub views ---------- */
function vChats(){if(!UID)return need();const th=[];
 for(const c of allC())if(c.from===UID)for(const e of cinfo(c).eds)th.push({c,cl:UID,e});
 for(const c of inbox())if(['accepted','done'].includes(ST(UID,c.id)))th.push({c,cl:c.from,e:UID});
 const wait=((C[UID]||{}).items||[]).filter(c=>!cinfo(c).eds.length);
 return `<h2 class="hx-h">Conversations</h2><p class="mu">Every chat with an editor lives here. Support chats are under the Support tab.</p><p class="mu" id="ms">${esc(flash)}</p>
 ${th.map(({c,cl,e})=>`<div class="panel wide own"><b>${CATS[c.cat]}</b> <span class="mu">· ${esc(String(c.d).slice(0,90))}</span>${chat(c.id,cl,e)}</div>`).join('')}
 ${wait.map(c=>`<div class="panel wide own"><b>${CATS[c.cat]}</b> ${stTag('pending')} <span class="mu">· ${esc(String(c.d).slice(0,90))}</span><p class="mu">Waiting for an editor to accept. The chat opens once they do.</p></div>`).join('')}
 ${th.length||wait.length?'':'<div class="panel"><p class="mu">No conversations yet. <a href="#request" data-k="request" style="color:var(--cy)">Send a commission request</a> to start one.</p></div>'}`}
function vApply(){if(!UID)return need();const ap=AP[UID],sa=SA[UID];
 const ed=isEd()?`<div class="panel"><h3>Editor</h3><p>You are an editor. Manage your inbox and portfolio in the <a href="/editor/" style="color:var(--cy)">editor dashboard</a>.</p></div>`:
 `<div class="panel"><h3>Become an editor</h3>${ap&&ap.status==='pending'?'<p>Your application is pending review.</p>':`${ap?`<p class="mu">Last application: ${esc(ap.status)}</p>`:''}<p class="mu">Pick what you make:</p>${Object.entries(CATS).map(([k,v])=>`<label><input type="checkbox" class="ac" value="${k}" style="width:auto"> ${v}</label>`).join('')}<label>About you / link to work<textarea id="ab"></textarea></label><button class="btn" data-a="apply">Send application</button> <span class="mu">${esc(flash)}</span>`}</div>`;
 const se=isSell()?`<div class="panel"><h3>Seller</h3><p>You are an approved seller. Open the <a href="/seller/" style="color:var(--cy)">seller dashboard</a>.</p></div>`:
 `<div class="panel"><h3>Become a seller</h3>${sa&&sa.status==='pending'?'<p>Your seller application is pending review.</p>':`${sa?`<p class="mu">Last application: ${esc(sa.status)}</p>`:''}<p class="mu">Sell builds, plugins or animations in the Helix store.</p><label>Shop or brand name<input id="sn" maxlength="60"></label><label>What will you sell?<select id="sk"><option value="builds">Builds</option><option value="plugins">Plugins</option><option value="animations">Animations</option></select></label><label>Link to examples<input id="sl2" placeholder="https://"></label><label>About you<textarea id="sb" maxlength="600"></textarea></label><button class="btn" data-a="sapply">Send seller application</button> <span class="mu" id="ms2">${esc(flash)}</span>`}</div>`;
 return `<h2 class="hx-h">Apply</h2><p class="mu">Applications go to the owner's queue. You'll get a notification when they are reviewed.</p><div class="com">${ed}${se}</div>`}
const TKS=['General question','Order or payment problem','Report a problem','Something else'];
function vSupport(){const mail=`<p class="mu">Prefer email? <a href="mailto:${esc(S.email)}" style="color:var(--cy)">${esc(S.email)}</a></p>`;
 if(!UID)return `<h2 class="hx-h">Support</h2>${need()}<div class="panel">${mail}</div>`;
 const T=(OWNER?Object.entries(SP).flatMap(([u,d])=>(d.items||[]).map(t=>({...t,u}))):((SP[UID]||{}).items||[]).map(t=>({...t,u:UID}))).sort((a,b)=>b.at-a.at);
 return `<h2 class="hx-h">Support</h2><p class="mu">Questions, order problems and anything else. Replies arrive as notifications.</p><div class="com">
 ${OWNER?'':`<div class="panel"><h3>New support request</h3><label>Topic<select id="ts">${TKS.map(t=>`<option>${t}</option>`).join('')}</select></label><label>Message<textarea id="tm" maxlength="800" placeholder="What do you need help with?"></textarea></label><button class="btn" data-a="tk">Send</button> <span class="mu" id="ms">${esc(flash)}</span>${mail}</div>`}
 <div class="panel wide"><h3>${OWNER?'Support inbox':'Your support requests'}</h3>${T.map(t=>{const k='sup_'+t.id+':'+t.u,ok=t.st!=='closed';return `<div class="own"><b>${esc(t.s)}</b> ${OWNER?`<span class="mu">from ${esc(nm(t.u))}</span>`:''} ${stTag(t.st||'open')} <span class="mu">${when(t.at)}</span>${thread({title:'Conversation',msgs:supMsgs(k),ok,note:ok?'':'This request is closed.',empty:'No messages yet.',sfx:k.replace(':','-'),send:`data-a="smsg" data-th="${k}"`})}${OWNER||t.u===UID?`<button class="btn g sm" data-a="tkst" data-u="${t.u}" data-id="${t.id}">${ok?'Close request':'Reopen'}</button>`:''}</div>`}).join('')||'<p class="mu">Nothing here yet.</p>'}</div></div>`}

/* ---------- dashboards (own routes, no chats or commission forms) ---------- */
const roleTags=()=>`${stTag(OWNER?'owner':isEd()?'editor':'user').replace('st-','x-')}${isSell()?' <span class="tag">seller</span>':''}`;
const dh=(t,sub)=>`<h2 class="hx-h">${t}</h2><p class="mu">Signed in as <b>${esc(nm(UID))}</b> ${roleTags()} · ${sub}</p>`;
function vDashboard(){if(!UID)return need();const sent=((C[UID]||{}).items||[]),ap=AP[UID],sa=SA[UID];
 return dh('Dashboard','Your requests and applications at a glance.')+`<div class="com"><div class="panel wide"><h3>Your requests</h3><p class="mu">Chat, deliverables, revisions and reviews are in <a href="/commission/#chats" style="color:var(--cy)">Conversations</a>.</p>${open()?'<a class="btn sm" href="/commission/#request">+ New commission</a>':''}
 ${sent.map(c=>{const{eds,s}=cinfo(c),n=eds.length?(s==='done'?3:(((IN[eds[0]]||{}).ms||{})[c.id]??-1)):-1;return `<div class="own"><b>${CATS[c.cat]}</b> → ${c.to==='person'?esc(nm(c.uid)):'all editors'} ${stTag(s)} <span class="mu">${when(c.at)}</span><p style="white-space:pre-wrap">${esc(c.d)}</p>${meta(c)}${n>=0?`<div class="stg">${STG.map((g,i)=>`<span class="${i<=n?'on':''}">${g}</span>`).join('')}</div>`:''}<a href="/commission/#chats" style="color:var(--cy)">Open conversation →</a></div>`}).join('')||'<p class="mu">You have not sent any requests yet.</p>'}</div>
 <div class="panel"><h3>Applications</h3><p>Editor: ${ap?stTag(ap.status):'<span class="mu">not applied</span>'}</p><p>Seller: ${sa?stTag(sa.status):'<span class="mu">not applied</span>'}</p><a href="/commission/#apply" style="color:var(--cy)">Manage applications →</a></div>
 <div class="panel"><h3>Your dashboards</h3>${isEd()?'<p><a href="/editor/" style="color:var(--cy)">Editor dashboard</a></p>':''}${isSell()?'<p><a href="/seller/" style="color:var(--cy)">Seller dashboard</a></p>':''}${OWNER?'<p><a href="/admin/" style="color:var(--cy)">Admin</a></p>':''}${isEd()||isSell()||OWNER?'':'<p class="mu">Editor and seller dashboards unlock when your application is approved.</p>'}</div></div>`}
function vEditorDash(){if(!UID)return need();if(!isEd())return dh('Editor dashboard','Editors only.')+`<div class="panel"><p>This area is for approved editors. <a href="/commission/#apply" style="color:var(--cy)">Apply to become an editor</a>.</p></div>`;
 const my=(W[UID]||{}).items||[];
 return dh('Editor dashboard','Your inbox, portfolio and public profile.')+`<div class="com"><div class="panel wide"><h3>Taking commissions</h3><div class="sw"><button role="switch" aria-checked="${eopen(UID)}" data-a="myopen" aria-label="Taking commissions"></button><span>${eopen(UID)?'Open: you can be picked directly and receive "all editors" requests':'Closed: hidden from new requests'}</span></div><p class="mu" style="font-size:13px">Closing only affects new requests. Projects you already accepted stay as they are.</p></div>
 <div class="panel wide"><h3>Commission inbox</h3><p class="mu">${esc(flash)}</p><p class="mu">Accept or decline here. Chat, deliverables and revisions happen in <a href="/commission/#chats" style="color:var(--cy)">Conversations</a>.</p>${inbox().map(c=>{const st=ST(UID,c.id)||'new',n=st==='done'?3:(((IN[UID]||{}).ms||{})[c.id]??-1);return `<div class="own"><b>${esc(nm(c.from))}</b> → ${c.to==='person'?'you':'all '+CATS[c.cat]+' editors'} <span class="mu">· ${CATS[c.cat]} · ${when(c.at)}</span><p style="white-space:pre-wrap">${esc(c.d)}</p>${c.ref?`<p class="mu">Ref: ${links(c.ref)}</p>`:''}${meta(c)}${stTag(st)} ${['accepted','declined','done'].map(s=>`<button class="btn g sm" data-a="st" data-id="${c.id}" data-s="${s}">${s}</button>`).join(' ')}${st==='accepted'?`<p class="mu" style="font-size:12px">Set stage: ${STG.map((g,i)=>`<button class="btn ${i===n?'':'g'} sm" data-a="ms" data-id="${c.id}" data-n="${i}">${g}</button>`).join(' ')}</p>`:''}${['accepted','done'].includes(st)?'<p><a href="/commission/#chats" style="color:var(--cy)">Open conversation →</a></p>':''}</div>`}).join('')||'<p class="mu">No requests yet.</p>'}</div>
 <div class="panel"><h3>Add your work</h3><label>Title<input id="wt" maxlength="40"></label><label>Description<input id="wd" maxlength="120"></label><label>Category<select id="wc">${mine().map(c=>`<option value="${c}">${CATS[c]}</option>`).join('')}</select></label><label>Video link (optional)<input id="wl" placeholder="https://"></label><button class="btn" data-a="addw">Add to portfolio</button> <span class="mu">${esc(flash)}</span><h3 style="margin-top:22px">Your works</h3>${my.map(w=>`<p>${esc(w.t)} <span class="mu">· ${CATS[w.cat]}</span> <button class="btn g sm" data-a="delw" data-id="${w.id}">Remove</button></p>`).join('')||'<p class="mu">None yet.</p>'}</div>
 <div class="panel"><h3>Your social links</h3><p class="mu">Shown to clients on your works and profile.</p>${SOC.map(([k,l])=>`<label>${l}<input id="pr_${k}" maxlength="120" value="${esc((PR[UID]||{})[k]||'')}" placeholder="${k==='dc'?'username':k==='site'?'yourportfolio.com':'@handle or link'}"></label>`).join('')}<button class="btn" data-a="savepr">Save socials</button></div></div>`}
function vSeller(){if(!UID)return need();if(!isSell())return dh('Seller dashboard','Sellers only.')+`<div class="panel"><p>This area is for approved sellers. <a href="/commission/#apply" style="color:var(--cy)">Apply to become a seller</a>.</p></div>`;
 const sa=SA[UID]||{};
 return dh('Seller dashboard','Your seller account.')+`<div class="com"><div class="panel"><h3>Account</h3><p>${OWNER?'You are the owner.':`Approved seller${sa.shop?': <b>'+esc(sa.shop)+'</b>':''}.`}</p>${sa.kind?`<p class="mu">Selling: ${esc(sa.kind)}</p>`:''}</div><div class="panel"><h3>Listings</h3><p class="mu">Self-serve listing tools are not built yet. Send new listings through <a href="/commission/#support" style="color:var(--cy)">Support</a> and the owner adds them to the Store.</p></div></div>`}
function pOwnerApps(){const pend=(o)=>Object.entries(o).filter(([u,a])=>a.status==='pending');
 return `<div class="panel"><h3>Editor applications</h3>${pend(AP).map(([u,a])=>`<div class="own"><b>${esc(nm(u))}</b> <span class="mu">${(a.cats||[]).map(c=>CATS[c]).join(', ')}</span><p>${esc(a.bio)}</p><button class="btn sm" data-a="appr" data-id="${u}">Approve</button> <button class="btn g sm" data-a="rej" data-id="${u}">Reject</button></div>`).join('')||'<p class="mu">No pending applications.</p>'}<h3 style="margin-top:22px">Editors</h3>${Object.keys(E).map(u=>`<p>${esc(nm(u))} <span class="mu">${(E[u].cats||[]).map(c=>CATS[c]).join(', ')}</span> <button class="btn g sm" data-a="rmed" data-id="${u}">Remove</button></p>`).join('')||'<p class="mu">None.</p>'}</div>
 <div class="panel"><h3>Seller applications</h3>${pend(SA).map(([u,a])=>`<div class="own"><b>${esc(nm(u))}</b> <span class="mu">${esc(a.shop||'')} · ${esc(a.kind||'')}</span><p>${esc(a.bio||'')}</p>${a.link?`<p class="mu">${links(a.link)}</p>`:''}<button class="btn sm" data-a="sappr" data-id="${u}">Approve</button> <button class="btn g sm" data-a="srej" data-id="${u}">Reject</button></div>`).join('')||'<p class="mu">No pending applications.</p>'}<h3 style="margin-top:22px">Sellers</h3>${Object.keys(SL).map(u=>`<p>${esc(nm(u))} <button class="btn g sm" data-a="rmsell" data-id="${u}">Remove</button></p>`).join('')||'<p class="mu">None.</p>'}</div>`}

/* ---------- Admin > Home page: typed sections, draft/publish, preview, reorder, revisions ---------- */
const HTYPES={hero:'Hero',cards:'Section cards',featured:'Featured products',showcase:'Showcase highlights',commission:'Commission promotion',faq:'FAQ preview',creators:'Creators'};
const HLINKN={store:'Store',showcase:'Showcase',faq:'FAQ',commission:'Commission'};
const clone=o=>JSON.parse(JSON.stringify(o)),DEF=()=>window.HX_HOME_DEFAULT;
function hdInit(){if(HD||!OWNER||!HLOAD)return;HD=clone(HOME.draft||HOME.published||DEF());HDD=false}
const hin=(i,path,label,val,o={})=>`<label>${label}${o.area?`<textarea id="hs${i}_${path.replace(/\./g,'_')}" data-hs="${i}|${path}" maxlength="${o.max||300}">${esc(val)}</textarea>`:`<input id="hs${i}_${path.replace(/\./g,'_')}" data-hs="${i}|${path}" maxlength="${o.max||80}" value="${esc(val)}"${o.num?' type="number" min="1" max="6"':''}>`}</label>`;
const hsel=(i,path,label,val)=>`<label>${label}<select id="hs${i}_${path.replace(/\./g,'_')}" data-hs="${i}|${path}">${Object.entries(HLINKN).map(([k,v])=>`<option value="${k}" ${k===val?'selected':''}>${v}</option>`).join('')}</select></label>`;
function hfields(sec,i){const t=sec.type;
 if(t==='hero')return hin(i,'title','Headline',sec.title,{max:160})+hin(i,'text','Description',sec.text,{area:1})+hin(i,'pLabel','Primary button text',sec.pLabel,{max:30})+hsel(i,'pLink','Primary button goes to',sec.pLink)+hin(i,'sLabel','Secondary button text',sec.sLabel,{max:30})+hsel(i,'sLink','Secondary button goes to',sec.sLink);
 if(t==='cards')return hin(i,'title','Heading (optional)',sec.title)+sec.items.map((it,j)=>`<div class="own"><b>${HLINKN[it.k]} card</b>${hin(i,'items.'+j+'.t','Title',it.t,{max:40})}${hin(i,'items.'+j+'.d','One-line description',it.d,{max:140})}</div>`).join('');
 if(t==='featured'){const ps=SJ?Object.values(SJ.stores).flat().filter(p=>p.n):[];return hin(i,'title','Heading',sec.title)+hin(i,'text','Intro (optional)',sec.text,{max:160})+hin(i,'count','How many (1-6)',sec.count,{num:1})+`<p class="mu" style="font-size:13px">Tick products to feature. Leave all unticked to show best value, popular and new items automatically.</p><div style="max-height:200px;overflow:auto;border:1px solid var(--line);border-radius:10px;padding:8px">${ps.map(p=>`<label style="display:flex;gap:8px;align-items:center;margin:0"><input type="checkbox" style="width:auto" data-hc="${i}|${esc(p.id)}" ${(sec.ids||[]).includes(p.id)?'checked':''}> ${esc(p.n)}</label>`).join('')||'<span class="mu">Loading products…</span>'}</div>`}
 if(t==='showcase')return hin(i,'title','Heading',sec.title)+hin(i,'text','Intro (optional)',sec.text,{max:160})+hin(i,'count','How many (1-6)',sec.count,{num:1})+'<p class="mu" style="font-size:13px">Shows the newest works editors have added. Hidden automatically when there are none.</p>';
 if(t==='commission')return hin(i,'title','Heading',sec.title)+hin(i,'text','Text',sec.text,{area:1})+hin(i,'label','Button text',sec.label,{max:30})+'<p class="mu" style="font-size:13px">The open/closed badge comes from your live commission settings.</p>';
 if(t==='faq')return hin(i,'title','Heading',sec.title)+hin(i,'count','How many (1-6)',sec.count,{num:1})+'<p class="mu" style="font-size:13px">Shows the first questions from the FAQ page. Edit them there.</p>';
 return hin(i,'title','Heading',sec.title)+'<p class="mu" style="font-size:13px">Lists the creators you manage in the Store editor.</p>'}
const hsum=s=>esc(s.title||(s.items&&s.items[0]&&'Four cards')||'')
function vHome(){hdInit();if(!HD)return '<p class="mu">Loading…</p>';const pub=HOME.published,dr=HOME.draft,fmt=t=>t?new Date(t).toLocaleString():'never';
 const revs=Object.entries(HREV).sort((a,b)=>b[0].localeCompare(a[0]));
 return `<div class="panel wide"><h3>Home page</h3><p class="mu">Typed sections only: text, links and product picks. No HTML or scripts. Visitors see the <b>published</b> version; your edits stay in the <b>draft</b> until you publish.</p>
 <p class="mu">Published: ${fmt(pub&&pub.at)} · Draft saved: ${fmt(dr&&dr.at)} ${HDD?'· <b style="color:#facc15">Unsaved changes</b>':''}</p>
 <p><button class="btn sm" data-a="hsave">Save draft</button> <a class="btn g sm" href="/?preview=1" target="_blank" rel="noopener">Preview saved draft</a> <button class="btn sm" data-a="hpub">Publish</button> <button class="btn g sm" data-a="hdisc">Discard changes</button> <button class="btn g sm" data-a="hreset">Reset to defaults</button></p>
 <p class="mu" id="hmsg">${esc(HMSG)}</p><p class="mu" style="font-size:13px">The sale banner has its own settings: <a href="/#/admin" style="color:var(--cy)">Store editor → Site settings</a>. Hero images come from your products' real renders.</p></div>
 <div class="panel wide"><h3>Sections (top to bottom)</h3>${HD.sections.map((s,i)=>`<div class="own"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><div class="sw"><button role="switch" aria-checked="${!!s.on}" data-a="hon" data-i="${i}" aria-label="Show section"></button></div><b>${HTYPES[s.type]}</b> <span class="mu">${hsum(s)}</span><span style="margin-left:auto;display:flex;gap:6px"><button class="btn g sm" data-a="hmv" data-i="${i}" data-d="-1" ${i?'':'disabled'}>↑</button><button class="btn g sm" data-a="hmv" data-i="${i}" data-d="1" ${i<HD.sections.length-1?'':'disabled'}>↓</button><button class="btn g sm" data-a="hedit" data-i="${i}">${HOPEN===i?'Close':'Edit'}</button><button class="btn g sm" data-a="hdel" data-i="${i}">Delete</button></span></div>${HOPEN===i?`<div style="margin-top:10px">${hfields(s,i)}</div>`:''}</div>`).join('')||'<p class="mu">No sections.</p>'}
 <p style="margin-top:14px"><select id="hadd" style="width:auto">${Object.entries(HTYPES).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select> <button class="btn sm" data-a="hadd">Add section</button></p></div>
 <div class="panel wide"><h3>Revision history</h3><p class="mu">Every publish saves a copy. Restoring loads it into the draft; publish to make it live.</p>${revs.map(([id,r])=>`<p>${fmt(r.at)} <span class="mu">· ${r.sections.length} sections</span> <button class="btn g sm" data-a="hrest" data-id="${id}">Restore to draft</button></p>`).join('')||'<p class="mu">No published versions yet.</p>'}</div>`}
const setp=(o,path,v)=>{const k=path.split('.');let c=o;for(let n=0;n<k.length-1;n++)c=c[k[n]];c[k[k.length-1]]=v};
document.addEventListener('input',e=>{const t=e.target,d=t.dataset&&t.dataset.hs;if(!d||!HD)return;const[i,path]=d.split('|');setp(HD.sections[+i],path,t.type==='number'?Math.min(6,Math.max(1,+t.value||1)):t.value);HDD=true});
document.addEventListener('change',e=>{const t=e.target,d=t.dataset&&t.dataset.hs;if(d&&HD){const[i,path]=d.split('|');setp(HD.sections[+i],path,t.value);HDD=true}
 const c=t.dataset&&t.dataset.hc;if(c&&HD){const[i,id]=c.split('|'),sec=HD.sections[+i],a=(sec.ids||[]).filter(x=>x!==id);if(t.checked){if(a.length>=6){t.checked=false;return}a.push(id)}sec.ids=a;HDD=true}});
function vAdmin(){if(!UID)return need();if(!OWNER)return dh('Admin','Owner only.')+`<div class="panel"><p>This area is for the site owner.</p></div>`;
 const nT=Object.values(SP).reduce((n,d)=>n+((d.items||[]).filter(t=>t.st!=='closed').length),0),nA=[AP,SA].reduce((n,o)=>n+Object.values(o).filter(a=>a.status==='pending').length,0);
 const seg=`<div class="seg">${[['overview','Overview'],['home','Home page'],['applications','Applications'+(nA?` (${nA})`:'')],['support','Support'+(nT?` (${nT})`:'')],['store','Store editor']].map(([k,l])=>`<a class="btn ${k===tab?'':'g'} sm" href="#${k}">${l}</a>`).join(' ')}</div>`;
 const body=tab==='home'?vHome():tab==='applications'?`<div class="com">${pOwnerApps()}</div>`:tab==='support'?`<div class="panel"><p>${nT} open support request${nT===1?'':'s'}. Replies happen in <a href="/commission/#support" style="color:var(--cy)">Commission → Support</a>.</p></div>`:tab==='store'?`<div class="com">${pStore()}</div>`:`<div class="com">${pOwner()}</div>`;
 return dh('Admin','Run the site.')+seg+body}

function pOwner(){const all=Object.entries(C).flatMap(([u,d])=>(d.items||[]).map(c=>({...c,from:u}))).sort((x,y)=>y.at-x.at),n={pending:0,accepted:0,done:0,declined:0};all.forEach(c=>{const s=cinfo(c).s;n[s]=(n[s]||0)+1});
 return `<div class="panel"><h3>Commission settings</h3><div class="sw"><button role="switch" aria-checked="${open()}" data-a="sw"></button><span>Commissions ${open()?'open':'closed'}</span></div><label>Slots left<input id="sl" type="number" min="0" value="${SET.slots??S.slots}"></label><label>Message<input id="nt" value="${esc(SET.note||'')}"></label><button class="btn" data-a="saveset">Save</button></div>
 <div class="panel wide"><h3>All commissions</h3><p class="mu">${all.length} total · ${n.pending} pending · ${n.accepted} accepted · ${n.done} done · ${n.declined} declined</p>${all.map(c=>{const i=cinfo(c);return `<p>${esc(nm(c.from))} → ${c.to==='person'?esc(nm(c.uid)):'all '+CATS[c.cat]} ${stTag(i.s)} <span class="mu">${when(c.at)} · ${esc(c.d.slice(0,50))}</span></p>`}).join('')||'<p class="mu">None yet.</p>'}</div>`}

async function render(){const t=++rt;await names([...Object.keys(E),...Object.keys(W),...Object.keys(C),...Object.keys(AP),...Object.keys(SA),...Object.keys(SP),UID]);if(t!==rt)return;
 const sv={};document.querySelectorAll('#app [id]').forEach(x=>{if('value' in x)sv[x.id]=x.value});const fid=document.activeElement&&document.activeElement.id,y=scrollY;
 const V={showcase:vWorks,commission:()=>({request:()=>vComm()+vEditors(),chats:vChats,apply:vApply,support:vSupport}[tab]()),dashboard:vDashboard,editor:vEditorDash,seller:vSeller,admin:vAdmin}[PAGE];
 $('app').innerHTML=V();
 for(const k in sv)if($(k)&&k!=='cc'&&k!=='tt')$(k).value=sv[k];if(fid&&$(fid))$(fid).focus();scrollTo(0,y);
 document.querySelectorAll('.msgs').forEach(m=>m.scrollTop=m.scrollHeight)}
document.addEventListener('change',e=>{if(e.target.id==='cc'||e.target.id==='tt')FORM[e.target.id]=e.target.value});
const re=()=>render();
const go=k=>{if((PTABS[PAGE]||[]).includes(k)){tab=k;location.hash=k;scrollTo(0,0);render()}else if(ROUTE[k])location.href=ROUTE[k]};
document.addEventListener('click',async e=>{const b=e.target.closest('[data-k],[data-a]');if(!b)return;
 if(b.dataset.k)return go(b.dataset.k);const a=b.dataset.a,id=b.dataset.id,v=i=>($(i)||{}).value?.trim()||'';flash='';
  if(a==='to'){if(PAGE!=='commission'){try{sessionStorage.setItem('hx_pre',id)}catch(_){}location.href='/commission/#request';return}pre=id;return go('request')}
 if(a==='view'){const it=works().find(i=>i.id===id),d=$('dlg');d.innerHTML=`${thumb(it,it.sw==='thumbnails'?'yt':'cube')}<div class="b"><h2>${esc(it.t)}</h2><p class="mu">${esc(it.d)} · by <b>${esc(nm(it.by))}</b></p>${tags(it.tags)}<br>${it.by?socials(it.by)+'<br>':''}${/^https?:\/\//.test(it.link||'')?`<a class="btn" style="display:inline-block;text-decoration:none" href="${esc(it.link)}" target="_blank" rel="noopener">Watch</a> `:''}${it.by&&E[it.by]&&open()&&eopen(it.by)?`<button class="btn" data-a="to" data-id="${it.by}" onclick="dlg.close()">Commission ${esc(nm(it.by).split(' ')[0])}</button> `:''}<button class="btn g" onclick="dlg.close()">Close</button></div>`;return d.showModal()}
 if(!UID){alert('Sign in first with the Sign In button at the top right.');return}let r='';
 if(a==='send'){if(!v('dt'))return $('ms').textContent='Describe what you need.';if(v('tt')==='cat'?!Object.entries(E).some(([u,e])=>(e.cats||[]).includes(v('cc'))&&eopen(u)):!eopen(v('tt')))return $('ms').textContent='No open editor is available for that choice.';const to=v('tt')==='cat'?{to:'cat'}:{to:'person',uid:v('tt')};
  r=await wr('commissions/'+UID,{items:[...((C[UID]||{}).items||[]),{id:Date.now().toString(36),...to,cat:v('cc'),d:v('dt').slice(0,1500),ref:v('rf').slice(0,600),bud:v('bd'),due:v('du'),at:Date.now()}]});flash=r?'Could not send: '+r:'Sent! Track it in your Dashboard.';pre='';FORM={};if(!r)return go('chats')}
 if(a==='addw'){if(!v('wt'))return;r=await wr('works/'+UID,{items:[...((W[UID]||{}).items||[]),{id:'w'+Date.now().toString(36),t:v('wt'),d:v('wd'),cat:v('wc'),tags:[CATS[v('wc')]],h:Math.floor(Math.random()*360),link:v('wl'),dur:'10:00'}]});flash=r?'Failed: '+r:'Added.'}
 if(a==='savepr'){r=await wr('profiles/'+UID,{...(PR[UID]||{}),...Object.fromEntries(SOC.map(([k])=>[k,v('pr_'+k).slice(0,120)]))});flash=r?'Failed: '+r:'Saved.'}
 if(a==='msg'){const x=v('m-'+id+'-'+b.dataset.e);if(!x)return;const k=key(id,b.dataset.e),m=(CH[UID]||{}).m||{};r=await wr('chats/'+UID,{...(CH[UID]||{}),m:{...m,[k]:[...(m[k]||[]),{at:Date.now(),x}].slice(-100)}});if(!r){const i=$('m-'+id+'-'+b.dataset.e);if(i)i.value='';return}}
 if(a==='delw')r=await wr('works/'+UID,{items:W[UID].items.filter(w=>w.id!==id)});
 if(a==='st'){const s=b.dataset.s,c=allC().find(x=>x.id===id);if(s==='accepted'&&c&&c.to==='cat'){const cl=claimer(c);if(cl&&cl!==UID){flash='Already taken by another editor.';return render()}}
  const o=IN[UID]||{},sa={...(o.sa||{})};if(s==='accepted'&&!sa[id])sa[id]=Date.now();r=await wr('inbox/'+UID,{...o,st:{...(o.st||{}),[id]:s},sa})}
 if(a==='myopen')r=await wr('profiles/'+UID,{...(PR[UID]||{}),closed:!(PR[UID]||{}).closed});
 if(a==='rev'){const e=b.dataset.e,k=key(id,e),o=(CH[UID]||{}).rev||{};r=await wr('chats/'+UID,{...(CH[UID]||{}),rev:{...o,[k]:[...(o[k]||[]),{at:Date.now(),x:v('rq-'+id+'-'+e)}].slice(-20)}})}
 if(a==='ms')r=await wr('inbox/'+UID,{...(IN[UID]||{}),ms:{...((IN[UID]||{}).ms||{}),[id]:+b.dataset.n}});
 if(a==='dl'){const e=b.dataset.e,u=v('dl-u-'+id+'-'+e);if(!/^https?:\/\//.test(u))return alert('Add a link starting with https://');const k=key(id,e),d=(CH[UID]||{}).dl||{};r=await wr('chats/'+UID,{...(CH[UID]||{}),dl:{...d,[k]:[...(d[k]||[]),{at:Date.now(),l:v('dl-l-'+id+'-'+e),u}].slice(-20)}})}
 if(a==='rv'){const e=b.dataset.e,k=key(id,e),o=(RV[UID]||{}).r||{};r=await wr('reviews/'+UID,{r:{...o,[k]:{s:Math.min(5,Math.max(1,+v('rv-s-'+id+'-'+e)||5)),x:v('rv-t-'+id+'-'+e).slice(0,300),at:Date.now()}}})}
 if(a==='apply'){const c=[...document.querySelectorAll('.ac:checked')].map(x=>x.value);if(!c.length)flash='Pick at least one category.';else{r=await wr('applications/'+UID,{cats:c,bio:v('ab').slice(0,600),status:'pending'});flash=r?'Failed: '+r:''}}
 if(OWNER&&tab==='home'){const i=+b.dataset.i;
  if(a==='hon'){HD.sections[i].on=!HD.sections[i].on;HDD=true;return render()}
  if(a==='hmv'){const j=i+ +b.dataset.d;if(j<0||j>=HD.sections.length)return;[HD.sections[i],HD.sections[j]]=[HD.sections[j],HD.sections[i]];if(HOPEN===i)HOPEN=j;HDD=true;return render()}
  if(a==='hedit'){HOPEN=HOPEN===i?-1:i;return render()}
  if(a==='hdel'){if(!confirm('Remove this section from the draft?'))return;HD.sections.splice(i,1);HOPEN=-1;HDD=true;return render()}
  if(a==='hadd'){if(HD.sections.length>=24){HMSG='Too many sections.';return render()}const ty=v('hadd'),d=DEF().sections.find(x=>x.type===ty)||{type:ty};HD.sections.push({...clone(d),id:'s'+Date.now().toString(36),type:ty,on:true});HOPEN=HD.sections.length-1;HDD=true;return render()}
  if(a==='hdisc'){if(HDD&&!confirm('Discard your unsaved changes?'))return;HD=clone(HOME.draft||HOME.published||DEF());HDD=false;HOPEN=-1;HMSG='Changes discarded.';return render()}
  if(a==='hreset'){if(!confirm('Replace the draft with the default layout?'))return;HD=clone(DEF());HDD=true;HOPEN=-1;HMSG='Defaults loaded into the draft. Save or publish to keep them.';return render()}
  if(a==='hrest'){HD=clone(HREV[b.dataset.id]);HDD=true;HOPEN=-1;HMSG='Revision loaded into the draft. Save or publish to keep it.';return render()}
  if(a==='hsave'){const r0=await wr('home/draft',HD);HMSG=r0?'Save failed: '+r0:'Draft saved.';if(!r0)HDD=false;return render()}
  if(a==='hpub'){if(!confirm('Publish this to the live home page?'))return;const at=Date.now();let r0=await wr('home/draft',HD);if(!r0)r0=await wr('home/published',HD);if(!r0){await wr('homerev/r'+at,HD);const old=Object.keys(HREV).concat('r'+at).sort().reverse().slice(20);for(const o of old)try{await DB.doc('homerev/'+o).delete()}catch(x){}HDD=false}HMSG=r0?'Publish failed: '+r0:'Published. The live home page is updated.';return render()}}

 if(a==='tk'){const sj=v('ts'),tx=v('tm');if(!tx)return $('ms').textContent='Write a message first.';const id='t'+Date.now().toString(36),k='sup_'+id+':'+UID,m=(CH[UID]||{}).m||{};
  r=await wr('support/'+UID,{items:[...((SP[UID]||{}).items||[]),{id,s:sj,at:Date.now(),st:'open'}]});if(!r)r=await wr('chats/'+UID,{...(CH[UID]||{}),m:{...m,[k]:[{at:Date.now(),x:tx.slice(0,800)}]}});flash=r?'Could not send: '+r:'Sent. Replies arrive as notifications.'}
 if(a==='smsg'){const k=b.dataset.th,x=v('m-'+k.replace(':','-'));if(!x)return;const m=(CH[UID]||{}).m||{};r=await wr('chats/'+UID,{...(CH[UID]||{}),m:{...m,[k]:[...(m[k]||[]),{at:Date.now(),x}].slice(-100)}});if(!r){const i=$('m-'+k.replace(':','-'));if(i)i.value='';return}}
 if(a==='tkst'){const u=b.dataset.u,d=SP[u]||{};r=await wr('support/'+u,{items:(d.items||[]).map(t=>t.id===id?{...t,st:t.st==='closed'?'open':'closed'}:t)})}
 if(a==='sapply'){if(!v('sn'))return $('ms2').textContent='Add a shop or brand name.';r=await wr('sellerapps/'+UID,{shop:v('sn').slice(0,60),kind:v('sk'),link:v('sl2').slice(0,200),bio:v('sb').slice(0,600),status:'pending',at:Date.now()});flash=r?'Failed: '+r:''}
 if(OWNER){if(a==='sappr'){r=await wr('sellers/'+id,{at:Date.now()});await wr('sellerapps/'+id,{...SA[id],status:'approved'})}
  if(a==='srej')r=await wr('sellerapps/'+id,{...SA[id],status:'rejected'});
  if(a==='rmsell')try{await DB.doc('sellers/'+id).delete()}catch(x){}}

 if(OWNER){if(a==='appr'){r=await wr('editors/'+id,{cats:AP[id].cats});await wr('applications/'+id,{...AP[id],status:'approved'})}
  if(a==='rej')r=await wr('applications/'+id,{...AP[id],status:'rejected'});
  if(a==='rmed')try{await DB.doc('editors/'+id).delete()}catch(x){}
  if(a==='sw')r=await wr('settings/main',{...SET,open:!open()});
  if(a==='saveset')r=await wr('settings/main',{...SET,open:open(),slots:+v('sl')||0,note:v('nt')})}
 render()});


addEventListener('hashchange',()=>{const t=hashTab();if(t!==tab){tab=t;render()}});
if(PAGE==='admin')fetch('/site.json').then(r=>r.json()).then(j=>{SJ=j;if(tab==='home'&&HOPEN>=0)render()}).catch(()=>{});
render();
(async()=>{try{U=await claude.use('user');if(U){OWNER=await U.isOwner();UID=await U.id()}DB=await claude.use('db')}catch(e){}
 if(!DB)return render();
 const map=s=>Object.fromEntries(s.docs.map(d=>[d.id,d.data()]));
 const sub=(p,f)=>{try{DB.collection(p).onSnapshot(s=>{f(map(s));re()},()=>{})}catch(e){}};
 sub('editors',x=>E=x);sub('works',x=>W=x);sub('commissions',x=>C=x);sub('inbox',x=>IN=x);sub('applications',x=>AP=x);sub('sellerapps',x=>SA=x);sub('sellers',x=>SL=x);sub('support',x=>SP=x);sub('settings',x=>SET=x.main||{});sub('chats',x=>CH=x);sub('profiles',x=>PR=x);sub('home',x=>{HOME=x;HLOAD=true});sub('homerev',x=>HREV=x);sub('reviews',x=>RV=x);render()})();

})();
