const stored = localStorage.getItem('eligibilityResult');
const banner = document.getElementById('resultBanner');
const list = document.getElementById('resultsList');

if (!stored) {
  banner.textContent = 'No eligibility check found. Please fill the form first.';
  banner.style.background = '#fdecea';
  banner.style.color = '#a52a1a';
} else {
  const result = JSON.parse(stored);

  if (result.eligible_count > 0) {
    banner.textContent = `Great! You are eligible for ${result.eligible_count} scheme(s)`;
  } else {
    banner.textContent = 'No matching schemes found based on your details.';
    banner.style.background = '#fdecea';
    banner.style.color = '#a52a1a';
  }

  list.innerHTML = result.schemes.map(scheme => `
  <div class="result-card">
    <div class="result-info">
      <h3>${scheme.title}</h3>
      <p>${scheme.description}</p>
      <span class="benefit-tag">${scheme.benefit_amount}</span>
    </div>
    <div style="display: flex; gap: 8px;">
      <a href="scheme-details.html?id=${scheme.id}" class="view-btn">View Details</a>
      <a href="${scheme.official_url || '#'}" target="_blank" class="view-btn" style="background:#1a7a3c;">Apply</a>
    </div>
  </div>
`).join('');
}