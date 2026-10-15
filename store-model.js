/* Shared Store model: merges the original site.json products with the live product database, and renders cards. */
(()=>{
const D=window.HX_STORE_DEFAULT;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug=n=>String(n||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const TYPE={Text:'Text',Objects:'Object',Object:'Object',UI:'UI',Scenes:'Scene',Scene:'Scene',Collections:'Collection'};
const SYM={USD:'$',EUR:'€',GBP:'£'};
const money=(n,c='USD')=>(SYM[c]||'')+(+(+n).toFixed(2))+(SYM[c]?'':' '+c);
const priceText=p=>p.fulfillment==='free'||!(p.price>0)?'Free':money(p.price,p.currency);
function fromLegacy(p,k,i){const s=slug(p.n),a=k==='animations';
 return{id:p.id,cat:k,title:p.n,short:p.d||'',long:'',price:+p.price||0,currency:'USD',fulfillment:'payhip',payhipUrl:p.link||'',freeUrl:'',freeSignin:false,
  images:p.img?[p.img]:[],video:a&&!p.coll?`previews/${s}.mp4`:'',poster:a&&!p.coll?`thumbs/${s}.png`:'',features:[],license:'',support:'',publisher:'Helix Studio',tags:p.tags||[],
  fields:{type:TYPE[(p.tags||[])[0]]||'',size:p.size||''},status:'published',seller:'',featured:!!(p.best||p.popular),badges:{best:!!p.best,popular:!!p.popular,isNew:!!p.new},coll:!!p.coll,
  ts:0,idx:i,legacy:true,sub:p.cats||null}}
function fromDoc(d,id){return{id,cat:d.cat,title:d.title,short:d.short,long:d.long||'',price:+d.price||0,currency:d.currency||'USD',fulfillment:d.fulfillment||'payhip',payhipUrl:d.payhipUrl||'',freeUrl:d.freeUrl||'',freeSignin:!!d.freeSignin,
 images:d.images||[],video:d.video||'',poster:'',features:d.features||[],license:d.license||'',support:d.support||'',publisher:d.publisher||'',tags:d.tags||[],fields:d.fields||{},status:d.status,seller:d.seller||'',
 featured:!!d.featured,badges:{best:false,popular:false,isNew:false},coll:false,ts:d.published||d.at||0,idx:0,legacy:false,feedback:d.feedback||'',raw:d}}
let CACHE=null;
async function load(force){if(CACHE&&!force)return CACHE;
 const pub=window.Helix&&Helix.pub?Helix.pub(force):fetch('/api/sync').then(r=>r.json()).then(j=>j.data);
 const [sj,data]=await Promise.all([fetch('/site.json',{cache:'no-cache'}).then(r=>r.json()).catch(()=>({stores:{}})),pub.catch(()=>({}))]);
 const cfg=(data.storecats&&data.storecats.main)||D;
 const cats=[...cfg.cats].sort((a,b)=>(a.order||0)-(b.order||0)),tabs=cats.filter(c=>c.tab);
 const docs=data.products||{},map=new Map();
 let i=0;for(const[k,arr]of Object.entries(sj.stores||{}))for(const p of arr)map.set(p.id,fromLegacy(p,k,i++));
 for(const[id,d]of Object.entries(docs))map.set(id,fromDoc(d,id));
 const all=[...map.values()].filter(p=>p.title);
 const catIds=new Set(cats.map(c=>c.id));
 const visible=all.filter(p=>p.status==='published'&&catIds.has(p.cat));
 CACHE={cats,tabs,all,products:visible,site:sj,banner:sj.banner||{},data,names:data.profiles||{}};return CACHE}
/* an active, owner-confirmed code is the only thing we ever promote: we cannot apply discounts at Payhip checkout ourselves */
function saleNote(b){b=b||{};return b.enabled&&b.confirmed&&Date.parse(b.endsAt)>Date.now()&&b.code?`Use code ${b.code} at checkout${b.pct?` for ${b.pct}% off`:''}`:''}
const payhipKey=u=>((u||'').match(/\/b\/([A-Za-z0-9]+)$/)||[])[1]||'';
let PH=false;function loadPayhip(){if(PH)return;PH=true;const s=document.createElement('script');s.src='https://payhip.com/payhip.js';s.async=true;document.head.appendChild(s)}
function buy(p,o={}){const c=o.cls||'';
 if(p.fulfillment==='payhip'){if(!p.payhipUrl)return `<span class="btn off ${c}">Coming soon</span>`;
  return `<a class="btn payhip-buy-button ${c}" data-theme="none" data-product="${esc(payhipKey(p.payhipUrl))}" data-method="overlay" href="${esc(p.payhipUrl)}" target="_blank" rel="noopener">${p.price>0?'Buy now':'Get it free'}</a>`}
 if(p.fulfillment==='free'){if(p.freeUrl)return `<a class="btn ${c}" href="${esc(p.freeUrl)}" target="_blank" rel="noopener">Download free</a>`;
  return p.freeSignin?`<button class="btn ${c}" data-signin="1">Sign in to download</button>`:`<span class="btn off ${c}">Unavailable</span>`}
 return `<span class="btn off ${c}">Not available yet</span>`}
const href=p=>`/store/${encodeURIComponent(p.cat)}/${encodeURIComponent(p.id)}`;
function badges(p){const b=[];if(p.badges.best)b.push('<span class="best">Best value</span>');if(p.badges.popular)b.push('<span>Popular</span>');if(p.badges.isNew)b.push('<span>New</span>');if(p.featured&&!p.badges.best&&!p.badges.popular)b.push('<span>Featured</span>');if(priceText(p)==='Free')b.push('<span class="free">Free</span>');return b.join('')}
const COLS={Text:['#1f6b43','#0f2a3d'],Object:['#8a5415','#2a1646'],UI:['#1f4f9a','#241a5a'],Scene:['#8a2f56','#1b1a4a'],Collection:['#6b5a1f','#2a1f0f']};
function media(p,cat){const [c1,c2]=COLS[p.fields.type]||['#1f4f6b','#1a1a3a'],ini=esc((p.title||'?').split(/\s+/).slice(0,2).map(w=>w[0]).join(''));
 const img=p.images[0]?`<img src="${esc(p.images[0])}" alt="${esc(p.title)} cover" loading="lazy">`:'';
 const vid=p.video?`<video src="${esc(p.video)}" ${p.poster?`poster="${esc(p.poster)}"`:''} muted loop playsinline preload="none" onerror="this.remove()"></video>`:'';
 const th=!p.images[0]&&p.poster?`<img src="${esc(p.poster)}" alt="" loading="lazy" onerror="this.remove()">`:'';
 return `<div class="ph" style="--c1:${c1};--c2:${c2}"><span>${ini}</span>${img}${th}${vid}</div>`}
function meta(p,cat){const f=(cat&&cat.fields||[]).filter(x=>x.card&&p.fields[x.k]);return f.map(x=>`${x.cardLabel?esc(x.cardLabel)+' ':''}${esc(p.fields[x.k])}`).join(' · ')}
function card(p,cats){const cat=(cats||[]).find(c=>c.id===p.cat);
 return `<article class="pc"><a class="pm" href="${href(p)}" aria-label="${esc(p.title)}">${media(p,cat)}<span class="bd">${badges(p)}</span></a>
 <div class="cb"><h3><a href="${href(p)}">${esc(p.title)}</a></h3><small>${esc(cat?cat.name:p.cat)}${meta(p,cat)?' · '+meta(p,cat):''}</small><div class="buy"><span class="price"><b>${esc(priceText(p))}</b></span><a class="btn sm" href="${href(p)}">View</a></div></div></article>`}
function search(list,q,cats){q=String(q||'').trim().toLowerCase();if(!q)return list;const w=q.split(/\s+/);
 const score=p=>{const t=p.title.toLowerCase(),h=[p.title,p.short,p.long,p.tags.join(' '),p.publisher,...Object.values(p.fields)].join(' ').toLowerCase();let s=0;for(const x of w){if(t.includes(x))s+=3;else if(h.includes(x))s+=1;else return 0}return s};
 return list.map(p=>[score(p),p]).filter(x=>x[0]>0).sort((a,b)=>b[0]-a[0]).map(x=>x[1])}
const SORTS={featured:'Featured first',newest:'Newest',low:'Price: low to high',high:'Price: high to low',name:'Name A to Z'};
function sort(list,k){const a=[...list],rec=(x,y)=>(y.ts-x.ts)||(y.idx-x.idx),fe=p=>(p.badges.best?3:0)+(p.featured?2:0)+(p.badges.popular?1:0)+(p.coll?.5:0);
 if(k==='newest')return a.sort(rec);if(k==='low')return a.sort((x,y)=>x.price-y.price||rec(x,y));if(k==='high')return a.sort((x,y)=>y.price-x.price||rec(x,y));
 if(k==='name')return a.sort((x,y)=>x.title.localeCompare(y.title));return a.sort((x,y)=>fe(y)-fe(x)||rec(x,y))}
window.HXS={load,esc,slug,money,priceText,card,buy,href,saleNote,loadPayhip,search,sort,SORTS,payhipKey,fromDoc,fromLegacy,media,badges,meta,
 featuredOf:(list,n)=>sort(list.filter(p=>p.featured||p.badges.best||p.badges.popular),'featured').slice(0,n),
 recentOf:(list,n)=>sort(list,'newest').slice(0,n)};
})();
