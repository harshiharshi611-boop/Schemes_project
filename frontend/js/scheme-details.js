const API_BASE = 'http://localhost:5000/api';

// Get scheme id from URL like scheme-details.html?id=1
const params = new URLSearchParams(window.location.search);
const schemeId = params.get('id');

async function loadSchemeDetails() {
  const card = document.getElementById('detailsCard');

  if (!schemeId) {
    card.innerHTML = '<p>No scheme selected.</p>';
    return;
  }

  try {
    const [schemeRes, docsRes] = await Promise.all([
      fetch(`${API_BASE}/schemes/${schemeId}`),
      fetch(`${API_BASE}/schemes/${schemeId}/documents`)
    ]);

    const scheme = await schemeRes.json();
    const documents = await docsRes.json();

    if (scheme.message === 'Scheme not found') {
      card.innerHTML = '<p>Scheme not found.</p>';
      return;
    }

    card.innerHTML = `
  <span class="tag">${scheme.category_name}</span>
  <h1>${scheme.title}</h1>
  <p>${scheme.description}</p>

  <div class="info-grid">
    <div class="info-box">
      <span>Department</span>
      <strong>${scheme.department || 'N/A'}</strong>
    </div>
    <div class="info-box">
      <span>Benefit Amount</span>
      <strong>${scheme.benefit_amount}</strong>
    </div>
    <div class="info-box">
      <span>Income Limit</span>
      <strong>${scheme.income_limit ? '₹' + scheme.income_limit : 'No limit'}</strong>
    </div>
    <div class="info-box">
      <span>Application Mode</span>
      <strong>${scheme.application_mode || 'N/A'}</strong>
    </div>
  </div>

  ${scheme.eligibility_criteria ? `
    <div class="section-title">Eligibility Criteria</div>
    <ul class="doc-list">
      ${scheme.eligibility_criteria.split('\n').filter(l => l.trim()).map(line => `<li>${line}</li>`).join('')}
    </ul>
  ` : ''}

  ${scheme.key_benefits ? `
    <div class="section-title">Key Benefits</div>
    <ul class="doc-list">
      ${scheme.key_benefits.split('\n').filter(l => l.trim()).map(line => `<li>${line}</li>`).join('')}
    </ul>
  ` : ''}

  <div class="section-title">Required Documents</div>
  <ul class="doc-list">
    ${documents.map(doc => `<li>${doc}</li>`).join('')}
  </ul>

  <div style="display: flex; gap: 12px; margin-top: 25px;">
    <a href="eligibility.html" class="apply-btn" style="background:#2b6cb0;">Check Eligibility</a>
    <a href="${scheme.official_url || '#'}" target="_blank" class="apply-btn" style="background:#1a7a3c;">Apply Now</a>
  </div>
`;
  } catch (err) {
    card.innerHTML = '<p>Failed to load scheme details.</p>';
    console.error(err);
  }
}

loadSchemeDetails();