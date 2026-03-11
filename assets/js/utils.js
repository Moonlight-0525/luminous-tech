// ── LUMINOUS TECH — UTILITIES ──
// Shared helper functions used across every page

// ── PHONE ──
function cleanPhone(phone) {
  let p = (phone || '').replace(/[\s\-().+]/g, '');
  if (p.startsWith('0')) p = '260' + p.slice(1);
  if (p.length <= 9 && /^[79]/.test(p)) p = '260' + p;
  return p;
}

// ── MONEY ──
function formatMoney(amount) {
  if (!amount && amount !== 0) return '—';
  return 'K ' + Number(amount).toLocaleString('en-ZM', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}

// ── DATES ──
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-ZM', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-ZM', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

// ── STRINGS ──
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function initials(name) {
  if (!name) return '?';
  return name.trim().split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ── STATUS BADGES ──
const STATUS_COLORS = {
  pending:   { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b' },
  quoted:    { bg: 'rgba(99,102,241,0.15)',   color: '#6366f1' },
  accepted:  { bg: 'rgba(16,185,129,0.15)',   color: '#10b981' },
  declined:  { bg: 'rgba(239,68,68,0.15)',    color: '#ef4444' },
  paid:      { bg: 'rgba(6,182,212,0.15)',    color: '#06b6d4' },
  completed: { bg: 'rgba(34,197,94,0.15)',    color: '#22c55e' },
  cancelled: { bg: 'rgba(107,114,128,0.15)', color: '#6b7280' }
};

function statusBadge(status) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return `<span style="
    background:${s.bg};
    color:${s.color};
    padding:0.25rem 0.75rem;
    border-radius:999px;
    font-size:0.72rem;
    font-weight:700;
    letter-spacing:0.05em;
    text-transform:uppercase;
  ">${status || 'pending'}</span>`;
}

// ── TOAST NOTIFICATIONS ──
function showToast(msg, type = 'success') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  const bg = type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#10b981';
  toast.style.cssText = `
    position:fixed; bottom:1.5rem; left:50%; transform:translateX(-50%);
    background:${bg}; color:#fff; padding:0.8rem 1.5rem;
    border-radius:999px; font-weight:700; font-size:0.9rem;
    z-index:9999; box-shadow:0 4px 20px rgba(0,0,0,0.3);
    transition:opacity 0.3s; opacity:1;
  `;
  toast.textContent = msg;
  toast.style.display = 'block';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.style.display = 'none', 300); }, 3000);
}

// ── WHATSAPP ──
function sendWhatsApp(phone, message) {
  const clean = cleanPhone(phone);
  window.open('https://wa.me/' + clean + '?text=' + encodeURIComponent(message), '_blank');
}