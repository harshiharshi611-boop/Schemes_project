const API_BASE = 'http://localhost:5000/api';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('loginError');
  errorEl.classList.add('hidden');

  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.error;
      errorEl.classList.remove('hidden');
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('admin', JSON.stringify(data.admin));
    window.location.href = 'dashboard.html';
  } catch (err) {
    errorEl.textContent = 'Something went wrong. Is the backend running?';
    errorEl.classList.remove('hidden');
  }
});