// ── LUMINOUS TECH — AUTH ──
const ADMIN_PASSWORD = 'luminous2025';

function checkAuth() {
  const authed = sessionStorage.getItem('lt_admin');
  if (authed === 'true') {
    showApp();
  }
}

function doLogin() {
  const val = document.getElementById('passwordInput').value;
  const err = document.getElementById('loginError');

  if (!val) {
    err.textContent = 'Please enter your password.';
    err.style.display = 'block';
    return;
  }

  if (val === ADMIN_PASSWORD) {
    sessionStorage.setItem('lt_admin', 'true');
    err.style.display = 'none';
    showApp();
  } else {
    err.textContent = '❌ Wrong password. Try again.';
    err.style.display = 'block';
    document.getElementById('passwordInput').value = '';
    document.getElementById('passwordInput').focus();
  }
}

function doLogout() {
  sessionStorage.removeItem('lt_admin');
  document.getElementById('adminApp').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('passwordInput').value = '';
}

function showApp() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminApp').style.display = 'block';
  loadDashboard();
}