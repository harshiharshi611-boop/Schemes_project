const db = require('../config/db');

exports.checkEligibility = async (req, res) => {
  try {
    const { category, annual_income } = req.body;
    if (!category) return res.status(400).json({ error: 'Category is required' });

    const result = await db.query(`
      SELECT schemes.*, categories.name AS category_name
      FROM schemes
      JOIN categories ON schemes.category_id = categories.id
      WHERE categories.name = $1
      AND (schemes.income_limit IS NULL OR schemes.income_limit >= $2)
    `, [category, annual_income || 0]);

    res.json({ eligible_count: result.rows.length, schemes: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};