// helpers comunes de los gráficos del news (estilo El Atlas; todo literal, sin var())
const NS = 'http://www.w3.org/2000/svg';
const SANS = '"Source Sans 3", sans-serif', SERIF = '"Source Serif 4", Georgia, serif';
const C = { bg: '#FAF8F3', ink: '#1A1A1A', soft: '#4A4A4A', muted: '#8A8579', rule: '#E0DCC8', grid: '#ECE7D8', acc: '#BE5D32',
  lula: '#C8372D', bolso: '#234B85', lulaC: '#E8B4AE', bolsoC: '#AEBDD6', otros: '#B9B3A6' };
function el(tag, attrs, parent, text) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (text != null) e.textContent = text;
  if (parent) parent.appendChild(e);
  return e;
}
const LOC = window.LANG === 'en' ? 'en-US' : 'es-AR';
const fmt = (x, d = 1) => x.toLocaleString(LOC, { minimumFractionDigits: d, maximumFractionDigits: d });
const sg = (x, d = 1) => { const r = Math.round(x * 10 ** d) / 10 ** d; return (r > 0 ? '+' : r < 0 ? '−' : '') + fmt(Math.abs(r), d); };
function T(parent, x, y, str, o = {}) {
  let st = `font-family:${o.serif ? SERIF : SANS};font-size:${o.size || 22}px;font-weight:${o.w || 400};fill:${o.fill || C.ink};`;
  if (o.italic) st += 'font-style:italic;';
  if (o.halo) st += `paint-order:stroke;stroke:${o.haloCol || C.bg};stroke-width:${o.halo}px;stroke-linejoin:round;`;
  if (o.ls) st += `letter-spacing:${o.ls}px;`;
  return el('text', { x, y, 'text-anchor': o.anchor || 'start', style: st }, parent, str);
}
function lienzo() {
  const box = document.getElementById('plot');
  const W = box.clientWidth, H = box.clientHeight;
  const svg = el('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, xmlns: NS }, box);
  return { svg, W, H };
}
function mix(a, b, t) {
  const h = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)), A = h(a), B = h(b);
  return '#' + A.map((x, i) => Math.round(x + (B[i] - x) * t).toString(16).padStart(2, '0')).join('');
}
function listo(fn) { (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { fn(); document.body.setAttribute('data-listo', '1'); }); }

// ---- versión web: tooltips, escala al ancho de la pantalla ----
const LBL = window.LANG === 'en'
  ? { q: 'Quintile', gano: 'incumbent party won', perdio: 'incumbent party lost', brasil: 'Brazil', otros: 'Other candidates' }
  : { q: 'Quintil', gano: 'ganó el oficialismo', perdio: 'perdió el oficialismo', brasil: 'Brasil', otros: 'Demás candidatos' };
function tip(elm, html) { if (elm) elm.setAttribute('data-tip', html); return elm; }
if (window.WEB) {
  const ajustar = () => {
    const m = document.querySelector('.marco'); if (!m) return;
    const l = m.firstElementChild, W = l.offsetWidth, H = l.offsetHeight;
    // en la compu: que entre entero en la pantalla y a un tamaño de lectura (tope 62%); en el celu: al ancho
    const s = Math.min(0.62, (document.documentElement.clientWidth - 24) / W, Math.max(0.3, (innerHeight - 130) / H));
    l.style.transform = `scale(${s})`; m.style.width = W * s + 'px'; m.style.height = H * s + 'px';
    document.querySelectorAll('.barra, .acciones').forEach(e => { e.style.maxWidth = Math.max(300, W * s) + 'px'; });
  };
  addEventListener('resize', ajustar); addEventListener('load', ajustar); document.addEventListener('DOMContentLoaded', ajustar);
  const caja = document.createElement('div'); caja.className = 'tooltip';
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(caja));
  const mostrar = (t, x, y) => {
    const html = t.getAttribute('data-tip') || (window.tipC && window.tipC(t.getAttribute('data-c')));
    if (!html) { caja.style.display = 'none'; return; }
    caja.innerHTML = html; caja.style.display = 'block';
    const w = caja.offsetWidth, h = caja.offsetHeight, vw = document.documentElement.clientWidth, vh = innerHeight;
    caja.style.left = Math.max(8, Math.min(vw - w - 8, x + 14)) + 'px';
    caja.style.top = (y + 14 + h > vh ? y - h - 14 : y + 14) + 'px';
  };
  const buscar = e => e.target.closest && e.target.closest('[data-tip],[data-c]');
  document.addEventListener('mousemove', e => { const t = buscar(e); if (t) mostrar(t, e.clientX, e.clientY); else caja.style.display = 'none'; });
  document.addEventListener('touchstart', e => { const t = buscar(e), p = e.touches[0]; if (t && p) mostrar(t, p.clientX, p.clientY); else caja.style.display = 'none'; }, { passive: true });
}
