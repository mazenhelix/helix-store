// Cloudflare Pages Function for /api/*  ·  needs: D1 binding "DB", var GOOGLE_CLIENT_ID, var OWNER_EMAILS, secret SESSION_SECRET
const J=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'content-type':'application/json','cache-control':'no-store'}});
const enc=new TextEncoder(),dec=new TextDecoder();
const b64u=b=>btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const unb=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
const hk=e=>crypto.subtle.importKey('raw',enc.encode(e.SESSION_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);
async function sign(e,p){const b=b64u(enc.encode(JSON.stringify(p)));return b+'.'+b64u(await crypto.subtle.sign('HMAC',await hk(e),enc.encode(b)))}
async function check(e,t){try{const[b,s]=t.split('.');if(!await crypto.subtle.verify('HMAC',await hk(e),unb(s),enc.encode(b)))return null;const p=JSON.parse(dec.decode(unb(b)));return p.exp>Date.now()/1e3?p:null}catch{return null}}
async function google(e,tok){const[h,p,s]=tok.split('.'),hd=JSON.parse(dec.decode(unb(h)));
 const k=(await(await fetch('https://www.googleapis.com/oauth2/v3/certs')).json()).keys.find(x=>x.kid===hd.kid);if(!k)return null;
 const key=await crypto.subtle.importKey('jwk',k,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
 if(!await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,unb(s),enc.encode(h+'.'+p)))return null;
 const c=JSON.parse(dec.decode(unb(p)));
 return c.aud===e.GOOGLE_CLIENT_ID&&/^(https:\/\/)?accounts\.google\.com$/.test(c.iss)&&c.exp>Date.now()/1e3&&c.email_verified?c:null}

const PUB=new Set(['editors','works','profiles','settings','reviews','faq','sellers','storecats']),COLS=['editors','works','profiles','settings','reviews','faq','sellers','home','homerev','storecats','products','orders','commissions','applications','sellerapps','support','inbox','chats'];
const filt=(d,uid,mine,owner)=>{const o={};for(const f of['m','dl','rev']){o[f]={};for(const[k,v]of Object.entries(d[f]||{})){const[c,ed]=k.split(':');if(mine.has(c)||ed===uid||(owner&&c.startsWith('sup_')))o[f][k]=v}}return o};

/* Home page config: typed sections only. Everything is rebuilt from a whitelist, so no HTML, scripts or unknown keys are ever stored. */
const HL=['store','showcase','faq','commission'];
const S_=(v,n)=>typeof v==='string'?v.replace(/[\u0000-\u001f<>]/g,' ').trim().slice(0,n):'';
const N_=(v,a,b,d)=>{v=Math.round(+v);return Number.isFinite(v)?Math.min(b,Math.max(a,v)):d};
const HT={
 hero:s=>({title:S_(s.title,160),text:S_(s.text,300),pLabel:S_(s.pLabel,30),pLink:HL.includes(s.pLink)?s.pLink:'store',sLabel:S_(s.sLabel,30),sLink:HL.includes(s.sLink)?s.sLink:'showcase'}),
 cards:s=>({title:S_(s.title,80),items:HL.map(k=>{const i=(Array.isArray(s.items)?s.items:[]).find(x=>x&&x.k===k)||{};return{k,t:S_(i.t,40),d:S_(i.d,140)}})}),
 featured:s=>({title:S_(s.title,80),text:S_(s.text,160),count:N_(s.count,1,6,4),ids:(Array.isArray(s.ids)?s.ids:[]).slice(0,6).map(x=>S_(x,64)).filter(Boolean)}),
 showcase:s=>({title:S_(s.title,80),text:S_(s.text,160),count:N_(s.count,1,6,3)}),
 commission:s=>({title:S_(s.title,80),text:S_(s.text,300),label:S_(s.label,30)}),
 faq:s=>({title:S_(s.title,80),count:N_(s.count,1,6,4)}),
 creators:s=>({title:S_(s.title,80)})};
function cleanHome(d){if(!d||!Array.isArray(d.sections)||d.sections.length>24)return null;const out=[];for(const s of d.sections){if(!s||!HT[s.type])return null;out.push({id:S_(s.id,24)||'s'+out.length,type:s.type,on:!!s.on,...HT[s.type](s)})}return{sections:out,at:Date.now()}}

/* ===== Store: categories, products (lifecycle) and Payhip sales ===== */
const DEFCATS=[{id:'animations',requireVideo:true},{id:'builds'},{id:'plugins'}];
const FT=['text','longtext','select','number','bool','url'];
function cleanCats(d){if(!d||!Array.isArray(d.cats)||d.cats.length>12||!d.cats.length)return null;const seen=new Set(),out=[];
 for(const c of d.cats){const id=S_(c&&c.id,24);if(!/^[a-z0-9-]{1,24}$/.test(id)||seen.has(id))return null;seen.add(id);
  const fields=[];for(const f of(Array.isArray(c.fields)?c.fields:[]).slice(0,20)){const k=S_(f&&f.k,20);if(!/^[a-z0-9_]{1,20}$/.test(k))return null;
   fields.push({k,label:S_(f.label,40)||k,type:FT.includes(f.type)?f.type:'text',opts:(Array.isArray(f.opts)?f.opts:[]).slice(0,30).map(x=>S_(x,40)).filter(Boolean),card:!!f.card,filter:!!f.filter,page:f.page!==false,required:!!f.required,cardLabel:S_(f.cardLabel,20)})}
  out.push({id,name:S_(c.name,30)||id,tab:!!c.tab,order:N_(c.order,0,99,out.length+1),requireVideo:!!c.requireVideo,fields})}
 return{cats:out,at:Date.now()}}
const URLOK=v=>typeof v==='string'&&(/^https:\/\/[^\s<>"']{4,400}$/.test(v)||/^(images|thumbs|previews)\/[\w./-]{1,160}$/.test(v));
const PAYHIP=/^https:\/\/payhip\.com\/b\/[A-Za-z0-9]{3,12}$/;
const PSTAT=['draft','pending','published','rejected','archived'];
const L_=(v,n,m)=>(Array.isArray(v)?v:[]).slice(0,n).map(x=>S_(x,m)).filter(Boolean);
function cleanProduct(d){if(!d||typeof d!=='object')return null;const f={};
 if(d.fields&&typeof d.fields==='object')for(const[k,v]of Object.entries(d.fields).slice(0,24))if(/^[a-z0-9_]{1,20}$/.test(k))f[k]=S_(String(v??''),1500);
 const price=Math.round((+d.price||0)*100)/100;
 return{cat:S_(d.cat,24),title:S_(d.title,120),short:S_(d.short,200),long:S_(d.long,4000),price:Number.isFinite(price)?Math.min(100000,Math.max(0,price)):0,currency:['USD','EUR','GBP'].includes(d.currency)?d.currency:'USD',
  fulfillment:['payhip','free','native'].includes(d.fulfillment)?d.fulfillment:'payhip',payhipUrl:PAYHIP.test(d.payhipUrl||'')?d.payhipUrl:'',freeUrl:URLOK(d.freeUrl)?d.freeUrl:'',freeSignin:!!d.freeSignin,
  images:(Array.isArray(d.images)?d.images:[]).filter(URLOK).slice(0,8),video:URLOK(d.video)?d.video:'',features:L_(d.features,12,120),license:S_(d.license,600),support:S_(d.support,300),publisher:S_(d.publisher,80),tags:L_(d.tags,8,30),
  fields:f,status:PSTAT.includes(d.status)?d.status:'draft',feedback:S_(d.feedback,500),featured:!!d.featured}}
function problems(p,cats){const c=cats.find(x=>x.id===p.cat),o=[];if(!c)o.push('Choose a valid category.');if(!p.title)o.push('Title is required.');if(!p.short)o.push('A short description is required.');
 if(p.fulfillment==='payhip'&&!p.payhipUrl)o.push('A Payhip product link (https://payhip.com/b/KEY) is required.');
 if(p.fulfillment==='free'&&!p.freeUrl)o.push('A download link is required for free products.');
 if(p.fulfillment==='free'&&p.price>0)o.push('Free products must have a price of 0.');
 if(p.fulfillment==='native')o.push('Site-delivered products are not enabled yet (no payment provider is configured).');
 if(c&&c.requireVideo&&!p.video&&p.fields.type!=='Collection')o.push('A preview video is required for this category.');
 for(const f of(c&&c.fields)||[])if(f.required&&!p.fields[f.k])o.push(`"${f.label}" is required.`);return o}
async function getCats(e){const r=await e.DB.prepare("SELECT data FROM docs WHERE col='storecats' AND id='main'").first();try{const c=r&&cleanCats(JSON.parse(r.data));if(c)return c.cats}catch{}return DEFCATS}
async function writeProduct(e,u,id,req,del){
 const old=await e.DB.prepare("SELECT data FROM docs WHERE col='products' AND id=?").bind(id).first();let ex=null;try{ex=old&&JSON.parse(old.data)}catch{}
 const sel=!u.owner;
 if(sel){if(!/^s-[\w-]{1,60}$/.test(id))return J({error:'Seller product ids must start with s-'},400);
  if(ex&&ex.seller!==u.id)return J({error:'forbidden'},403)}
 if(del){if(!ex)return J({ok:1});if(sel&&ex.status!=='draft'&&ex.status!=='rejected')return J({error:'Only drafts can be deleted. Archive it instead.'},403)
  await e.DB.batch([e.DB.prepare("DELETE FROM docs WHERE col='products' AND id=?").bind(id),e.DB.prepare("UPDATE meta SET v=v+1 WHERE k='version'")]);return J({ok:1})}
 let raw;try{raw=JSON.parse(await req.text())}catch{return J({error:'bad json'},400)}
 const p=cleanProduct(raw);if(!p)return J({error:'invalid product'},400);
 const cats=await getCats(e);
 p.seller=sel?u.id:(ex&&ex.seller)||(typeof raw.seller==='string'&&/^g?[\w-]{1,40}$/.test(raw.seller)?raw.seller:'');
 p.at=(ex&&ex.at)||Date.now();p.updated=Date.now();p.published=(ex&&ex.published)||0;
 if(sel){
  const sl=await e.DB.prepare("SELECT data FROM docs WHERE col='sellers' AND id=?").bind(u.id).first();if(!sl)return J({error:'You are not an approved seller.'},403);
  let allow=[];try{allow=JSON.parse(sl.data).cats||[]}catch{}if(allow.length&&!allow.includes(p.cat))return J({error:'You are not authorized to sell in this category.'},403);
  p.featured=false;p.feedback=ex?ex.feedback||'':'';
  if(!['draft','pending','archived'].includes(p.status))p.status='draft';
  if(ex&&ex.status==='published'&&p.status!=='archived')p.status='pending';   // edits to a live listing go back to review
  if(p.status==='pending'){const pr=problems(p,cats);if(pr.length)return J({error:pr.join(' ')},400);p.feedback=''}
 }else{
  if(p.status==='published'){const pr=problems(p,cats);if(pr.length)return J({error:pr.join(' ')},400);if(!p.published)p.published=Date.now()}
  if(p.status!=='rejected')p.feedback=p.status==='published'?'':p.feedback}
 await e.DB.batch([e.DB.prepare('INSERT INTO docs(col,id,data,updated) VALUES(?1,?2,?3,?4) ON CONFLICT(col,id) DO UPDATE SET data=?3,updated=?4').bind('products',id,JSON.stringify(p),Date.now()),e.DB.prepare("UPDATE meta SET v=v+1 WHERE k='version'")]);
 return J({ok:1})}
/* Payhip webhooks (https://help.payhip.com/article/115-webhooks). Payhip's "signature" is sha256(apiKey), a shared secret rather than an HMAC of the payload,
   so it proves little on its own: we also support an optional secret path token, ignore anything malformed and make processing idempotent. */
const safeEq=(a,b)=>{if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let r=0;for(let i=0;i<a.length;i++)r|=a.charCodeAt(i)^b.charCodeAt(i);return r===0};
async function sha256hex(t){return[...new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(t)))].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function payhipHook(e,req,url){
 if(!e.PAYHIP_API_KEY)return J({error:'webhook not configured'},503);
 if(e.PAYHIP_WEBHOOK_TOKEN&&!safeEq(url.searchParams.get('token')||'',e.PAYHIP_WEBHOOK_TOKEN))return J({error:'forbidden'},403);
 const t=await req.text();if(t.length>20000)return J({error:'too large'},413);let b;try{b=JSON.parse(t)}catch{return J({error:'bad json'},400)}
 if(!safeEq(String(b.signature||''),await sha256hex(e.PAYHIP_API_KEY)))return J({error:'bad signature'},403);
 if(!['paid','refunded'].includes(b.type))return J({ok:1,ignored:b.type});
 const id=String(b.id||'');if(!/^[\w-]{3,40}$/.test(id))return J({error:'bad id'},400);
 const row=await e.DB.prepare("SELECT data FROM docs WHERE col='orders' AND id=?").bind(id).first();let ex=null;try{ex=row&&JSON.parse(row.data)}catch{}
 if(ex&&ex.status==='refunded'&&b.type==='paid')return J({ok:1,duplicate:1});
 if(ex&&ex.status===(b.type==='paid'?'paid':'refunded'))return J({ok:1,duplicate:1});
 const o={id,status:b.type==='paid'?'paid':'refunded',email:S_(b.email,120),currency:S_(b.currency,3).toUpperCase(),cents:N_(b.price,0,1e9,0),refunded:N_(b.amount_refunded,0,1e9,0),
  at:N_(b.date||b.date_created,0,4e9,0)*1000||Date.now(),items:(Array.isArray(b.items)?b.items:[]).slice(0,20).map(i=>({key:S_(i.product_key,16),name:S_(i.product_name,120),qty:N_(i.quantity,1,999,1),coupon:!!i.used_coupon})),updated:Date.now()};
 await e.DB.batch([e.DB.prepare('INSERT INTO docs(col,id,data,updated) VALUES(?1,?2,?3,?4) ON CONFLICT(col,id) DO UPDATE SET data=?3,updated=?4').bind('orders',id,JSON.stringify(o),Date.now()),e.DB.prepare("UPDATE meta SET v=v+1 WHERE k='version'")]);
 return J({ok:1})}

async function sync(e,u,v){
 const ver=(await e.DB.prepare("SELECT v FROM meta WHERE k='version'").first())?.v||1;
 if(v&&+v===ver)return J({v:ver,same:1});
 const rows=(await e.DB.prepare('SELECT col,id,data FROM docs').all()).results,out={};COLS.forEach(c=>out[c]={});
 const staff=u&&(u.owner||rows.some(r=>r.col==='editors'&&r.id===u.id)),mine=new Set();
 const mc=u&&rows.find(r=>r.col==='commissions'&&r.id===u.id);if(mc)try{JSON.parse(mc.data).items.forEach(c=>mine.add(c.id))}catch{}
 for(const r of rows){let d;try{d=JSON.parse(r.data)}catch{continue}const c=r.col,own=u&&r.id===u.id;
  if(c==='home'){if(r.id==='published'||(u&&u.owner))out[c][r.id]=d}
  else if(c==='products'){if(d.status==='published'||(u&&(u.owner||d.seller===u.id)))out[c][r.id]=(!u&&d.freeSignin)?{...d,freeUrl:''}:d}
  else if(c==='orders'){if(u&&u.owner)out[c][r.id]=d}
  else if(PUB.has(c))out[c][r.id]=d;
  else if(!u)continue;
  else if(c==='homerev'){if(u.owner)out[c][r.id]=d}
  else if(c==='commissions'){if(own||staff)out[c][r.id]=d}
  else if(c==='applications'||c==='sellerapps'||c==='support'){if(own||u.owner)out[c][r.id]=d}
  else if(c==='inbox')out[c][r.id]=d;
  else if(c==='chats')out[c][r.id]=own?d:filt(d,u.id,mine,u.owner)}
 return J({v:ver,data:out})}

async function write(e,u,col,id,req,del){
 if(!u)return J({error:'auth'},401);
 if(!COLS.includes(col)||!/^[\w-]{1,64}$/.test(id))return J({error:'bad'},400);
 const own=id===u.id,isEd=u.owner||!!(await e.DB.prepare("SELECT 1 FROM docs WHERE col='editors' AND id=?").bind(u.id).first());
 if(col==='orders')return J({error:'forbidden'},403);
 if(col==='products')return writeProduct(e,u,id,req,del);
 if(col==='storecats'){if(!u.owner)return J({error:'forbidden'},403);if(!del){let r;try{r=JSON.parse(await req.text())}catch{return J({error:'bad json'},400)}const c=cleanCats(r);if(!c)return J({error:'invalid categories'},400);await e.DB.batch([e.DB.prepare('INSERT INTO docs(col,id,data,updated) VALUES(?1,?2,?3,?4) ON CONFLICT(col,id) DO UPDATE SET data=?3,updated=?4').bind('storecats','main',JSON.stringify(c),Date.now()),e.DB.prepare("UPDATE meta SET v=v+1 WHERE k='version'")]);return J({ok:1})}}
 let data=null,ok=false;
 if(!del){const t=await req.text();if(t.length>100000)return J({error:'too large'},413);try{data=JSON.parse(t)}catch{return J({error:'bad json'},400)}}
 if(col==='home'&&!['draft','published'].includes(id))return J({error:'bad'},400);
 if(col==='homerev'&&!/^r\d{10,14}$/.test(id))return J({error:'bad'},400);
 if(col==='home'||col==='homerev'){ok=u.owner;if(ok&&!del){data=cleanHome(data);if(!data)return J({error:'invalid home config'},400)}}
 else if(col==='editors'||col==='settings'||col==='faq'||col==='sellers')ok=u.owner;
 else if(col==='applications'||col==='sellerapps')ok=u.owner||(own&&!del&&data.status==='pending');
 else if(col==='support')ok=own||u.owner;
 else if(col==='works'||col==='inbox')ok=own&&isEd;
 else ok=own;
 if(!ok)return J({error:'forbidden'},403);
 await e.DB.batch([del?e.DB.prepare('DELETE FROM docs WHERE col=?1 AND id=?2').bind(col,id):e.DB.prepare('INSERT INTO docs(col,id,data,updated) VALUES(?1,?2,?3,?4) ON CONFLICT(col,id) DO UPDATE SET data=?3,updated=?4').bind(col,id,JSON.stringify(data),Date.now()),e.DB.prepare("UPDATE meta SET v=v+1 WHERE k='version'")]);
 return J({ok:1})}

async function ghj(e,path,method='GET',body){const r=await fetch(`https://api.github.com/repos/${e.GITHUB_REPO}/${path}`,{method,headers:{authorization:'Bearer '+e.GITHUB_TOKEN,accept:'application/vnd.github+json','content-type':'application/json','user-agent':'helix-store','x-github-api-version':'2022-11-28'},body:body?JSON.stringify(body):undefined});if(!r.ok){const x=new Error('GitHub '+r.status);x.status=r.status;throw x}return r.json()}
async function site(e,req,m){
 if(!e.GITHUB_TOKEN||!e.GITHUB_REPO)return J({error:'GITHUB_TOKEN or GITHUB_REPO is not set'},500);
 const br=e.GITHUB_BRANCH||'main';
 try{
  if(m==='GET'){const j=await ghj(e,`contents/site.json?ref=${br}`);return J({json:dec.decode(unb(j.content.replace(/\s/g,'')))})}
  if(m==='PUT'){const b=await req.json();let o;try{o=JSON.parse(b.json)}catch{return J({error:'bad json'},400)}
   if(!o||typeof o.stores!=='object'||typeof o.banner!=='object'||b.json.length>500000)return J({error:'invalid site data'},400);
   const files=[{path:'site.json',content:b.json,encoding:'utf-8'}];
   for(const[p,d]of Object.entries(b.images||{})){if(!/^images\/[\w.-]+\.webp$/.test(p)||!/^[A-Za-z0-9+\/=]+$/.test(d))return J({error:'bad image'},400);files.push({path:p,content:d,encoding:'base64'})}
   const base=(await ghj(e,`git/ref/heads/${br}`)).object.sha,cm=await ghj(e,`git/commits/${base}`),tree=[];
   for(const f of files){const bl=await ghj(e,'git/blobs','POST',{content:f.content,encoding:f.encoding});tree.push({path:f.path,mode:'100644',type:'blob',sha:bl.sha})}
   const nt=await ghj(e,'git/trees','POST',{base_tree:cm.tree.sha,tree}),nc=await ghj(e,'git/commits','POST',{message:'Update site content',tree:nt.sha,parents:[base]});
   await ghj(e,`git/refs/heads/${br}`,'PATCH',{sha:nc.sha});return J({ok:1})}
 }catch(err){return J({error:err.message||'github'},502)}
 return J({error:'method'},405)}

export async function onRequest({request:req,env:e}){
 const url=new URL(req.url),p=url.pathname.replace(/^\/api/,'').replace(/\/$/,''),m=req.method;
 const tk=(req.headers.get('authorization')||'').replace(/^Bearer /,''),u=tk?await check(e,tk):null;
 try{
  if(p==='/auth'&&m==='POST'){const c=await google(e,(await req.json()).credential||'');if(!c)return J({error:'invalid token'},401);
   const id='g'+c.sub,owner=(e.OWNER_EMAILS||'').toLowerCase().split(',').map(s=>s.trim()).includes(c.email.toLowerCase());
   await e.DB.prepare('INSERT INTO users(id,name,avatar,email) VALUES(?1,?2,?3,?4) ON CONFLICT(id) DO UPDATE SET name=?2,avatar=?3,email=?4').bind(id,c.name||c.email.split('@')[0],c.picture||'',c.email).run();
   return J({token:await sign(e,{id,owner,exp:Math.floor(Date.now()/1e3)+30*864e2}),user:{id,name:c.name,avatarUrl:c.picture,owner}})}
  if(p==='/me'){if(!u)return J({error:'auth'},401);const r=await e.DB.prepare('SELECT name,avatar FROM users WHERE id=?').bind(u.id).first();return J({id:u.id,owner:u.owner,name:r?.name||'You',avatarUrl:r?.avatar||''})}
  if(p==='/payhip-webhook'&&m==='POST')return payhipHook(e,req,url);
  if(p==='/sync'&&m==='GET')return sync(e,u,url.searchParams.get('v'));
  if(p==='/profiles'){const ids=(url.searchParams.get('ids')||'').split(',').filter(x=>/^[\w-]{1,64}$/.test(x)).slice(0,60),o={};
   if(ids.length)for(const r of(await e.DB.prepare(`SELECT id,name,avatar FROM users WHERE id IN (${ids.map(()=>'?').join(',')})`).bind(...ids).all()).results)o[r.id]={name:r.name,avatarUrl:r.avatar};return J(o)}
  if(p==='/site'){if(!u||!u.owner)return J({error:'owner only'},403);return site(e,req,m)}
  const d=p.match(/^\/doc\/(\w+)\/([\w-]+)$/);if(d&&(m==='PUT'||m==='DELETE'))return write(e,u,d[1],d[2],req,m==='DELETE');
  return J({error:'not found'},404)
 }catch(err){return J({error:'server'},500)}}
