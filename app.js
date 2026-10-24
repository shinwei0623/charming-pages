const state={boot:null,productsAll:[],regionItems:[],currentRegion:'',visibleCount:0,pageSize:24,coupons:[],offers:[]};

const DATA_ENDPOINT='https://script.google.com/macros/s/AKfycbxZOMUohIdXn8ZQxFu8wG6HiYhiEnHFfTyX9FoDryM0ost9-G6f3E-KXNeeeFVmuMKx/exec';

if (typeof window !== 'undefined') window.addEventListener('load',()=>{
  const callback='__charmingData_'+Date.now();
  const script=document.createElement('script');
  const timer=setTimeout(()=>{ cleanup(); fail(new Error('資料載入逾時')); },12000);
  function cleanup(){ clearTimeout(timer); try{ delete window[callback]; }catch(_){ window[callback]=undefined; } script.remove(); }
  window[callback]=(data)=>{ cleanup(); init(data); };
  script.onerror=()=>{ cleanup(); fail(new Error('資料載入失敗')); };
  script.src=DATA_ENDPOINT+'?action=public-data&callback='+encodeURIComponent(callback)+'&v='+Date.now();
  document.head.appendChild(script);
});
if(typeof window!=='undefined'){
  setInterval(refreshOfferDay,60000);
  window.addEventListener('focus',refreshOfferDay);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshOfferDay()});
}

function init(d){
  state.boot=d||{};
  state.offerDay=offerTodayKey();
  d=currentPublicData(state.boot,state.offerDay);
  state.productsAll=d.products||[];
  state.coupons=d.coupons||[];
  state.offers=d.offers||[];
  state.pageSize=Math.max(6,Number(d.site&&d.site.DEFAULT_PAGE_SIZE||24)||24);

  siteTitle.textContent=d.site.SITE_TITLE||'Charming 日本自由行';
  siteSubtitle.textContent=d.site.SITE_SUBTITLE||'收藏東京、關西、北海道與沖繩的折扣碼、交通票券、熱門景點與旅行靈感。';
  const notice=String(d.site.HERO_NOTICE||'').trim();heroNotice.textContent=notice;heroNotice.hidden=!notice;
  generatedAt.textContent=d.publishedAt?('發布 '+formatDateTime(d.publishedAt)):d.generatedAt?('資料更新 '+formatDateTime(d.generatedAt)):'';

  const status=String(d.site.SITE_STATUS||'LIVE');
  if(status!=='LIVE'){
    siteStatusBanner.hidden=false;
    siteStatusBanner.textContent=status==='MAINTENANCE'?'網站目前為維護模式，內容仍可預覽。':'網站目前為建置中模式。';
  }else siteStatusBanner.hidden=true;

  const searchEnabled=d.site.SEARCH_ENABLED!==false;
  const searchPanel=document.querySelector('.searchPanel');if(searchPanel)searchPanel.hidden=!searchEnabled;

  buildThemes(d.themes||{},d.site.THEME_DEFAULT||'heritage',d.site.THEME_ALLOW_SWITCH!==false);
  applyHomeSections(d.sections||[]);
  featuredCodes.innerHTML=(d.featuredCodes||[]).map(x=>card(x.type,x.item)).join('')||'<p>目前尚無精選優惠碼。</p>';
  recommendations.innerHTML=(d.recommendations||[]).map(x=>card(x.type,x.item)).join('')||'<p>目前尚無 Charming 推薦。</p>';
  renderCoupons(d.couponPreview||[]);renderOffers(d.offerPreview||[]);

  regions.innerHTML=(d.regions||[]).map(r=>`<button class="chip" data-r="${esc(r)}" onclick="loadRegion('${jsq(r)}')">${esc(r)}</button>`).join('');
  const first=(d.regions||[]).includes(d.site.DEFAULT_REGION)?d.site.DEFAULT_REGION:((d.regions||[])[0]||'全部');
  loadRegion(first);
}


function offerTodayKey(now=new Date()){
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const value=type=>parts.find(p=>p.type===type).value;
  return value('year')+'-'+value('month')+'-'+value('day');
}
function offerDateKey(value){
  if(value===undefined||value===null||String(value).trim()==='')return '';
  const match=String(value).trim().match(/^(\d{4}-\d{2}-\d{2})(?:T.*)?$/);
  if(!match)return null;
  const day=match[1],date=new Date(day+'T00:00:00Z');
  return !isNaN(date)&&date.toISOString().slice(0,10)===day?day:null;
}
function isCurrentOffer(item,today=offerTodayKey()){
  if(!item)return false;
  const start=offerDateKey(item.startDate),end=offerDateKey(item.endDate);
  return start!==null&&end!==null&&(!start||start<=today)&&(!end||end>=today);
}
function currentPublicData(data,today=offerTodayKey()){
  const current=items=>(items||[]).filter(item=>isCurrentOffer(item,today));
  const featured=items=>(items||[]).filter(entry=>entry&&entry.item&&(entry.type==='PRODUCT'||isCurrentOffer(entry.item,today)));
  // This is a browser-only projection. Never mutate the published snapshot.
  return {...data,coupons:current(data.coupons),offers:current(data.offers),
    couponPreview:current(data.couponPreview),offerPreview:current(data.offerPreview),
    featuredCodes:featured(data.featuredCodes),recommendations:featured(data.recommendations),
    featured:featured(data.featured)};
}
function refreshOfferDay(){
  if(!state.boot||state.offerDay===offerTodayKey())return;
  const region=state.currentRegion,query=document.getElementById('q').value.trim();
  init(state.boot);
  if(region)loadRegion(region);
  if(query)searchAll();
}

function applyHomeSections(sections){
  const map=Object.fromEntries((sections||[]).map(x=>[x.id,x]));
  document.querySelectorAll('[data-home-section]').forEach(sec=>{const cfg=map[sec.dataset.homeSection];if(!cfg)return;sec.hidden=!cfg.visible;const title=document.getElementById('title-'+sec.dataset.homeSection);if(title&&cfg.title){const icon=(title.textContent.match(/^[^\p{L}\p{N}]+/u)||[''])[0];title.textContent=icon+cfg.title}sec.style.order=String(cfg.sortOrder||9999)});
}
function buildThemes(themes,def,allow){const saved=localStorage.getItem('charmingTheme'),picked=(saved&&themes[saved])?saved:def;applyTheme(picked);if(!allow){themeSwitch.style.display='none';return}const labels={heritage:'旅宿',storybook:'手繪',seasons:'四季'};themeSwitch.innerHTML=Object.keys(themes).map(id=>`<button data-theme="${esc(id)}" onclick="applyTheme('${jsq(id)}')">${labels[id]||esc(themes[id].NAME||id)}</button>`).join('');markTheme()}
function applyTheme(id){document.body.dataset.theme=id;localStorage.setItem('charmingTheme',id);markTheme()}
function markTheme(){document.querySelectorAll('[data-theme]').forEach(x=>x.classList.toggle('active',x.dataset.theme===document.body.dataset.theme))}

function loadRegion(r){
  state.currentRegion=r;state.visibleCount=state.pageSize;
  document.querySelectorAll('.chip').forEach(x=>x.classList.toggle('active',x.dataset.r===r));
  state.regionItems=state.productsAll.filter(x=>r==='全部'||String(x.region||'')===r);
  renderRegionProducts();
}
function renderRegionProducts(){
  const visible=state.regionItems.slice(0,state.visibleCount);renderProducts(visible);
  loadMoreProducts.hidden=state.visibleCount>=state.regionItems.length;
  if(!loadMoreProducts.hidden)loadMoreProducts.textContent=`載入更多（尚有 ${state.regionItems.length-state.visibleCount} 筆）`;
}
function loadMoreRegionProducts(){state.visibleCount+=state.pageSize;renderRegionProducts()}
function loadCoupons(){renderCoupons(state.coupons||[])}
function renderProducts(a){products.innerHTML=a.map(productCard).join('')||'<p>目前沒有資料</p>'}
function renderCoupons(a){coupons.innerHTML=a.filter(x=>String(x.code||'').trim()).map(couponCard).join('')||'<p>目前沒有折扣碼</p>'}
function renderOffers(a){offers.innerHTML=a.map(offerCard).join('')||'<p>目前沒有其他優惠</p>'}
function card(t,x){return t==='COUPON'?couponCard(x):t==='OFFER'?offerCard(x):productCard(x)}
function couponCard(x){if(!isCurrentOffer(x))return '';if(!String(x.code||'').trim())return recommendationCard(x,'COUPON');const deadline=x.endDate?`<p>期限 ${esc(x.endDate)}</p>`:'';return `<article class="card"><div class="meta">${esc(x.platform||'合作夥伴')}</div><h3>${esc(x.benefit)}</h3><div class="code"><span>${esc(x.code)}</span><button onclick="copy('${jsq(x.code)}')">複製</button></div>${deadline}${x.url?`<a href="${attr(x.url)}" target="_blank">前往使用</a>`:''}</article>`}
function productCard(x){return `<article class="card"><div class="meta">${esc(x.platform||'合作夥伴')}</div><h3>${esc(x.title)}</h3>${x.url?`<a href="${attr(x.url)}" target="_blank">查看行程</a>`:''}</article>`}
function offerCard(x){if(!isCurrentOffer(x))return '';if(!String(x.code||'').trim())return recommendationCard(x,'OFFER');const deadline=x.endDate?`<p>期限 ${esc(x.endDate)}</p>`:'';const note=x.note?`<p class="cardNote">${esc(x.note)}</p>`:'';return `<article class="card"><div class="meta">${esc(x.brand||'合作夥伴')}</div><h3>${esc(x.benefit)}</h3><div class="code"><span>${esc(x.code)}</span><button onclick="copy('${jsq(x.code)}')">複製</button></div>${deadline}${note}${x.url?`<a href="${attr(x.url)}" target="_blank">前往使用</a>`:''}</article>`}
function recommendationCard(x,type){if(type!=='PRODUCT'&&!isCurrentOffer(x))return '';const partner=type==='OFFER'?(x.brand||'合作夥伴'):(x.platform||'合作夥伴'),title=x.title||x.benefit||'Charming 推薦',deadline=x.endDate?`<p>期限 ${esc(x.endDate)}</p>`:'';return `<article class="card"><div class="meta">${esc(partner)}</div><h3>${esc(title)}</h3>${deadline}${x.url?`<a href="${attr(x.url)}" target="_blank">${type==='PRODUCT'?'查看行程':'前往使用'}</a>`:''}</article>`}

function searchAll(){
  const q=document.getElementById('q').value.trim().toLowerCase();if(!q){loadRegion(state.currentRegion||'全部');return}
  const pool=[];
  state.productsAll.forEach(d=>pool.push({type:'PRODUCT',item:d,search:[d.title,d.region,d.city,d.category,d.tags,d.platform].join(' ').toLowerCase()}));
  state.coupons.filter(d=>isCurrentOffer(d)).forEach(d=>pool.push({type:'COUPON',item:d,search:[d.benefit,d.code,d.scope,d.category,d.platform].join(' ').toLowerCase()}));
  state.offers.filter(d=>isCurrentOffer(d)).forEach(d=>pool.push({type:'OFFER',item:d,search:[d.benefit,d.code,d.category,d.brand,d.note].join(' ').toLowerCase()}));
  const hit=pool.filter(x=>x.search.includes(q)).slice(0,60);products.innerHTML=hit.map(x=>card(x.type,x.item)).join('')||'<p>找不到符合資料</p>';loadMoreProducts.hidden=true;
  const section=document.getElementById('section-travel_guide');if(section&&section.hidden)section.hidden=false;section?.scrollIntoView({behavior:'smooth',block:'start'});
}
function copy(s){navigator.clipboard.writeText(s).then(()=>toast('已複製 '+s))}
function toast(s){const e=document.getElementById('toast');e.textContent=s;e.style.display='block';setTimeout(()=>e.style.display='none',1400)}
function fail(e){console.error(e);toast('讀取失敗，請重新整理')}
function formatDateTime(s){try{const d=new Date(s);if(isNaN(d))return s;return d.toLocaleString('zh-TW',{hour12:false})}catch(_){return s}}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function attr(s){return esc(s)}
function jsq(s){return String(s??'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,' ')}
