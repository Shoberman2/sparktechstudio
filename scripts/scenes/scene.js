// ?p renders the portrait (4:5, 1080x1350) layout used on phones; each scene places its devices for it under html.p.
if (new URLSearchParams(location.search).has('p')) document.documentElement.classList.add('p')

// Wraps each <div class="phone"> in the iPhone hardware: side keys, bezel, Dynamic Island, status bar, home indicator.
// data-status="light" puts white status text over a dark screen; data-time sets the clock; data-bg the screen color.
const SIGNAL = '<svg width="19" height="12" viewBox="0 0 19 12"><rect x="0" y="7.5" width="3.2" height="4.5" rx="1"/><rect x="5" y="5" width="3.2" height="7" rx="1"/><rect x="10" y="2.5" width="3.2" height="9.5" rx="1"/><rect x="15" y="0" width="3.2" height="12" rx="1"/></svg>'
const WIFI = '<svg width="17" height="12" viewBox="0 0 17 12"><path d="M8.5 2.4c2.4 0 4.6.9 6.3 2.5.2.2.5.2.7 0l1.2-1.2c.2-.2.2-.5 0-.7C14.6.9 11.7-.2 8.5-.2S2.4.9.3 3c-.2.2-.2.5 0 .7l1.2 1.2c.2.2.5.2.7 0 1.7-1.6 3.9-2.5 6.3-2.5z"/><path d="M8.5 6.3c1.3 0 2.5.5 3.5 1.3.2.2.5.2.7 0l1.2-1.2c.2-.2.2-.5 0-.7-1.5-1.3-3.4-2.1-5.4-2.1s-3.9.8-5.4 2.1c-.2.2-.2.5 0 .7l1.2 1.2c.2.2.5.2.7 0 1-.8 2.2-1.3 3.5-1.3z"/><path d="M10.7 9.7c.2-.2.2-.5 0-.7-.6-.5-1.4-.8-2.2-.8s-1.6.3-2.2.8c-.2.2-.2.5 0 .7l1.9 1.9c.2.2.4.2.6 0l1.9-1.9z"/></svg>'
const BATT = '<svg width="28" height="13" viewBox="0 0 28 13"><rect x=".5" y=".5" width="24" height="12" rx="3.8" fill="none" stroke="currentColor" stroke-opacity=".4"/><rect x="2.5" y="2.5" width="20" height="8" rx="2.2"/><path d="M26 4.5v4c.8-.3 1.4-1.1 1.4-2s-.6-1.7-1.4-2z" fill-opacity=".45"/></svg>'


// The example bakery's new site (Maple & Rye is an example business, not a client). Real photographs from photos/ (CC0).
// <div data-mr="desktop"> fills a desktop browser page; <div data-mr="mobile"> fills an iPhone screen under Safari.
const MR_ITEMS = [['sourdough-board.jpg', 'Country Sourdough', '$9'], ['pastry-tray.jpg', 'Pain au Chocolat', '$4.50'], ['chocolate-cake.jpg', 'Chocolate Cake', '$42']]
const mrDesktop = (extra = '') => `<div class="mr mr-d">
  <div class="mr-hero" style="height: 620px">
    <img src="photos/croissant-tray.jpg" alt="">
    <div class="mr-nav" style="padding: 28px 56px"><span class="mr-word" style="font-size: 28px">Maple &amp; Rye</span>
      <span style="display:flex;align-items:center;gap:36px;font-size:17px;font-weight:500"><span>Menu</span><span>Cakes</span><span>Visit</span><span class="mr-btn" style="padding:12px 22px;font-size:16px">Order ahead</span></span></div>
    <div style="position:absolute;left:56px;bottom:60px;z-index:1">
      <h1 style="font-size:104px;max-width:8em">Baked Before Sunrise.</h1>
      <p style="margin-top:20px;font-size:21px;opacity:.92">Sourdough, croissants and cakes, out of the oven by 7am.</p>
      <div style="display:flex;gap:12px;margin-top:30px"><span class="mr-btn" style="padding:16px 30px;font-size:17px">Order ahead</span><span class="mr-btn" style="padding:16px 30px;font-size:17px;background:rgba(255,255,255,.14);color:#fff;box-shadow:inset 0 0 0 1px rgba(255,255,255,.6)">See the menu</span></div>
    </div>
  </div>
  <div style="padding: 52px 56px 0">
    <div style="display:flex;justify-content:space-between;align-items:baseline"><h2 class="mr-word" style="font-size:40px;font-weight:500">This Morning</h2><span style="font-size:17px;font-weight:600;text-decoration:underline;text-underline-offset:5px">Full menu</span></div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px;margin-top:28px">${MR_ITEMS.map(([img, n, p]) => `<div><img src="photos/${img}" alt="" style="width:100%;height:300px;object-fit:cover;border-radius:16px"><p style="display:flex;justify-content:space-between;margin-top:14px;font-size:19px;font-weight:600"><span>${n}</span><span style="font-weight:500;color:#6b5f52">${p}</span></p></div>`).join('')}</div>
  </div>${extra}
</div>`
const mrMobile = (extra = '') => `<div class="mr mr-m" style="position:absolute;inset:0">
  <div class="mr-hero" style="height: 590px">
    <img src="photos/croissant-tray.jpg" alt="">
    <div class="mr-nav" style="padding: 66px 22px 0"><span class="mr-word" style="font-size: 23px">Maple &amp; Rye</span>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><path d="M4 8h16M4 16h16"/></svg></div>
    <div style="position:absolute;left:22px;right:22px;bottom:34px;z-index:1">
      <h1 style="font-size:52px">Baked Before Sunrise.</h1>
      <p style="margin-top:14px;font-size:17px;line-height:1.4;opacity:.92">Sourdough, croissants and cakes, out of the oven by 7am.</p>
      <span class="mr-btn" style="margin-top:22px;width:100%;height:52px;font-size:17px">Order ahead</span>
    </div>
  </div>
  <div style="padding: 26px 22px 0">
    <h2 class="mr-word" style="font-size:28px;font-weight:500">This Morning</h2>
    <div style="display:flex;gap:12px;margin-top:14px">${MR_ITEMS.slice(0, 2).map(([img, n]) => `<div style="flex:1"><img src="photos/${img}" alt="" style="width:100%;height:120px;object-fit:cover;border-radius:12px"><p style="margin-top:8px;font-size:15px;font-weight:600">${n}</p></div>`).join('')}</div>
  </div>${extra}
  <div style="position:absolute;left:0;right:0;bottom:0;height:86px;padding:8px 14px 0;background:rgba(249,249,249,.94);box-shadow:0 -1px 0 rgba(0,0,0,.08)">
    <div style="height:44px;border-radius:14px;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.12);display:flex;align-items:center;justify-content:space-between;padding:0 14px;font:500 16px -apple-system,system-ui;color:#000"><span style="font-size:15px">aA</span><span>mapleandrye.com</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.2" stroke-linecap="round"><path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5"/></svg></div>
  </div>
</div>`
document.querySelectorAll('[data-mr]').forEach(el => { el.innerHTML = (el.dataset.mr === 'desktop' ? mrDesktop : mrMobile)(el.innerHTML) })

document.querySelectorAll('.phone').forEach(p => {
  const light = p.dataset.status === 'light'
  const inner = p.innerHTML
  p.innerHTML = `<i class="key a"></i><i class="key u"></i><i class="key d"></i><i class="key p"></i><i class="key c"></i>
  <div class="bezel"><div class="screen" style="background:${p.dataset.bg || '#fff'}">
    <div class="island"></div>
    <div class="status${light ? ' light' : ''}"><span>${p.dataset.time || '9:41'}</span><span class="icons">${SIGNAL}${WIFI}${BATT}</span></div>
    ${inner}
    ${p.dataset.nohome === undefined ? `<div class="homebar${light ? ' light' : ''}"></div>` : ''}
  </div></div>`
})
