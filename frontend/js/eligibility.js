const API_BASE = 'http://localhost:5000/api';

document.getElementById('eligibilityForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    full_name: document.getElementById('fullName').value,
    mobile: document.getElementById('mobile').value,
    gender: document.getElementById('gender').value,
    state: document.getElementById('state').value,
    category: document.getElementById('category').value,
    annual_income: document.getElementById('income').value || 0
  };

  if (!data.category) {
    alert('Please select a category');
    return;
  }

  // Save the data temporarily so the results page can use it
  localStorage.setItem('eligibilityData', JSON.stringify(data));

  try {
    const res = await fetch(`${API_BASE}/eligibility/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: data.category,
        annual_income: data.annual_income
      })
    });

    const result = await res.json();
    localStorage.setItem('eligibilityResult', JSON.stringify(result));
    window.location.href = 'results.html';
  } catch (err) {
    alert('Failed to check eligibility. Make sure the backend server is running.');
    console.error(err);
  }
});