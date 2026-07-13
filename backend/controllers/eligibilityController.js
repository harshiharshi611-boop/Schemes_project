const db = require('../config/db');

exports.checkEligibility = (req, res) => {
  const { category, annual_income } = req.body;

  if (!category) {
    return res.status(400).json({ error: 'Category is required' });
  }

  // Find schemes matching the user's category (via category name)
  // and where income is under the scheme's income_limit (or no limit set)
  const query = `
    SELECT schemes.*, categories.name AS category_name
    FROM schemes
    JOIN categories ON schemes.category_id = categories.id
    WHERE categories.name = ?
    AND (schemes.income_limit IS NULL OR schemes.income_limit >= ?)
  `;

  db.query(query, [category, annual_income || 0], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      eligible_count: results.length,
      schemes: results
    });
  });
};