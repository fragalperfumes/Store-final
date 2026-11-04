(function(){
  function money(c){ return 'Rs. ' + (c/100).toLocaleString('en-US',{minimumFractionDigits:2, maximumFractionDigits:2}); }
  var toastEl = document.getElementById('themeToast'), toastTimer = null;
  function toast(m){ if(!toastEl) return; toastEl.textContent = m; toastEl.classList.add('on'); clearTimeout(toastTimer); toastTimer = setTimeout(function(){ toastEl.classList.remove('on'); }, 2800); }
  /* hero fit — announcement bar + header ki asal height */
  function fitHero(){
    var mq = document.querySelector('.marquee'), hd = document.querySelector('header.site');
    var mh = mq ? mq.offsetHeight : 0, hh = hd ? hd.offsetHeight : 0;
    if(mh) document.documentElement.style.setProperty('--marquee-h', mh + 'px');
    if(hh) document.documentElement.style.setProperty('--header-h', hh + 'px');
    var hero = document.querySelector('.hero-screen');
    if(hero && (mh + hh) > 0){ hero.style.height = 'calc(100svh - ' + (mh + hh) + 'px)'; hero.style.maxHeight = hero.style.height; }
  }
  fitHero(); window.addEventListener('resize', fitHero); window.addEventListener('load', fitHero);
  if(document.fonts && document.fonts.ready){ document.fonts.ready.then(fitHero); }
  /* mobile sticky header — scroll down hides it, scroll up shows it instantly (no need to return to the top). Desktop (>1080px) is unchanged. */
  /* DIRECTION ANCHOR (pack9): direction is measured from hdrAnchorY — the position where the header state last changed — NOT from the previous scroll event. The old per-event delta (+4/-2 vs a lastY reset on every event) never fired on phones: momentum/slow scroll moves in 1-2px steps, so the -2 threshold was never crossed and the header stayed hidden until the very top. Now, while hidden, the anchor follows the deepest scroll point and the FIRST upward movement removes hdr-hide immediately. */
  var hdrEl = document.querySelector('header.site');
  var hdrAnchorY = window.scrollY || 0;
  var hdrMobile = window.matchMedia('(max-width: 1080px)');
  function hdrOnScroll(){
    if(!hdrEl) return;
    var y = window.scrollY || 0;
    if(!hdrMobile.matches){ hdrEl.classList.remove('hdr-hide'); hdrAnchorY = y; return; }
    var sp2 = document.getElementById('searchPanel'), nd2 = document.getElementById('navDrawer'), cd2 = document.getElementById('cartDrawer');
    if((sp2 && sp2.classList.contains('open')) || (nd2 && nd2.classList.contains('open')) || (cd2 && cd2.classList.contains('on'))){ hdrEl.classList.remove('hdr-hide'); hdrAnchorY = y; return; }
    if(y <= 8){ hdrEl.classList.remove('hdr-hide'); hdrAnchorY = y; return; }
    if(hdrEl.classList.contains('hdr-hide')){
      if(y < hdrAnchorY) hdrEl.classList.remove('hdr-hide');
      hdrAnchorY = y;
    } else if(y > hdrAnchorY + 4){
      hdrEl.classList.add('hdr-hide'); hdrAnchorY = y;
    } else if(y < hdrAnchorY){
      hdrAnchorY = y;
    }
  }
  window.addEventListener('scroll', hdrOnScroll, { passive:true });
  window.addEventListener('resize', hdrOnScroll);
  var track = document.getElementById('marqueeTrack'); if(track){ track.innerHTML += track.innerHTML; }
  /* mobile nav drawer — right slide-in */
  var navDrawer = document.getElementById('navDrawer'), navScrim = document.getElementById('navScrim'), menuBtn = document.getElementById('menuBtn');
  function openNav(){ if(!navDrawer) return; navDrawer.classList.add('open'); if(navScrim) navScrim.classList.add('on'); document.body.style.overflow = 'hidden'; if(menuBtn) menuBtn.setAttribute('aria-expanded','true'); }
  function closeNav(){ if(!navDrawer || !navDrawer.classList.contains('open')) return; navDrawer.classList.remove('open'); if(navScrim) navScrim.classList.remove('on'); document.body.style.overflow = ''; if(menuBtn) menuBtn.setAttribute('aria-expanded','false'); }
  if(menuBtn) menuBtn.addEventListener('click', openNav);
  var navClose = document.getElementById('navClose'); if(navClose) navClose.addEventListener('click', closeNav);
  if(navScrim) navScrim.addEventListener('click', closeNav);
  if(navDrawer) navDrawer.addEventListener('click', function(e){ if(e.target.closest('a')) closeNav(); });
  /* logo click — FIX 11 (pack11): HAR click par asal page reload (preview jaisa). User ki final request: logo jab bhi click ho — top par ho, neeche scroll ho, drawer khula ho ya band — hamesha refresh. Is liye default home-link navigation bhi roki jati hai (preventDefault) aur location.reload() chalti hai. */
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-logo-scroll]').forEach(function(el){
    el.addEventListener('click', function(e){
      e.preventDefault(); window.location.reload();
    });
  });
  /* active nav highlight — scroll-spy (preview wale 6 tabs) */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('#mainNav a, .drawer-links a'));
  var MAP = { home:'HOME', shop:'SHOP ALL', reviews:'REVIEWS', about:'WHY FRAGAL', faq:'FAQ', contact:'CONTACT US' };
  var secs = ['home','shop','reviews','about','faq','contact'].map(function(id){ return document.getElementById(id); }).filter(Boolean);
  var activeKey = 'HOME', spyLocked = false, unlockT = null, safetyT = null;
  function keyOf(a){ return a.textContent.trim().toUpperCase(); }
  function setActive(k){ if(!k) return; activeKey = k; navLinks.forEach(function(a){ a.classList.toggle('active', keyOf(a) === k); }); }
  function spy(){ if(spyLocked) return; var hh = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) || 95; var line = window.scrollY + hh + Math.min(window.innerHeight * 0.35, 320); var cur = 'home'; secs.forEach(function(s){ if(s.getBoundingClientRect().top + window.scrollY <= line) cur = s.id; }); var k = MAP[cur]; if(k && k !== activeKey) setActive(k); }
  function unlock(){ spyLocked = false; clearTimeout(unlockT); clearTimeout(safetyT); spy(); }
  navLinks.forEach(function(a){ a.addEventListener('click', function(){ setActive(keyOf(a)); spyLocked = true; clearTimeout(safetyT); safetyT = setTimeout(unlock, 3000); }); });
  var ticking = false;
  window.addEventListener('scroll', function(){ if(spyLocked){ clearTimeout(unlockT); unlockT = setTimeout(unlock, 220); } if(ticking) return; ticking = true; requestAnimationFrame(function(){ ticking = false; spy(); }); }, { passive:true });
  window.addEventListener('resize', spy); spy();
  /* anchor scroll offset — nav links and in-page # buttons: the section heading must land BELOW the sticky header, never under it. Offset = actual header height + 16px gap (base.css scroll-margin-top keeps the same offset for direct hash landings). If the mobile header is hidden, show it first so the offset always matches the visible header. */
  var ANCHOR_IDS = { home:1, shop:1, reviews:1, about:1, faq:1, contact:1 };
  function scrollToSection(id){
    var el = document.getElementById(id); if(!el) return;
    if(hdrEl) hdrEl.classList.remove('hdr-hide');
    if(id === 'home'){ window.scrollTo({ top:0, behavior: reduceMotion ? 'auto' : 'smooth' }); return; }
    var hh = hdrEl ? hdrEl.offsetHeight : 0;
    var y = el.getBoundingClientRect().top + window.scrollY - hh - 16;
    window.scrollTo({ top: Math.max(0, y), behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  document.querySelectorAll('a[href*="#"]').forEach(function(a){
    var id = (a.hash || '').slice(1);
    if(!ANCHOR_IDS[id]) return;
    a.addEventListener('click', function(e){
      /* intercept only when the link points at THIS page (the home page) — on other pages let the browser navigate home with the hash, where the CSS scroll-margin-top handles the landing */
      var onHome = window.location.pathname === '/' || window.location.pathname === '';
      if(!onHome) return;
      if(a.pathname && a.pathname !== '/' && a.pathname !== window.location.pathname) return;
      if(!document.getElementById(id)) return;
      e.preventDefault(); closeNav();
      setActive(MAP[id]); spyLocked = true; clearTimeout(safetyT); safetyT = setTimeout(unlock, 3000);
      try{ history.replaceState(null, '', '#' + id); }catch(err){}
      scrollToSection(id);
    });
  });
  /* ---- SEARCH — header panel: khaali khulta hai, likhne par PRODUCTS + PAGES ---- */
  var searchBtn = document.getElementById('searchBtn'), searchPanel = document.getElementById('searchPanel'), searchInput = document.getElementById('searchInput'), searchResults = document.getElementById('searchResults');
  var SEARCH_PAGES = [
    { name:'Shop All', url:'/collections/all', keys:'shop all products store buy collection' },
    { name:'About Us', url:'/pages/about-us', keys:'about us house fragal story founder brand' },
    { name:'FAQ', url:'/pages/faq', keys:'faq questions answers help' },
    { name:'Contact Us', url:'/pages/contact', keys:'contact us whatsapp phone email message number' },
    { name:'Shipping Policy', url:'/pages/shipping-policy', keys:'shipping delivery policy charges cod cash on delivery days dispatch' },
    { name:'Return & Refund Policy', url:'/pages/return-refund-policy', keys:'return refund policy money back' },
    { name:'Exchange Policy', url:'/pages/exchange-policy', keys:'exchange policy swap change' },
    { name:'Cancellation Policy', url:'/pages/cancellation-policy', keys:'cancellation cancel policy order' },
    { name:'Privacy Policy', url:'/pages/privacy-policy', keys:'privacy policy data cookies' },
    { name:'Terms of Service', url:'/pages/terms-of-service', keys:'terms of service conditions rules' }
  ];
  function escHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function sMatch(name, keys, q){ var hay = (name + ' ' + keys).toLowerCase(); var toks = q.toLowerCase().split(/\s+/); for(var i=0;i<toks.length;i++){ if(toks[i] && hay.indexOf(toks[i]) === -1) return false; } return true; }
  function renderSearch(){
    if(!searchPanel || !searchInput || !searchResults) return;
    var q = searchInput.value.trim();
    if(!q){ searchResults.innerHTML = '<div class="search-hint">Type to search products and pages</div>'; return; }
    var prod = null;
    var pn = searchPanel.getAttribute('data-prod-name') || 'ZARAN 50ML';
    if(sMatch(pn, 'zaran perfume parfum fragrance scent fragal men mens mard fresh floral 50ml 50 ml bottle spray attar signature', q)){
      prod = { name: pn, sub: searchPanel.getAttribute('data-prod-sub') || '', url: searchPanel.getAttribute('data-prod-url') || '#shop', img: searchPanel.getAttribute('data-prod-img') || '', price: searchPanel.getAttribute('data-prod-price') || '', was: searchPanel.getAttribute('data-prod-was') || '' };
    }
    var pages = SEARCH_PAGES.filter(function(p){ return sMatch(p.name, p.keys, q); });
    if(!prod && !pages.length){ searchResults.innerHTML = '<div class="search-empty">No results found for <b>&ldquo;' + escHtml(q) + '&rdquo;</b><br>Try &ldquo;zaran&rdquo;, &ldquo;perfume&rdquo;, &ldquo;shipping&rdquo; or &ldquo;returns&rdquo;.</div>'; return; }
    var html = '';
    if(prod){ html += '<div class="search-group-label">PRODUCTS</div><a class="search-item" href="' + prod.url + '">' + (prod.img ? '<img src="' + prod.img + '" alt="">' : '') + '<span class="si-main"><span class="si-name">' + escHtml(prod.name) + '</span><span class="si-sub">' + escHtml(prod.sub) + '</span></span><span class="si-price"><b>' + prod.price + '</b>' + (prod.was ? '<s>' + prod.was + '</s>' : '') + '</span></a>'; }
    if(pages.length){ html += '<div class="search-group-label">PAGES</div>'; pages.forEach(function(p){ html += '<a class="search-item" href="' + p.url + '"><span class="si-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M14 3v5h5"/></svg></span><span class="si-main"><span class="si-name">' + p.name + '</span></span><span class="si-arrow" aria-hidden="true">\u203A</span></a>'; }); }
    searchResults.innerHTML = html;
  }
  function openSearch(){ if(!searchPanel) return; closeNav(); closeCart(); searchInput.value = ''; renderSearch(); searchPanel.classList.add('open'); searchBtn.setAttribute('aria-expanded','true'); setTimeout(function(){ searchInput.focus(); }, 40); }
  function closeSearch(){ if(!searchPanel || !searchPanel.classList.contains('open')) return; searchPanel.classList.remove('open'); if(searchBtn) searchBtn.setAttribute('aria-expanded','false'); }
  if(searchBtn) searchBtn.addEventListener('click', function(){ if(searchPanel.classList.contains('open')) closeSearch(); else openSearch(); });
  var searchClose = document.getElementById('searchClose'); if(searchClose) searchClose.addEventListener('click', closeSearch);
  if(searchInput){ searchInput.addEventListener('input', renderSearch); searchInput.addEventListener('keydown', function(e){ if(e.key === 'Enter'){ var f = searchResults.querySelector('.search-item'); if(f){ e.preventDefault(); f.click(); } } }); }
  document.addEventListener('click', function(e){ if(!searchPanel || !searchPanel.classList.contains('open')) return; if(searchPanel.contains(e.target) || searchBtn.contains(e.target)) return; closeSearch(); });
  /* ---- CART — Shopify AJAX Cart API (/cart/add.js, /cart.js, /cart/change.js) ---- */
  var drawer = document.getElementById('cartDrawer'), scrim = document.getElementById('cartScrim');
  var itemsEl = document.getElementById('cartItems'), totalEl = document.getElementById('cartTotal'), footEl = document.getElementById('cartFooter');
  function openCart(){ if(drawer) drawer.classList.add('on'); if(scrim) scrim.classList.add('on'); }
  function closeCart(){ if(drawer) drawer.classList.remove('on'); if(scrim) scrim.classList.remove('on'); }
  var cartBtn = document.getElementById('cartBtn'); if(cartBtn) cartBtn.addEventListener('click', function(){ refreshCart(); openCart(); });
  var dc = document.getElementById('drawerClose'); if(dc) dc.addEventListener('click', closeCart);
  if(scrim) scrim.addEventListener('click', closeCart);
  function setCount(n){ document.querySelectorAll('[data-cart-count]').forEach(function(el){ el.textContent = n; }); }
  function renderCart(cart){
    setCount(cart.item_count);
    if(totalEl) totalEl.textContent = money(cart.total_price);
    if(!itemsEl) return;
    if(cart.item_count === 0){ if(footEl) footEl.style.display = 'none'; itemsEl.innerHTML = '<div class="empty-cart">Your cart is currently empty.</div>'; return; }
    if(footEl) footEl.style.display = '';
    var html = '';
    cart.items.forEach(function(it, i){
      html += '<div class="cart-item">' + (it.image ? '<img src="' + it.image + '" alt="">' : '') + '<div style="flex:1;min-width:0"><h4>' + it.product_title + '</h4><p>' + (it.variant_title && it.variant_title !== 'Default Title' ? it.variant_title + ' \u00B7 ' : '') + money(it.price) + '</p><div class="row2"><span class="mini-qty"><button type="button" data-cart-dec data-line="' + (i + 1) + '">\u2212</button><output>' + it.quantity + '</output><button type="button" data-cart-inc data-line="' + (i + 1) + '">+</button></span><b style="color:var(--gold-2)">' + money(it.final_line_price) + '</b></div><button class="remove" type="button" data-cart-remove data-line="' + (i + 1) + '">Remove</button></div></div>';
    });
    itemsEl.innerHTML = html;
    itemsEl.querySelectorAll('[data-cart-inc]').forEach(function(b){ b.addEventListener('click', function(){ changeLine(+b.getAttribute('data-line'), null, 1); }); });
    itemsEl.querySelectorAll('[data-cart-dec]').forEach(function(b){ b.addEventListener('click', function(){ changeLine(+b.getAttribute('data-line'), null, -1); }); });
    itemsEl.querySelectorAll('[data-cart-remove]').forEach(function(b){ b.addEventListener('click', function(){ changeLine(+b.getAttribute('data-line'), 0, 0); }); });
  }
  function refreshCart(){ return fetch('/cart.js', { headers:{ 'Accept':'application/json' } }).then(function(r){ return r.json(); }).then(renderCart).catch(function(){}); }
  function changeLine(line, qtySet, delta){
    fetch('/cart.js').then(function(r){ return r.json(); }).then(function(cart){
      var it = cart.items[line - 1]; if(!it) return;
      var q = qtySet !== null ? qtySet : it.quantity + delta; if(q < 0) q = 0;
      return fetch('/cart/change.js', { method:'POST', headers:{ 'Content-Type':'application/json', 'Accept':'application/json' }, body: JSON.stringify({ line: line, quantity: q }) });
    }).then(function(r){ return r ? r.json() : null; }).then(function(cart){ if(cart) renderCart(cart); }).catch(function(){ toast('Could not update your cart — please try again'); });
  }
  function addToCart(variantId, quantity){
    if(!variantId){ toast('Please select the ZARAN product in the theme editor (Featured product section)'); return; }
    fetch('/cart/add.js', { method:'POST', headers:{ 'Content-Type':'application/json', 'Accept':'application/json' }, body: JSON.stringify({ items:[{ id: variantId, quantity: quantity }] }) })
      .then(function(r){ if(!r.ok) throw new Error('add failed'); return r.json(); })
      .then(function(){ return refreshCart(); })
      .then(function(){ toast('ZARAN 50ML added to cart'); openCart(); })
      .catch(function(){ toast('Could not add to cart \u2014 please try again'); });
  }
  /* ADD TO CART aur BUY NOW — dono item add karke cart drawer kholte hain (preview jaisa) */
  document.querySelectorAll('[data-add-to-cart]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var vid = btn.getAttribute('data-variant-id');
      var sel = document.getElementById('variantSelect'); if(sel && sel.value && btn.closest('.pd-info')) vid = sel.value;
      addToCart(vid ? parseInt(vid, 10) : null, 1);
    });
  });
  var vs = document.getElementById('variantSelect');
  if(vs) vs.addEventListener('change', function(){ var o = vs.options[vs.selectedIndex]; document.querySelectorAll('[data-add-to-cart]').forEach(function(b){ b.setAttribute('data-variant-id', vs.value); }); var c = o.getAttribute('data-price'); if(c){ var pv = document.getElementById('productPrice'); if(pv) pv.textContent = money(parseInt(c, 10)); } });
  refreshCart();
  /* product page gallery — thumbnail click par bari photo */
  var pdMain = document.getElementById('pdMainImg');
  if(pdMain){ document.querySelectorAll('.pd-thumb').forEach(function(t){ t.addEventListener('click', function(){ document.querySelectorAll('.pd-thumb').forEach(function(x){ x.classList.remove('on'); }); t.classList.add('on'); pdMain.src = t.getAttribute('data-pd-src'); pdMain.alt = t.getAttribute('data-pd-alt') || ''; }); }); }
  /* FAQ accordion */
  var items = document.querySelectorAll('.faq-item');
  function setA(item, open){ var a = item.querySelector('.faq-a'), q = item.querySelector('.faq-q'); if(!a || !q) return; item.classList.toggle('open', open); q.setAttribute('aria-expanded', open ? 'true' : 'false'); a.style.maxHeight = open ? a.scrollHeight + 'px' : '0px'; }
  items.forEach(function(item){ if(item.classList.contains('open')) setA(item, true); var q = item.querySelector('.faq-q'); if(q) q.addEventListener('click', function(){ var will = !item.classList.contains('open'); items.forEach(function(it){ setA(it, false); }); if(will) setA(item, true); }); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ closeCart(); closeNav(); closeSearch(); } });
})();

/* ---- REVIEWS — infinite loop carousel (preview jaisa) ---- */
(function(){
  var track = document.getElementById('revTrack'); if(!track) return;
  var viewport = track.parentNode;
  var cards = Array.prototype.slice.call(track.children);
  var dotsWrap = document.getElementById('revDots');
  var index = 0, builtVisible = 0, curPhys = 0, pendingJump = null, jumpTimer = null;
  function visible(){ return window.innerWidth <= 700 ? 1 : 3; }
  function maxIndex(){ return Math.max(0, cards.length - visible()); }
  function allCards(){ return Array.prototype.slice.call(track.children); }
  function cardW(){ return cards[0] ? cards[0].offsetWidth : 0; }
  function physStart(logical){ return visible() + logical; }
  function buildClones(){
    allCards().forEach(function(c){ if(c.classList.contains('rev-clone')) track.removeChild(c); });
    var v = visible();
    var prepend = cards.slice(maxIndex());
    var append = cards.slice(0, v);
    append.forEach(function(c){ var cl = c.cloneNode(true); cl.classList.add('rev-clone'); cl.classList.remove('is-center'); cl.setAttribute('aria-hidden','true'); track.appendChild(cl); });
    for(var i = prepend.length - 1; i >= 0; i--){ var cl2 = prepend[i].cloneNode(true); cl2.classList.add('rev-clone'); cl2.classList.remove('is-center'); cl2.setAttribute('aria-hidden','true'); track.insertBefore(cl2, track.firstChild); }
    builtVisible = v;
  }
  function buildDots(){
    if(!dotsWrap) return;
    dotsWrap.innerHTML = '';
    for(var i = 0; i <= maxIndex(); i++){ var b = document.createElement('button'); b.type = 'button'; b.className = 'rev-dot'; b.setAttribute('aria-label', 'Show review slide ' + (i + 1)); (function(n){ b.addEventListener('click', function(){ goTo(n); }); })(i); dotsWrap.appendChild(b); }
  }
  function applyPos(phys, logical){
    curPhys = phys;
    track.style.transform = 'translateX(' + (-phys * cardW()) + 'px)';
    var centerPhys = visible() === 1 ? phys : phys + 1;
    allCards().forEach(function(c, i){ c.classList.toggle('is-center', i === centerPhys); });
    if(dotsWrap) Array.prototype.forEach.call(dotsWrap.children, function(d, i){ d.classList.toggle('on', i === logical); });
  }
  function settlePending(){
    if(pendingJump === null) return;
    var target = pendingJump; pendingJump = null;
    if(jumpTimer){ clearTimeout(jumpTimer); jumpTimer = null; }
    track.classList.add('dragging');
    applyPos(target, index);
    void track.offsetWidth;
    track.classList.remove('dragging');
  }
  function goTo(n){
    settlePending();
    var max = maxIndex();
    if(n > max){ index = 0; pendingJump = physStart(0); applyPos(visible() + cards.length, 0); jumpTimer = setTimeout(settlePending, 620); }
    else if(n < 0){ index = max; pendingJump = physStart(max); applyPos(0, max); jumpTimer = setTimeout(settlePending, 620); }
    else { index = n; applyPos(physStart(index), index); }
  }
  track.addEventListener('transitionend', function(e){ if(e.propertyName === 'transform') settlePending(); });
  function refresh(){ if(jumpTimer){ clearTimeout(jumpTimer); jumpTimer = null; } pendingJump = null; if(builtVisible !== visible()) buildClones(); buildDots(); goTo(index); }
  window.addEventListener('resize', refresh);
  window.addEventListener('load', refresh);
  buildClones(); refresh();
  var dragId = null, dragStartX = 0, dragDX = 0, SWIPE_MIN = 45;
  function baseX(){ return -curPhys * cardW(); }
  viewport.addEventListener('pointerdown', function(e){ if(dragId !== null) return; settlePending(); dragId = e.pointerId; dragStartX = e.clientX; dragDX = 0; track.classList.add('dragging'); if(viewport.setPointerCapture){ try{ viewport.setPointerCapture(e.pointerId); }catch(err){} } });
  viewport.addEventListener('pointermove', function(e){ if(dragId === null || e.pointerId !== dragId) return; dragDX = e.clientX - dragStartX; track.style.transform = 'translateX(' + (baseX() + dragDX) + 'px)'; });
  function endDrag(e){ if(dragId === null || (e && e.pointerId !== dragId)) return; dragId = null; track.classList.remove('dragging'); var dx = dragDX; dragDX = 0; if(dx <= -SWIPE_MIN) goTo(index + 1); else if(dx >= SWIPE_MIN) goTo(index - 1); else goTo(index); }
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
})();
