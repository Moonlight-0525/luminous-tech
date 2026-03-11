// ── LUMINOUS TECH — BOOKINGS ──
let allBookings = [];
let currentFilter = 'all';

// ── LOAD DASHBOARD ──
async function loadDashboard() {
  try {
    const data = await dbQuery('bookings');
    allBookings = data || [];

    const pending   = allBookings.filter(b => b.status === 'pending').length;
    const completed = allBookings.filter(b => b.status === 'completed').length;
    const revenue   = allBookings
      .filter(b => b.status === 'completed' && b.quote_amount)
      .reduce((sum, b) => sum + Number(b.quote_amount), 0);

    document.getElementById('stat-pending').textContent   = pending;
    document.getElementById('stat-total').textContent     = allBookings.length;
    document.getElementById('stat-completed').textContent = completed;
    document.getElementById('stat-revenue').textContent   = formatMoney(revenue);

    renderBookingCards(allBookings.slice(0, 5), 'recentBookingsList');

  } catch (e) {
    showToast('Failed to load dashboard', 'error');
  }
}

// ── LOAD ALL BOOKINGS ──
async function loadBookings() {
  try {
    const data = await dbQuery('bookings');
    allBookings = data || [];
    updateFilterCounts();
    applyFilter();
  } catch (e) {
    showToast('Failed to load bookings', 'error');
  }
}

// ── FILTER ──
function setFilter(filter, el) {
  currentFilter = filter;
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
  applyFilter();
}

function applyFilter() {
  const search = document.getElementById('bookingSearch')?.value?.toLowerCase() || '';
  let filtered = currentFilter === 'all'
    ? allBookings
    : allBookings.filter(b => b.status === currentFilter);

  if (search) {
    filtered = filtered.filter(b =>
      (b.name || '').toLowerCase().includes(search) ||
      (b.phone || '').toLowerCase().includes(search) ||
      (b.device || '').toLowerCase().includes(search) ||
      (b.repair_type || '').toLowerCase().includes(search) ||
      (b.notes || '').toLowerCase().includes(search)
    );
  }

  renderBookingCards(filtered, 'bookingsList');
}

function filterBookings(val) {
  applyFilter();
}

function updateFilterCounts() {
  const counts = {
    all:       allBookings.length,
    pending:   allBookings.filter(b => b.status === 'pending').length,
    quoted:    allBookings.filter(b => b.status === 'quoted').length,
    accepted:  allBookings.filter(b => b.status === 'accepted').length,
    paid:      allBookings.filter(b => b.status === 'paid').length,
    completed: allBookings.filter(b => b.status === 'completed').length,
    cancelled: allBookings.filter(b => b.status === 'cancelled').length,
  };
  Object.keys(counts).forEach(k => {
    const el = document.getElementById('fc-' + k);
    if (el) el.textContent = counts[k];
  });
}

// ── RENDER BOOKING CARDS ──
function renderBookingCards(bookings, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!bookings.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <p>No bookings found</p>
      </div>`;
    return;
  }

  container.innerHTML = bookings.map(b => `
    <div class="booking-card ${b.status || 'pending'}" onclick="viewBooking('${b.id}')">
      <div class="booking-card-top">
        <div>
          <div class="booking-customer-name">${esc(b.name || '—')}</div>
          <div class="booking-device">${esc(b.device || '—')} · ${esc(b.repair_type || '—')}</div>
        </div>
        <div>${statusBadge(b.status)}</div>
      </div>
      <div class="booking-card-meta">
        ${b.notes ? `<span class="booking-meta-item location">📍 ${esc(b.notes)}</span>` : ''}
        <span class="booking-meta-item">📅 ${formatDate(b.preferred_date)}</span>
        <span class="booking-meta-item">🕐 ${timeAgo(b.created_at)}</span>
        ${b.quote_amount ? `<span class="booking-meta-item" style="color:var(--green);font-weight:700;">💰 ${formatMoney(b.quote_amount)}</span>` : ''}
      </div>
      <div class="booking-card-actions" onclick="event.stopPropagation()">
        <button class="btn btn-wa btn-sm"
          onclick="sendWhatsApp('${b.phone}','Hi ${esc(b.name)}! 👋 This is LuminOus Tech following up on your repair booking.')">
          💬 WhatsApp
        </button>
        ${b.status === 'pending' || b.status === 'accepted' ? `
        <button class="btn btn-primary btn-sm" onclick="openQuoteModal('${b.id}')">
          Quote →
        </button>` : ''}
        ${b.status !== 'completed' && b.status !== 'cancelled' ? `
        <button class="btn btn-success btn-sm" onclick="updateStatus('${b.id}','completed')">
          ✅ Done
        </button>` : ''}
      </div>
    </div>
  `).join('');
}

// ── VIEW BOOKING ──
function viewBooking(id) {
  const b = allBookings.find(x => x.id === id);
  if (!b) return;

  document.getElementById('viewModalBody').innerHTML = `
    <div class="detail-grid">
      <div class="detail-item">
        <div class="detail-label">Name</div>
        <div class="detail-value">${esc(b.name || '—')}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Phone</div>
        <div class="detail-value text-accent text-mono">${esc(b.phone || '—')}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Email</div>
        <div class="detail-value">${esc(b.email || '—')}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Status</div>
        <div class="detail-value">${statusBadge(b.status)}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Device</div>
        <div class="detail-value">${esc(b.device || '—')}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Repair Type</div>
        <div class="detail-value">${esc(b.repair_type || '—')}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Preferred Date</div>
        <div class="detail-value">${formatDate(b.preferred_date)}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Preferred Time</div>
        <div class="detail-value">${esc(b.preferred_time || '—')}</div>
      </div>
      ${b.notes ? `
      <div class="detail-item full">
        <div class="detail-label">📍 Location</div>
        <div class="detail-value">${esc(b.notes)}</div>
      </div>` : ''}
      ${b.description ? `
      <div class="detail-item full">
        <div class="detail-label">🔧 Issue Description</div>
        <div class="detail-value">${esc(b.description)}</div>
      </div>` : ''}
      ${b.quote_amount ? `
      <div class="detail-item full">
        <div class="detail-label">💰 Quote Sent</div>
        <div class="detail-value text-green font-800">${formatMoney(b.quote_amount)}</div>
      </div>` : ''}
      <div class="detail-item full">
        <div class="detail-label">Submitted</div>
        <div class="detail-value text-mono" style="font-size:0.8rem;">${formatDateTime(b.created_at)}</div>
      </div>
    </div>
  `;

  document.getElementById('viewModalQuoteBtn').onclick = () => {
    closeModal('viewModal');
    openQuoteModal(id);
  };
  openModal('viewModal');
}

// ── QUOTE MODAL ──
function openQuoteModal(id) {
  const b = allBookings.find(x => x.id === id);
  if (!b) return;

  document.getElementById('q-booking-id').value  = id;
  document.getElementById('q-name').value        = b.name || '';
  document.getElementById('q-phone').value       = b.phone || '';
  document.getElementById('q-device').value      = b.device || '';
  document.getElementById('q-issue').value       = b.repair_type || '';
  document.getElementById('q-email').value       = b.email || '';
  document.getElementById('q-total-input').value = 0;
  document.getElementById('q-total').textContent = 'K 0';
  document.getElementById('q-notes').value       = '';

  const d = new Date();
  d.setDate(d.getDate() + 3);
  document.getElementById('q-valid').value = d.toISOString().split('T')[0];

  document.querySelector('input[name="sendVia"][value="whatsapp"]').checked = true;
  updateSendOption();

  openModal('quoteModal');
}

function updateTotal() {
  const total = parseFloat(document.getElementById('q-total-input').value) || 0;
  document.getElementById('q-total').textContent = formatMoney(total);
}

function updateSendOption() {
  const via      = document.querySelector('input[name="sendVia"]:checked').value;
  const waOpt    = document.getElementById('opt-wa');
  const emailOpt = document.getElementById('opt-email');
  if (via === 'whatsapp') {
    waOpt.className    = 'send-via-option selected-wa';
    emailOpt.className = 'send-via-option';
  } else {
    emailOpt.className = 'send-via-option selected-email';
    waOpt.className    = 'send-via-option';
  }
}

async function submitQuote() {
  const bookingId     = document.getElementById('q-booking-id').value;
  const customerTotal = parseFloat(document.getElementById('q-total-input').value) || 0;

  if (customerTotal <= 0) {
    showToast('⚠️ Please enter a price.', 'warning');
    return;
  }

  try {
    const quoteRes = await fetch(SUPABASE_URL + '/rest/v1/quotations', {
      method: 'POST',
      headers: { ...HEADERS, 'Prefer': 'return=minimal' },
      body: JSON.stringify({
        booking_id:     bookingId,
        customer_name:  document.getElementById('q-name').value,
        customer_phone: document.getElementById('q-phone').value,
        customer_email: document.getElementById('q-email').value || null,
        device:         document.getElementById('q-device').value,
        issue:          document.getElementById('q-issue').value,
        parts_cost:     0,
        labour_cost:    customerTotal,
        total_amount:   customerTotal,
        valid_until:    document.getElementById('q-valid').value,
        notes:          document.getElementById('q-notes').value || null,
        status:         'sent'
      })
    });

    await fetch(`${SUPABASE_URL}/rest/v1/bookings?id=eq.${bookingId}`, {
      method: 'PATCH',
      headers: { ...HEADERS, 'Prefer': 'return=minimal' },
      body: JSON.stringify({
        status:        'quoted',
        quote_amount:  customerTotal,
        quote_sent_at: new Date().toISOString()
      })
    });

    if (quoteRes.status === 201) {
      const idx = allBookings.findIndex(b => b.id === bookingId);
      if (idx > -1) {
        allBookings[idx].status       = 'quoted';
        allBookings[idx].quote_amount = customerTotal;
      }

      showToast('✅ Quote saved!');
      closeModal('quoteModal');

      const name   = document.getElementById('q-name').value;
      const device = document.getElementById('q-device').value;
      const issue  = document.getElementById('q-issue').value;
      const notes  = document.getElementById('q-notes').value;
      const valid  = document.getElementById('q-valid').value;
      const phone  = document.getElementById('q-phone').value;
      const email  = document.getElementById('q-email').value;
      const via    = document.querySelector('input[name="sendVia"]:checked').value;
      const baseURL = window.location.origin;
      const confirmLink = `${baseURL}/public/confirm.html?id=${bookingId}`;
      const msg = `Hi ${name}! 👋\n\nThank you for choosing *LuminOus Tech*.\n\nHere is your quote for the *${issue}* on your *${device}*:\n\n✅ *Price: ${formatMoney(customerTotal)}*\n📅 Valid until: ${valid}${notes ? '\n\n📝 ' + notes : ''}\n\n👉 *Confirm your repair here:*\n${confirmLink}\n\nOr simply reply *YES* to confirm.\n\n— LuminOus Tech 🇿🇲`;      setTimeout(() => {
        if (via === 'whatsapp') {
          sendWhatsApp(phone, msg);
        } else {
          if (!email) { showToast('⚠️ No email on this booking', 'warning'); return; }
          const subject = encodeURIComponent('Your LuminOus Tech Repair Quote');
          const body    = encodeURIComponent(msg.replace(/\*/g, ''));
          window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
        }
      }, 400);

      loadDashboard();
    }
  } catch (e) {
    showToast('Failed to send quote', 'error');
  }
}

// ── UPDATE STATUS ──
async function updateStatus(id, status) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/bookings?id=eq.${id}`, {
      method: 'PATCH',
      headers: { ...HEADERS, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ status })
    });
    const idx = allBookings.findIndex(b => b.id === id);
    if (idx > -1) allBookings[idx].status = status;
    showToast('✅ Status updated to ' + status);
    applyFilter();
    loadDashboard();
  } catch (e) {
    showToast('Failed to update status', 'error');
  }
}