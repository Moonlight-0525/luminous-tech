// ── LUMINOUS TECH — CUSTOMERS ──
let allCustomers = [];

// ── LOAD CUSTOMERS ──
// Built from bookings data — no separate table needed yet
async function loadCustomers() {
  try {
    const data = await dbQuery('bookings');
    allCustomers = buildCustomerProfiles(data || []);
    renderCustomers(allCustomers);
  } catch (e) {
    showToast('Failed to load customers', 'error');
  }
}

// ── BUILD PROFILES ──
// Groups all bookings by phone number into customer profiles
function buildCustomerProfiles(bookings) {
  const map = {};

  bookings.forEach(b => {
    const key = cleanPhone(b.phone || '');
    if (!key) return;

    if (!map[key]) {
      map[key] = {
        name:       b.name,
        phone:      b.phone,
        email:      b.email,
        location:   b.notes,
        bookings:   [],
        totalSpent: 0,
        firstSeen:  b.created_at,
        lastSeen:   b.created_at,
      };
    }

    map[key].bookings.push(b);
    if (b.status === 'completed' && b.quote_amount) {
      map[key].totalSpent += Number(b.quote_amount);
    }
    if (new Date(b.created_at) > new Date(map[key].lastSeen)) {
      map[key].lastSeen = b.created_at;
    }
  });

  // sort by last seen
  return Object.values(map).sort((a, b) =>
    new Date(b.lastSeen) - new Date(a.lastSeen)
  );
}

// ── RENDER ──
function renderCustomers(customers) {
  const container = document.getElementById('customersList');
  if (!container) return;

  if (!customers.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">👥</div>
        <p>No customers yet.</p>
      </div>`;
    return;
  }

  container.innerHTML = customers.map(c => {
    const completed  = c.bookings.filter(b => b.status === 'completed').length;
    const pending    = c.bookings.filter(b => b.status === 'pending').length;
    const isReturning = c.bookings.length > 1;

    return `
      <div class="booking-card" style="cursor:default;">
        <div class="booking-card-top">
          <div style="display:flex;align-items:center;gap:0.75rem;">
            <div style="
              width:42px;height:42px;border-radius:50%;
              background:linear-gradient(135deg,var(--accent),var(--accent2));
              display:flex;align-items:center;justify-content:center;
              font-family:'Outfit',sans-serif;font-weight:900;
              font-size:1rem;color:#000;flex-shrink:0;
            ">${initials(c.name)}</div>
            <div>
              <div class="booking-customer-name">${esc(c.name)}</div>
              <div class="booking-device text-mono" style="font-size:0.78rem;">
                ${esc(c.phone)}
              </div>
            </div>
          </div>
          ${isReturning ? `<span class="badge badge-accepted">⭐ Returning</span>` : ''}
        </div>

        <div class="booking-card-meta">
          ${c.location ? `<span class="booking-meta-item location">📍 ${esc(c.location)}</span>` : ''}
          <span class="booking-meta-item">🔧 ${c.bookings.length} booking${c.bookings.length > 1 ? 's' : ''}</span>
          <span class="booking-meta-item" style="color:var(--green);">✅ ${completed} completed</span>
          ${pending ? `<span class="booking-meta-item" style="color:var(--yellow);">⏳ ${pending} pending</span>` : ''}
          ${c.totalSpent > 0 ? `<span class="booking-meta-item" style="color:var(--green);font-weight:700;">💰 ${formatMoney(c.totalSpent)} spent</span>` : ''}
          <span class="booking-meta-item">Last seen ${timeAgo(c.lastSeen)}</span>
        </div>

        <div class="booking-card-actions">
          <button class="btn btn-wa btn-sm"
            onclick="sendWhatsApp('${c.phone}', 'Hi ${esc(c.name)}! 👋 This is LuminOus Tech. ')">
            💬 WhatsApp
          </button>
          ${c.email ? `
          <button class="btn btn-secondary btn-sm"
            onclick="window.open('mailto:${c.email}')">
            📧 Email
          </button>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// ── FILTER ──
function filterCustomers(val) {
  if (!val) {
    renderCustomers(allCustomers);
    return;
  }
  const q = val.toLowerCase();
  renderCustomers(allCustomers.filter(c =>
    (c.name || '').toLowerCase().includes(q) ||
    (c.phone || '').toLowerCase().includes(q) ||
    (c.location || '').toLowerCase().includes(q)
  ));
}