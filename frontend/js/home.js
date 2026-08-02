const API_BASE = 'https://sgsp-backend.onrender.com/api';

async function loadCategories() {
  try {
    const res = await fetch(`${API_BASE}/schemes/categories`);
    const categories = await res.json();

    const grid = document.getElementById('categoryGrid');
    grid.innerHTML = categories.map(cat => `
      <div class="category-card">
        <h3>${cat.name}</h3>
        <a href="schemes.html?category=${cat.id}">Explore →</a>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to load categories:', err);
  }
}

loadCategories();
// Search functionality
const searchInput = document.querySelector('.search-box input');
const searchBtn = document.querySelector('.search-box button');

function performSearch() {
  const term = searchInput.value.trim();
  if (term) {
    window.location.href = `schemes.html?search=${encodeURIComponent(term)}`;
  } else {
    window.location.href = 'schemes.html';
  }
}

searchBtn.addEventListener('click', performSearch);

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    performSearch();
  }
});