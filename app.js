// =============================================
// PIZZA HOUSE — app.js
// =============================================
gsap.registerPlugin(ScrollTrigger);

// STATE
let cart = [], branch = 'sanblas', resBranch = 'sanblas';
const B = {
  sanblas: { name:'San Blas — Grill & Drinks', phone:'593939975551', short:'San Blas' },
  canaris: { name:'Los Cañaris — Solo Pizzas', phone:'593968893847', short:'Los Cañaris' }
};
let pb = { size:'mediana', base:6, salsa:'Italiana Original', borde:'Normal', bordExtra:0, ingr:[] };
const IPP = { mediana:1.40, familiar:1.80, gigante:2.50 };

// ── CURSOR ─────────────────────────────────
const cur = document.getElementById('cur'), curf = document.getElementById('curf');
let mx=0, my=0, fx=0, fy=0;
document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; cur.style.left=mx+'px'; cur.style.top=my+'px'; });
(function anim(){ fx+=(mx-fx)*.12; fy+=(my-fy)*.12; curf.style.left=fx+'px'; curf.style.top=fy+'px'; requestAnimationFrame(anim); })();
document.querySelectorAll('button,a,.mi,.bc,.pc,.cc,.hi,.kc,.bi,.konoc').forEach(el=>{
  el.addEventListener('mouseenter', ()=>curf.classList.add('big'));
  el.addEventListener('mouseleave', ()=>curf.classList.remove('big'));
});

// ── NAV SCROLL ─────────────────────────────
window.addEventListener('scroll', ()=>document.getElementById('nav').classList.toggle('sc', scrollY>50));

// ── GSAP HERO ──────────────────────────────
const tl = gsap.timeline({ delay:.2 });
tl.to('#hEye',  { opacity:1, y:0, duration:.8, ease:'power3.out' })
  .to('#hTitle', { opacity:1, y:0, duration:1,  ease:'power3.out' }, '-=.4')
  .to('#hDesc',  { opacity:1, y:0, duration:.8, ease:'power3.out' }, '-=.5')
  .to('#hBtns',  { opacity:1, y:0, duration:.8, ease:'power3.out' }, '-=.4')
  .to('#hScroll',{ opacity:1, duration:.6 }, '-=.2');

// Scroll animations
gsap.utils.toArray('.fu').forEach(el=>{
  gsap.to(el,{ opacity:1, y:0, duration:.9, ease:'power3.out', scrollTrigger:{ trigger:el, start:'top 85%' }});
});
gsap.utils.toArray('.bc').forEach((c,i)=>{
  gsap.from(c,{ opacity:0, x:i?60:-60, duration:1, ease:'power3.out', scrollTrigger:{ trigger:c, start:'top 80%' }});
});
gsap.utils.toArray('.pc').forEach((c,i)=>{
  gsap.from(c,{ opacity:0, y:40, duration:.7, delay:i*.12, ease:'power3.out', scrollTrigger:{ trigger:c, start:'top 85%' }});
});

// ── SIZE SELECTORS ─────────────────────────
document.addEventListener('click', e=>{
  const sz = e.target.closest('.szb');
  if(!sz) return;
  sz.closest('.ssel').querySelectorAll('.szb').forEach(b=>b.classList.remove('on'));
  sz.classList.add('on');
  const sd = sz.closest('.mi,.hi,[data-name]')?.querySelector('.szd');
  if(sd) sd.textContent = sz.dataset.price;
});

// ── BRANCH ─────────────────────────────────
function setBranch(b) {
  branch = b;
  document.getElementById('togSB').classList.toggle('on', b==='sanblas');
  document.getElementById('togC').classList.toggle('on', b==='canaris');
  const pOnly = ['pizzas','combos','kono-menu','ninos','bebidas','postres'];
  document.getElementById('mnav').querySelectorAll('.mb').forEach(btn=>{
    const cat = btn.getAttribute('onclick').match(/'([^']+)'/)[1];
    btn.style.display = b==='canaris' ? (pOnly.includes(cat)?'':'none') : '';
  });
  document.getElementById('cBrN').textContent = B[b].name;
  document.getElementById('waTip').textContent = b==='sanblas' ? 'San Blas: +593 93 997 5551' : 'Cañaris: +593 96 889 3847';
  if(b==='canaris') showCat('pizzas'); else showCat('snacks');
}

// ── CATEGORY ───────────────────────────────
function showCat(cat) {
  document.querySelectorAll('.mpanel').forEach(p=>p.classList.remove('on'));
  document.querySelectorAll('.mb').forEach(b=>b.classList.remove('on'));
  const p = document.getElementById('p-'+cat);
  if(p) p.classList.add('on');
  document.querySelectorAll('.mb').forEach(b=>{ if(b.getAttribute('onclick').includes("'"+cat+"'")) b.classList.add('on'); });
  gsap.fromTo('.mpanel.on .mi,.mpanel.on .hi,.mpanel.on .cc,.mpanel.on .kc,.mpanel.on .bi,.mpanel.on .konoc',
    { opacity:0, y:14 }, { opacity:1, y:0, duration:.4, stagger:.04, ease:'power2.out' });
}

// ── BEBIDAS TABS ───────────────────────────
function showBeb(tab) {
  document.querySelectorAll('.btab').forEach(t=>t.classList.remove('on'));
  document.querySelectorAll('.bpanel').forEach(p=>p.classList.remove('on'));
  event.target.classList.add('on');
  document.getElementById('bp-'+tab).classList.add('on');
}

// ── ADD TO CART ────────────────────────────
function addSz(btn) {
  const mi = btn.closest('[data-name]');
  const sz = mi.querySelector('.szb.on');
  const price = parseFloat(sz ? sz.dataset.price : mi.dataset.price||0);
  const lbl = sz ? (sz.dataset.label || sz.textContent.split(' ')[0]) : '';
  addItem(lbl ? `${mi.dataset.name} (${lbl})` : mi.dataset.name, price, mi.dataset.desc||'');
  popBtn(btn);
}
function addIt(btn) {
  const el = btn.closest('[data-name]');
  if(!el) return;
  const name = el.dataset.name || el.querySelector('.mi-name,.hi-name,.cc-name,.bi-name,.konoc-name')?.textContent.replace(/\n/g,' ') || 'Item';
  addItem(name, parseFloat(el.dataset.price||0), el.dataset.desc||'');
  popBtn(btn);
}
function addSimple(btn) {
  const el = btn.closest('[data-name]');
  addItem(el.dataset.name, parseFloat(el.dataset.price), el.dataset.desc||'');
  popBtn(btn);
}
function addItem(name, price, desc) {
  const ex = cart.find(i=>i.name===name);
  if(ex) ex.qty++; else cart.push({ name, price, desc, qty:1 });
  updateCart();
  showToast('🔥 ' + name.substring(0,30) + ' agregado');
}
function popBtn(btn) {
  btn.classList.add('pop');
  setTimeout(()=>btn.classList.remove('pop'), 350);
}

// ── PIZZA BUILDER ──────────────────────────
function pbSel(type, btn) {
  if(type==='size') {
    btn.closest('.pb-sizes').querySelectorAll('.pbsz').forEach(b=>b.classList.remove('on'));
    btn.classList.add('on');
    pb.size = btn.dataset.size; pb.base = parseFloat(btn.dataset.base);
    document.getElementById('ippu').textContent = '$'+(IPP[pb.size]||1.40)+' c/u';
  } else if(type==='salsa') {
    btn.closest('.pb-opts').querySelectorAll('.pbo').forEach(b=>b.classList.remove('on'));
    btn.classList.add('on'); pb.salsa = btn.textContent;
  } else if(type==='borde') {
    btn.closest('.pb-opts').querySelectorAll('.pbo').forEach(b=>b.classList.remove('on'));
    btn.classList.add('on'); pb.borde = btn.textContent.split(' ')[0]; pb.bordExtra = parseFloat(btn.dataset.extra||0);
  }
  calcPB();
}
function pbIngr(btn) {
  btn.classList.toggle('on');
  const n = btn.textContent;
  if(btn.classList.contains('on')) pb.ingr.push(n); else pb.ingr = pb.ingr.filter(i=>i!==n);
  calcPB();
}
function calcPB() {
  const ppu = IPP[pb.size]||1.40;
  document.getElementById('pbTot').textContent = '$'+(pb.base + pb.ingr.length*ppu + pb.bordExtra).toFixed(2);
}
function addPB() {
  const ppu = IPP[pb.size]||1.40;
  const tot = pb.base + pb.ingr.length*ppu + pb.bordExtra;
  const desc = pb.ingr.length ? pb.ingr.join(', ') : 'Sin ingredientes extra';
  addItem(`Pizza ${pb.size} · ${pb.salsa} · ${pb.borde}`, tot, desc);
}

// ── CART UI ────────────────────────────────
function updateCart() {
  const tot = cart.reduce((s,i)=>s+i.price*i.qty, 0);
  const cnt = cart.reduce((s,i)=>s+i.qty, 0);
  const badge = document.getElementById('cbadge');
  badge.textContent = cnt; badge.classList.toggle('on', cnt>0);
  document.getElementById('cTot').textContent = '$'+tot.toFixed(2);
  const box = document.getElementById('cIts');
  box.querySelectorAll('.ci').forEach(e=>e.remove());
  document.getElementById('cEmp').style.display = cart.length ? 'none' : 'block';
  cart.forEach((item,idx)=>{
    const d = document.createElement('div'); d.className = 'ci';
    d.innerHTML = `<div class="ci-info"><h4>${item.name}</h4><p>${item.desc}</p></div>
    <div class="ci-r">
      <span class="cip">$${(item.price*item.qty).toFixed(2)}</span>
      <div class="cqty">
        <button class="qb" onclick="cQty(${idx},-1)">−</button>
        <span class="qn">${item.qty}</span>
        <button class="qb" onclick="cQty(${idx},1)">+</button>
      </div>
    </div>`;
    box.appendChild(d);
  });
}
function cQty(i,d) { cart[i].qty+=d; if(cart[i].qty<=0) cart.splice(i,1); updateCart(); }
function openCart() { document.getElementById('cOv').classList.add('on'); document.getElementById('cDr').classList.add('on'); document.body.style.overflow='hidden'; }
function closeCart() { document.getElementById('cOv').classList.remove('on'); document.getElementById('cDr').classList.remove('on'); document.body.style.overflow=''; }

// ── WHATSAPP ───────────────────────────────
function sendWA() {
  if(!cart.length) { showToast('⚠️ Agrega productos primero'); return; }
  const b = B[branch];
  const notes = document.getElementById('cNotes').value;
  const tot = cart.reduce((s,i)=>s+i.price*i.qty, 0);
  let msg = `🔥 *PEDIDO — Pizza House ${b.short}*\n\n`;
  cart.forEach(i=>{ msg += `• ${i.qty}x ${i.name} — $${(i.price*i.qty).toFixed(2)}\n`; });
  msg += `\n*TOTAL: $${tot.toFixed(2)}*`;
  if(notes) msg += `\n\n📝 ${notes}`;
  msg += `\n\n_pizzahouse.ec_`;
  window.open(`https://wa.me/${b.phone}?text=${encodeURIComponent(msg)}`, '_blank');
}
function quickWA() {
  const b = B[branch];
  window.open(`https://wa.me/${b.phone}?text=${encodeURIComponent('Hola, quisiera hacer un pedido 🍕 ('+b.short+')')}`, '_blank');
}

// ── RESERVATION ────────────────────────────
function setRes(b) {
  resBranch = b;
  document.getElementById('resSB').classList.toggle('on', b==='sanblas');
  document.getElementById('resC').classList.toggle('on', b==='canaris');
}
function sendRes() {
  const name=document.getElementById('rName').value, phone=document.getElementById('rPhone').value,
        date=document.getElementById('rDate').value, time=document.getElementById('rTime').value,
        pax=document.getElementById('rPax').value;
  if(!name||!date||!time||!pax) { showToast('⚠️ Completa todos los campos'); return; }
  const b = B[resBranch];
  const df = new Date(date+'T12:00').toLocaleDateString('es-EC',{ weekday:'long', year:'numeric', month:'long', day:'numeric' });
  let msg = `🍽️ *RESERVA — Pizza House ${b.short}*\n\n👤 ${name}\n📱 ${phone}\n📅 ${df}\n🕐 ${time}\n👥 ${pax}\n\n_pizzahouse.ec_`;
  window.open(`https://wa.me/${b.phone}?text=${encodeURIComponent(msg)}`, '_blank');
}

// ── TOAST ──────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 2600);
}

// ── INIT ───────────────────────────────────
setBranch('sanblas');
calcPB();
