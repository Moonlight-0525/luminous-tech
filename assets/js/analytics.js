// ── LUMINOUS TECH — ANALYTICS ──

async function loadAnalytics() {
  try {
    const bookings = await dbQuery('bookings');
    const data = bookings || [];

    // ── CORE STATS ──
    const completed  = data.filter(b => b.status === 'completed');
    const revenue    = completed.reduce((sum, b) => sum + Number(b.quote_amount || 0), 0);
    const customers  = new Set(data.map(b => cleanPhone(b.phone))).size;

    document.getElementById('an-revenue').textContent   = formatMoney(revenue);
    document.getElementById('an-jobs').textContent      = completed.length;
    document.getElementById('an-customers').textContent = customers;

    // ── AVERAGE RATING ──
    try {
      const reviews = await dbQuery('reviews', { filters: '&approved=eq.true' });
      if (reviews && reviews.length) {
        const avg = reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length;
        document.getElementById('an-rating').textContent = avg.toFixed(1) + ' ⭐';
      } else {
        document.getElementById('an-rating').textContent = '—';
      }
    } catch { document.getElementById('an-rating').textContent = '—'; }

    // ── TOP REPAIR TYPES ──
    renderTopList(
      data,
      'repair_type',
      'topRepairs',
      '🔧',
      'var(--accent)'
    );

    // ── TOP LOCATIONS ──
    renderTopList(
      data,
      'notes',
      'topLocations',
      '📍',
      'var(--green)'
    );

  } catch (e) {
    showToast('Failed to load analytics', 'error');
  }
}

// ── RENDER TOP LIST ──
function renderTopList(data, field, containerId, icon, color) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // count occurrences
  const counts = {};
  data.forEach(b => {
    const val = (b[field] || '').trim();
    if (!val) return;
    counts[val] = (counts[val] || 0) + 1;
  });

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  if (!sorted.length) {
    container.innerHTML = `<p class="text-muted" style="font-size:0.85rem;">No data yet.</p>`;
    return;
  }

  const max = sorted[0][1];

  container.innerHTML = sorted.map(([label, count], i) => {
    const pct = Math.round((count / max) * 100);
    return `
      <div style="margin-bottom:0.9rem;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.35rem;">
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <span>${icon}</span>
            <span style="font-size:0.85rem;font-weight:600;color:var(--text);">${esc(label)}</span>
          </div>
          <span style="font-family:var(--mono);font-size:0.8rem;color:var(--muted);">
            ${count} job${count > 1 ? 's' : ''}
          </span>
        </div>
        <div style="height:6px;background:var(--border);border-radius:999px;overflow:hidden;">
          <div style="
            height:100%;
            width:${pct}%;
            background:${color};
            border-radius:999px;
            transition:width 0.6s ease;
          "></div>
        </div>
      </div>
    `;
  }).join('');
}