const API_BASE = 'http://localhost:5000/api';
let allSchemes = [];

async function loadSchemes() {
  try {
    const res = await fetch(`${API_BASE}/schemes`);
    allSchemes = await res.json();
    applyFiltersFromURL();
  } catch (err) {
    document.getElementById('schemeGrid').innerHTML = '<p>Failed to load schemes. Is the backend running?</p>';
    console.error(err);
  }
}

function renderSchemes(schemes) {
  const grid = document.getElementById('schemeGrid');
  if (schemes.length === 0) {
    grid.innerHTML = '<p>No schemes found.</p>';
    return;
  }

  grid.innerHTML = schemes.map(scheme => `
    <div class="scheme-card">
      <span class="tag">${scheme.category_name}</span>
      <h3>${scheme.title}</h3>
      <p>${scheme.description}</p>
      <div class="benefit">${scheme.benefit_amount}</div>
      <a href="scheme-details.html?id=${scheme.id}" class="view-btn">View Details</a>
    </div>
  `).join('');
}

function applyFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);
  const categoryId = params.get('category');
  const searchTerm = params.get('search');

  let filtered = allSchemes;

  if (categoryId) {
    filtered = filtered.filter(s => String(s.category_id) === String(categoryId));
  }

  if (searchTerm) {
    document.getElementById('searchInput').value = searchTerm;
    filtered = filtered.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }

  renderSchemes(filtered);
}

document.getElementById('searchInput').addEventListener('input', (e) => {
  const term = e.target.value.toLowerCase();
  const params = new URLSearchParams(window.location.search);
  const categoryId = params.get('category');

  let filtered = allSchemes;
  if (categoryId) {
    filtered = filtered.filter(s => String(s.category_id) === String(categoryId));
  }
  filtered = filtered.filter(s => s.title.toLowerCase().includes(term));
  renderSchemes(filtered);
});

loadSchemes();