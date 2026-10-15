(()=>{
const {esc}=HXS,app=document.getElementById('app'),PAGE=12;let M=null;
const qs=()=>new URLSearchParams(location.search);
const route=()=>{const p=location.pathname.replace(/\/+$/,'').split('/').filter(Boolean);return{tab:p[1]?decodeURIComponent(p[1]):'',id:p[2]?decodeURIComponent(p[2]):''}};
const go=(u,r)=>{history[r?'replaceState':'pushState']({},'',u);render();scrollTo(0,0)};
const url=(base,o)=>{const p=new URLSearchParams();for(const[k,v]of Object.entries(o))if(v!==''&&v!=null&&v!==false)p.set(k,v);const s=p.toString();return base+(s?'?'+s:'')};
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="/store"]');if(!a||e.metaKey||e.ctrlKey||e.shiftKey||a.target==='_blank')return;e.preventDefault();go(a.getAttribute('href'))});
addEventListener('popstate',render);
const para=t=>String(t||'').split(/\n\s*\n|\n/).filter(x=>x.trim()).map(x=>`<p>${esc(x)}</p>`).join('');
const tokens=v=>String(v||'').split(/[,;]+/).map(x=>x.trim()).filter(Boolean);
const optsFor=(f,list)=>{const s=new Set(f.opts||[]);for(const p of list)(f.type==='select'?[p.fields[f.k]]:tokens(p.fields[f.k])).forEach(v=>v&&s.add(v));return[...s].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}))};
const matchF=(p,f,v)=>{const x=p.fields[f.k];if(!x)return false;return f.type==='select'?String(x).toLowerCase()===v.toLowerCase():tokens(x).some(t=>t.toLowerCase()===v.toLowerCase())};
function scopeSel(cur){return `<select name="scope" aria-label="Search in"><option value="all">All tabs</option>${M.tabs.map(t=>`<option value="${esc(t.id)}" ${cur===t.id?'selected':''}>${esc(t.name)} only</option>`).join('')}</select>`}
function searchForm(base,q,scope){return `<form class="sform" data-s="${esc(base)}" role="search"><input type="search" name="q" value="${esc(q)}" placeholder="Search the Store" aria-label="Search the Store">${scopeSel(scope)}<button class="btn sm" type="submit">Search</button></form>`}
document.addEventListener('submit',e=>{const f=e.target.closest('form[data-s]');if(!f)return;e.preventDefault();const d=new FormData(f),q=String(d.get('q')||'').trim(),sc=d.get('scope')||'all';
 go(q?url(sc==='all'?'/store':'/store/'+encodeURIComponent(sc),{q,scope:sc==='all'?'':sc}):f.dataset.s)});
document.addEventListener('change',e=>{const s=e.target.closest('[data-p]');if(!s)return;const u=new URL(location.href);const p=u.searchParams;
 if(s.value)p.set(s.dataset.p,s.value);else p.delete(s.dataset.p);p.delete('page');go(u.pathname+(p.toString()?'?'+p:''),true)});
function pager(total,page,base){const n=Math.ceil(total/PAGE);if(n<=1)return '';const u=new URL(location.href),mk=i=>{u.searchParams.set('page',i);return u.pathname+'?'+u.searchParams};
 const b=[];b.push(page>1?`<a href="${mk(page-1)}">‹ Prev</a>`:'<span class="dis">‹ Prev</span>');for(let i=1;i<=n;i++)if(i===1||i===n||Math.abs(i-page)<=1)b.push(i===page?`<span class="on" aria-current="page">${i}</span>`:`<a href="${mk(i)}">${i}</a>`);else if(Math.abs(i-page)===2)b.push('<span class="dis">…</span>');
 b.push(page<n?`<a href="${mk(page+1)}">Next ›</a>`:'<span class="dis">Next ›</span>');return `<nav class="pager" aria-label="Pages">${b.join('')}</nav>`}
const sortSel=cur=>`<label>Sort<select data-p="sort">${Object.entries(HXS.SORTS).map(([k,v])=>`<option value="${k}" ${k===cur?'selected':''}>${v}</option>`).join('')}</select></label>`;
const grid=l=>`<div class="pgrid">${l.map(p=>HXS.card(p,M.cats)).join('')}</div>`;
function empty(title,text,clear){return `<div class="empty"><h3>${esc(title)}</h3><p>${esc(text)}</p>${clear?`<a class="btn sm" href="${clear}">Clear filters</a>`:''}</div>`}

/* ---- Store landing ---- */
function landing(){const q=qs(),sort=q.get('sort')||'newest';document.title='Store | Helix Studio';
 if(!M.products.length){app.innerHTML=`<div class="wrap"><div class="sthead"><h1>Store</h1></div>${empty('The Store is empty right now','New products will appear here as soon as they are published.')}</div>`;return}
 const feat=M.tabs.map(t=>({t,l:HXS.featuredOf(M.products.filter(p=>p.cat===t.id),3)})).filter(x=>x.l.length),recent=HXS.sort(M.products,sort).slice(0,8);
 app.innerHTML=`<div class="wrap"><div class="sthead"><div><h1>Store</h1><p class="mu">Animations, builds and plugins from Helix Studio and approved sellers.</p></div>${searchForm('/store','','all')}</div>
 ${feat.map(({t,l})=>`<section class="sec"><div class="hd"><h2>Featured ${esc(t.name)}</h2><a href="/store/${esc(t.id)}">View all ${esc(t.name)} →</a></div>${grid(l)}</section>`).join('')}
 <section class="sec"><div class="hd"><h2>Recently published</h2><div class="stool" style="margin:0">${sortSel(sort)}</div></div>${grid(recent)}</section></div>`}

/* ---- Tab page, and search results (scope all or one tab) ---- */
function listPage(tab){const q=qs(),term=(q.get('q')||'').trim(),sort=q.get('sort')||(term?'':'featured'),page=Math.max(1,+q.get('page')||1),price=q.get('price')||'';
 const scope=q.get('scope')||'all',st=term?(scope!=='all'?M.tabs.find(t=>t.id===scope):null):tab;
 const base=st?M.products.filter(p=>p.cat===st.id):M.products,fl=st?st.fields.filter(f=>f.filter):[];
 let list=HXS.search(base,term);
 if(price==='free')list=list.filter(p=>HXS.priceText(p)==='Free');if(price==='paid')list=list.filter(p=>HXS.priceText(p)!=='Free');
 const act={};for(const f of fl){const v=q.get('f_'+f.k);if(v){act[f.k]=v;list=list.filter(p=>matchF(p,f,v))}}
 const filtered=!!(price||Object.keys(act).length),title=term?`Results for "${term}"`:tab.name;
 if(sort&&!(term&&!q.get('sort')))list=HXS.sort(list,sort);
 const total=list.length,show=list.slice((page-1)*PAGE,page*PAGE),clear=url(location.pathname,{q:term,scope:q.get('scope')||''});
 document.title=`${title} | Store | Helix Studio`;
 const featured=!term&&!filtered&&page===1&&tab?HXS.featuredOf(list,3):[];
 app.innerHTML=`<div class="wrap"><div class="sthead"><div><h1>${esc(title)}</h1><p class="mu">${total} ${total===1?'product':'products'}${term?` in ${st?esc(st.name):'all tabs'}`:''}</p></div>${searchForm(tab&&!term?'/store/'+esc(tab.id):'/store',term,scope)}</div>
 <div class="stool"><label>Price<select data-p="price"><option value="">All</option><option value="free" ${price==='free'?'selected':''}>Free</option><option value="paid" ${price==='paid'?'selected':''}>Paid</option></select></label>
 ${fl.map(f=>`<label>${esc(f.label)}<select data-p="f_${esc(f.k)}"><option value="">Any</option>${optsFor(f,base).map(o=>`<option ${act[f.k]===o?'selected':''}>${esc(o)}</option>`).join('')}</select></label>`).join('')}${sortSel(sort||'featured')}${filtered?`<a class="btn ghost sm" href="${clear}" style="align-self:end">Clear filters</a>`:''}</div>
 ${featured.length?`<section class="sec" style="margin-top:0"><div class="hd"><h2>Featured</h2></div>${grid(featured)}</section><div class="hd" style="margin:0 0 12px"><h2>All ${esc(tab.name)}</h2></div>`:''}
 ${show.length?grid(show)+pager(total,page):term||filtered?empty('No products match','Try different words or loosen a filter.',clear):empty(`No ${tab.name} yet`,'Nothing has been published in this tab yet. Check back soon.')}</div>`}

/* ---- Product page ---- */
function product(r){const tab=M.tabs.find(t=>t.id===r.tab),me=window.Helix&&Helix.me&&Helix.me(),p=M.all.find(x=>x.id===r.id&&(!tab||x.cat===r.tab));
 if(!p||(p.status!=='published'&&!(me&&(me.owner||p.seller===me.id)))){document.title='Not found | Store';app.innerHTML=`<div class="wrap"><div class="crumbs"><a href="/store">Store</a></div>${empty('Product not found','It may have been unpublished or the link is wrong.')}<p style="text-align:center"><a class="btn" href="/store">Back to the Store</a></p></div>`;return}
 const cat=M.cats.find(c=>c.id===p.cat)||{name:p.cat,fields:[]};if(window.Helix)Helix.setSection('store',p.cat);document.title=`${p.title} | ${cat.name} | Helix Studio`;
 const items=[];if(p.video)items.push({t:'v',s:p.video});for(const i of p.images)items.push({t:'i',s:i});
 const shown=cat.fields.filter(f=>f.page!==false&&p.fields[f.k]),short=shown.filter(f=>f.type!=='longtext'),long=shown.filter(f=>f.type==='longtext');
 const related=M.products.filter(x=>x.cat===p.cat&&x.id!==p.id).slice(0,4),note=p.price>0&&p.fulfillment==='payhip'?HXS.saleNote(M.banner):'';
 const name=u=>(M.names[u]||{}).name||'';
 if(p.fulfillment==='payhip')HXS.loadPayhip();
 app.innerHTML=`<div class="wrap">${p.status!=='published'?`<div class="pv">Preview only: this product is "${esc(p.status)}" and not visible to the public.</div>`:''}
 <div class="crumbs"><a href="/store">Store</a> › <a href="/store/${esc(p.cat)}">${esc(cat.name)}</a> › ${esc(p.title)}</div>
 <div class="pp"><div><div class="gm" id="gm"></div>${items.length>1?`<div class="gt">${items.map((x,i)=>`<button data-g="${i}" aria-pressed="${i===0}" aria-label="Media ${i+1}" ${x.t==='i'?`style="background-image:url('${esc(x.s)}')"`:''}>${x.t==='v'?'▶ Video':''}</button>`).join('')}</div>`:''}</div>
 <div class="pinfo"><span class="mu">${esc(cat.name)}</span><h1>${esc(p.title)}</h1><div class="bd" style="position:static">${HXS.badges(p)}</div><p>${esc(p.short)}</p>
  <div class="big">${esc(HXS.priceText(p))}</div>${note?`<div class="note">${esc(note)}</div>`:''}<div>${HXS.buy(p,{cls:'lg'})}</div>
  <dl class="kv"><dt>Category</dt><dd>${esc(cat.name)}</dd>${p.publisher?`<dt>Publisher</dt><dd>${esc(p.publisher)}</dd>`:''}${p.seller&&name(p.seller)&&p.publisher!==name(p.seller)?`<dt>Seller</dt><dd>${esc(name(p.seller))}</dd>`:''}${short.map(f=>`<dt>${esc(f.label)}</dt><dd>${esc(p.fields[f.k])}</dd>`).join('')}${p.license?`<dt>License</dt><dd>${esc(p.license)}</dd>`:''}</dl></div></div>
 ${p.features.length?`<section class="blk2"><h2>Features</h2><ul>${p.features.map(f=>`<li>${esc(f)}</li>`).join('')}</ul></section>`:''}
 ${p.long?`<section class="blk2"><h2>About</h2>${para(p.long)}</section>`:''}
 ${long.map(f=>`<section class="blk2"><h2>${esc(f.label)}</h2>${para(p.fields[f.k])}</section>`).join('')}
 ${p.support?`<section class="blk2"><h2>Support</h2>${para(p.support)}</section>`:''}
 <section class="blk2"><h2>License</h2><p class="mu">${p.license?esc(p.license)+' ':''}See the <a href="/license.html" style="color:var(--cy)">full license terms</a>.</p></section>
 ${related.length?`<section class="sec"><div class="hd"><h2>Related in ${esc(cat.name)}</h2><a href="/store/${esc(p.cat)}">View all →</a></div>${grid(related)}</section>`:''}</div>`;
 const gm=document.getElementById('gm'),draw=i=>{const x=items[i];gm.innerHTML=!x?HXS.media(p,cat):x.t==='v'?`<video src="${esc(x.s)}" ${p.poster?`poster="${esc(p.poster)}"`:''} controls playsinline preload="metadata" onerror="this.outerHTML='<div class=ph><span>No preview</span></div>'"></video>`:`<img src="${esc(x.s)}" alt="${esc(p.title)}">`;
  document.querySelectorAll('.gt button').forEach((b,j)=>b.setAttribute('aria-pressed',j===i))};draw(0);
 document.querySelectorAll('.gt button').forEach(b=>b.onclick=()=>draw(+b.dataset.g))}

document.addEventListener('click',e=>{if(e.target.closest('[data-signin]'))alert('Sign in with the button at the top right, then reload this page.')});
async function render(){if(!M){app.innerHTML='<div class="wrap"><p class="mu" style="padding:60px 0">Loading…</p></div>';M=await HXS.load();await Helix.ready}
 Helix.setStoreTabs&&Helix.setStoreTabs(M.tabs);const r=route(),tab=M.tabs.find(t=>t.id===r.tab);
 if(r.id){if(!M.all.find(x=>x.id===r.id)&&Helix.me&&Helix.me()){}return product(r)}
 Helix.setSection('store',tab?tab.id:'');
 if(r.tab&&!tab){document.title='Not found | Store';app.innerHTML=`<div class="wrap"><div class="crumbs"><a href="/store">Store</a></div>${empty('That tab does not exist','Pick one of the tabs above.')}</div>`;return}
 if(!tab&&!qs().get('q'))return landing();
 listPage(tab)}
render();
})();
