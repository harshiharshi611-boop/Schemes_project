const API_BASE = 'http://localhost:5000/api';
const token = localStorage.getItem('token');

if (!token) {
  alert('Please login first');
  window.location.href = 'login.html';
}

let categories = [];

async function loadCategories() {
  const res = await fetch(`${API_BASE}/schemes/categories`);
  categories = await res.json();
  const select = document.getElementById('categoryId');
  select.innerHTML = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

async function loadSchemes() {
  const res = await fetch(`${API_BASE}/schemes`);
  const schemes = await res.json();
  const tbody = document.getElementById('schemeTableBody');

  tbody.innerHTML = schemes.map(s => `
    <tr>
      <td>${s.title}</td>
      <td>${s.category_name}</td>
      <td>${s.benefit_amount || '-'}</td>
      <td>${s.income_limit ? '₹' + s.income_limit : 'No limit'}</td>
      <td>
        <button class="action-btn edit-btn" onclick='editScheme(${JSON.stringify(s)})'>Edit</button>
        <button class="action-btn delete-btn" onclick="deleteScheme(${s.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

function openModal() {
  document.getElementById('modalTitle').textContent = 'Add New Scheme';
  document.getElementById('schemeForm').reset();
  document.getElementById('schemeId').value = '';
  document.getElementById('modalOverlay').classList.add('active');
}
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
}
async function editScheme(scheme) {
  document.getElementById('modalTitle').textContent = 'Edit Scheme';
  document.getElementById('schemeId').value = scheme.id;
  document.getElementById('title').value = scheme.title;
  document.getElementById('categoryId').value = scheme.category_id;
  document.getElementById('description').value = scheme.description || '';
  document.getElementById('benefitAmount').value = scheme.benefit_amount || '';
  document.getElementById('incomeLimit').value = scheme.income_limit || '';
  document.getElementById('department').value = scheme.department || '';
  document.getElementById('officialUrl').value = scheme.official_url || '';
  document.getElementById('applicationMode').value = scheme.application_mode || 'Online';
  document.getElementById('eligibilityCriteria').value = scheme.eligibility_criteria || '';
  document.getElementById('keyBenefits').value = scheme.key_benefits || '';

  // fetch existing documents for this scheme
  try {
    const res = await fetch(`${API_BASE}/schemes/${scheme.id}/documents`);
    const docs = await res.json();
    document.getElementById('requiredDocuments').value = docs.join('\n');
  } catch (err) {
    document.getElementById('requiredDocuments').value = '';
  }

  document.getElementById('modalOverlay').classList.add('active');
}

document.getElementById('schemeForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('schemeId').value;
  const documentsText = document.getElementById('requiredDocuments').value;
  const documents = documentsText.split('\n').map(d => d.trim()).filter(d => d !== '');

  const payload = {
    title: document.getElementById('title').value,
    category_id: document.getElementById('categoryId').value,
    description: document.getElementById('description').value,
    benefit_amount: document.getElementById('benefitAmount').value,
    income_limit: document.getElementById('incomeLimit').value || null,
    department: document.getElementById('department').value,
    official_url: document.getElementById('officialUrl').value,
    application_mode: document.getElementById('applicationMode').value,
    eligibility_criteria: document.getElementById('eligibilityCriteria').value,
    key_benefits: document.getElementById('keyBenefits').value,
    documents: documents
  };

  const url = id ? `${API_BASE}/schemes/${id}` : `${API_BASE}/schemes`;
  const method = id ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error);

    closeModal();
    loadSchemes();
  } catch (err) {
    alert('Failed to save scheme');
  }
});

async function deleteScheme(id) {
  if (!confirm('Are you sure you want to delete this scheme?')) return;

  try {
    const res = await fetch(`${API_BASE}/schemes/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error);
    loadSchemes();
  } catch (err) {
    alert('Failed to delete scheme');
  }
}

document.getElementById('schemeForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('schemeId').value;
  const payload = {
    title: document.getElementById('title').value,
    category_id: document.getElementById('categoryId').value,
    description: document.getElementById('description').value,
    benefit_amount: document.getElementById('benefitAmount').value,
    income_limit: document.getElementById('incomeLimit').value || null,
    department: document.getElementById('department').value
  };

  const url = id ? `${API_BASE}/schemes/${id}` : `${API_BASE}/schemes`;
  const method = id ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error);

    closeModal();
    loadSchemes();
  } catch (err) {
    alert('Failed to save scheme');
  }
});

loadCategories().then(loadSchemes);