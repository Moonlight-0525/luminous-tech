// ── LUMINOUS TECH — INVENTORY ──
let allParts = [];

// ── LOAD INVENTORY ──
async function loadInventory() {
  try {
    const data = await dbQuery('inventory', {
      order: 'category.asc,name.asc'
    });
    allParts = data || [];
    renderInventory();
  } catch (e) {
    showToast('Failed to load inventory', 'error');
  }
}

// ── RENDER ──
function renderInventory() {
  const container = document.getElementById('inventoryGrid');
  if (!container) return;

  if (!allParts.length) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <div class="empty-state-icon">📦</div>
        <p>No parts yet. Add your first part.</p>
      </div>`;
    return;
  }

  container.innerHTML = allParts.map(p => {
    const isLow  = p.quantity <= p.min_quantity;
    const pct    = Math.min(100, Math.round((p.quantity / Math.max(p.min_quantity * 3, 1)) * 100));
    const level  = p.quantity === 0 ? 'low' : isLow ? 'medium' : 'ok';
    const color  = p.quantity === 0 ? 'var(--red)' : isLow ? 'var(--yellow)' : 'var(--green)';

    return `
      <div class="inventory-card ${isLow ? 'border-yellow' : ''}">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:0.5rem;">
          <div>
            <div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:0.9rem;color:var(--text);line-height:1.2;">
              ${esc(p.name)}
            </div>
            <div style="font-size:0.72rem;color:var(--muted);margin-top:0.2rem;">
              ${esc(p.device || '—')} · ${esc(p.category || '—')}
            </div>
          </div>
          <span style="font-size:0.65rem;font-weight:700;padding:0.2rem 0.5rem;border-radius:999px;background:rgba(255,255,255,0.05);color:var(--muted);white-space:nowrap;">
            ${esc(p.category)}
          </span>
        </div>

        <div class="stock-level ${level}">${p.quantity}</div>

        <div class="stock-bar">
          <div class="stock-bar-fill" style="width:${pct}%;background:${color};"></div>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div style="font-size:0.72rem;color:var(--muted);">
            ${isLow ? `⚠️ Low stock` : `✅ In stock`}
            · min ${p.min_quantity}
          </div>
          ${p.cost_price ? `<div style="font-family:var(--mono);font-size:0.78rem;color:var(--muted);">${formatMoney(p.cost_price)}</div>` : ''}
        </div>

        <div style="display:flex;gap:0.4rem;margin-top:0.25rem;">
          <button class="btn btn-secondary btn-sm" style="flex:1;"
            onclick="adjustStock('${p.id}', ${p.quantity}, -1)">− Use</button>
          <button class="btn btn-primary btn-sm" style="flex:1;"
            onclick="adjustStock('${p.id}', ${p.quantity}, 1)">+ Restock</button>
        </div>
      </div>
    `;
  }).join('');
}

// ── ADJUST STOCK ──
async function adjustStock(id, current, change) {
  const newQty = Math.max(0, current + change);
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/inventory?id=eq.${id}`, {
      method: 'PATCH',
      headers: { ...HEADERS, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ quantity: newQty })
    });
    const idx = allParts.findIndex(p => p.id === id);
    if (idx > -1) allParts[idx].quantity = newQty;
    renderInventory();
    showToast(change > 0 ? '📦 Stock added' : '🔧 Part used');
  } catch (e) {
    showToast('Failed to update stock', 'error');
  }
}

// ── ADD PART MODAL ──
function openAddPartModal() {
  openModal('addPartModal');
}

async function submitPart() {
  const name   = document.getElementById('part-name').value.trim();
  const device = document.getElementById('part-device').value.trim();
  const cat    = document.getElementById('part-category').value;
  const qty    = parseInt(document.getElementById('part-qty').value) || 0;
  const cost   = parseFloat(document.getElementById('part-cost').value) || 0;
  const min    = parseInt(document.getElementById('part-min').value) || 2;

  if (!name) {
    showToast('⚠️ Please enter a part name.', 'warning');
    return;
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/inventory`, {
      method: 'POST',
      headers: { ...HEADERS, 'Prefer': 'return=minimal' },
      body: JSON.stringify({
        name, device, category: cat,
        quantity: qty, cost_price: cost,
        min_quantity: min
      })
    });

    if (res.status === 201) {
      showToast('✅ Part added to inventory!');
      closeModal('addPartModal');
      // clear form
      document.getElementById('part-name').value   = '';
      document.getElementById('part-device').value = '';
      document.getElementById('part-qty').value    = 1;
      document.getElementById('part-cost').value   = 0;
      document.getElementById('part-min').value    = 2;
      loadInventory();
    } else {
      showToast('Failed to add part', 'error');
    }
  } catch (e) {
    showToast('Failed to add part', 'error');
  }
}