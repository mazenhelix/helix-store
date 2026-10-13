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

const PUB=new Set(['editors','works','profiles','settings','reviews']),COLS=['editors','works','profiles','settings','reviews','commissions','applications','inbox','chats'];
const filt=(d,uid,mine)=>{const o={};for(const f of['m','dl','rev']){o[f]={};for(const[k,v]of Object.entries(d[f]||{})){const[c,ed]=k.split(':');if(mine.has(c)||ed===uid)o[f][k]=v}}return o};

async function sync(e,u,v){
 const ver=(await e.DB.prepare("SELECT v FROM meta WHERE k='version'").first())?.v||1;
 if(v&&+v===ver)return J({v:ver,same:1});
 const rows=(await e.DB.prepare('SELECT col,id,data FROM docs').all()).results,out={};COLS.forEach(c=>out[c]={});
 const staff=u&&(u.owner||rows.some(r=>r.col==='editors'&&r.id===u.id)),mine=new Set();
 const mc=u&&rows.find(r=>r.col==='commissions'&&r.id===u.id);if(mc)try{JSON.parse(mc.data).items.forEach(c=>mine.add(c.id))}catch{}
 for(const r of rows){let d;try{d=JSON.parse(r.data)}catch{continue}const c=r.col,own=u&&r.id===u.id;
  if(PUB.has(c))out[c][r.id]=d;
  else if(!u)continue;
  else if(c==='commissions'){if(own||staff)out[c][r.id]=d}
  else if(c==='applications'){if(own||u.owner)out[c][r.id]=d}
  else if(c==='inbox')out[c][r.id]=d;
  else if(c==='chats')out[c][r.id]=own?d:filt(d,u.id,mine)}
 return J({v:ver,data:out})}

async function write(e,u,col,id,req,del){
 if(!u)return J({error:'auth'},401);
 if(!COLS.includes(col)||!/^[\w-]{1,64}$/.test(id))return J({error:'bad'},400);
 const own=id===u.id,isEd=u.owner||!!(await e.DB.prepare("SELECT 1 FROM docs WHERE col='editors' AND id=?").bind(u.id).first());
 let data=null,ok=false;
 if(!del){const t=await req.text();if(t.length>100000)return J({error:'too large'},413);try{data=JSON.parse(t)}catch{return J({error:'bad json'},400)}}
 if(col==='editors'||col==='settings')ok=u.owner;
 else if(col==='applications')ok=u.owner||(own&&!del&&data.status==='pending');
 else if(col==='works'||col==='inbox')ok=own&&isEd;
 else ok=own;
 if(!ok)return J({error:'forbidden'},403);
 await e.DB.batch([del?e.DB.prepare('DELETE FROM docs WHERE col=?1 AND id=?2').bind(col,id):e.DB.prepare('INSERT INTO docs(col,id,data,updated) VALUES(?1,?2,?3,?4) ON CONFLICT(col,id) DO UPDATE SET data=?3,updated=?4').bind(col,id,JSON.stringify(data),Date.now()),e.DB.prepare("UPDATE meta SET v=v+1 WHERE k='version'")]);
 return J({ok:1})}

const GH=(e,path,o={})=>fetch(`https://api.github.com/repos/${e.GITHUB_REPO}/contents/${path}`+(o.method?'':`?ref=${e.GITHUB_BRANCH||'main'}`),{...o,headers:{authorization:'Bearer '+e.GITHUB_TOKEN,accept:'application/vnd.github+json','content-type':'application/json','user-agent':'helix-store','x-github-api-version':'2022-11-28'}});
async function site(e,req,m){
 if(!e.GITHUB_TOKEN||!e.GITHUB_REPO)return J({error:'GITHUB_TOKEN or GITHUB_REPO is not set'},500);
 if(m==='GET'){const r=await GH(e,'site.json');if(!r.ok)return J({error:'GitHub '+r.status},502);const j=await r.json();return J({sha:j.sha,json:dec.decode(unb(j.content.replace(/\s/g,'')))})}
 if(m==='PUT'){const b=await req.json();let o;try{o=JSON.parse(b.json)}catch{return J({error:'bad json'},400)}
  if(!o||typeof o.stores!=='object'||typeof o.banner!=='object'||b.json.length>500000)return J({error:'invalid site data'},400);
  const bytes=enc.encode(b.json);let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));
  const r=await GH(e,'site.json',{method:'PUT',body:JSON.stringify({message:'Update site content (Showcase editor)',content:btoa(s),sha:b.sha,branch:e.GITHUB_BRANCH||'main'})});
  if(r.status===409||r.status===422)return J({error:'site.json changed on GitHub. Reload the editor and redo your edit.'},409);
  if(!r.ok)return J({error:'GitHub '+r.status},502);return J({sha:(await r.json()).content.sha})}
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
  if(p==='/sync'&&m==='GET')return sync(e,u,url.searchParams.get('v'));
  if(p==='/profiles'){const ids=(url.searchParams.get('ids')||'').split(',').filter(x=>/^[\w-]{1,64}$/.test(x)).slice(0,60),o={};
   if(ids.length)for(const r of(await e.DB.prepare(`SELECT id,name,avatar FROM users WHERE id IN (${ids.map(()=>'?').join(',')})`).bind(...ids).all()).results)o[r.id]={name:r.name,avatarUrl:r.avatar};return J(o)}
  if(p==='/site'){if(!u||!u.owner)return J({error:'owner only'},403);return site(e,req,m)}
  const d=p.match(/^\/doc\/(\w+)\/([\w-]+)$/);if(d&&(m==='PUT'||m==='DELETE'))return write(e,u,d[1],d[2],req,m==='DELETE');
  return J({error:'not found'},404)
 }catch(err){return J({error:'server'},500)}}
