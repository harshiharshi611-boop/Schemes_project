const token = localStorage.getItem('token');
const admin = JSON.parse(localStorage.getItem('admin'));

if (!token || !admin) {
  alert('Please login first');
  window.location.href = 'login.html';
} else {
  document.getElementById('welcomeText').textContent = `Welcome, ${admin.username}!`;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('admin');
  window.location.href = 'login.html';
}