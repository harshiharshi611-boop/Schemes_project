const db = require('../config/db');

exports.getAllSchemes = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT schemes.*, categories.name AS category_name
      FROM schemes
      JOIN categories ON schemes.category_id = categories.id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSchemeById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT schemes.*, categories.name AS category_name
      FROM schemes
      JOIN categories ON schemes.category_id = categories.id
      WHERE schemes.id = $1
    `, [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Scheme not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM categories');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSchemeDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT document_name FROM required_documents WHERE scheme_id = $1', [id]);
    res.json(result.rows.map(r => r.document_name));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createScheme = async (req, res) => {
  try {
    const {
      title, category_id, description, benefit_amount, income_limit,
      department, official_url, application_mode, eligibility_criteria,
      key_benefits, documents
    } = req.body;

    if (!title || !category_id) {
      return res.status(400).json({ error: 'Title and category are required' });
    }

    const result = await db.query(`
      INSERT INTO schemes 
      (title, category_id, description, benefit_amount, income_limit, department, official_url, application_mode, eligibility_criteria, key_benefits)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING id
    `, [title, category_id, description, benefit_amount, income_limit || null, department, official_url, application_mode, eligibility_criteria, key_benefits]);

    const schemeId = result.rows[0].id;

    if (documents && documents.length > 0) {
      for (const doc of documents.filter(d => d.trim() !== '')) {
        await db.query('INSERT INTO required_documents (scheme_id, document_name) VALUES ($1, $2)', [schemeId, doc.trim()]);
      }
    }

    res.json({ message: 'Scheme created successfully', id: schemeId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateScheme = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, category_id, description, benefit_amount, income_limit,
      department, official_url, application_mode, eligibility_criteria,
      key_benefits, documents
    } = req.body;

    const existingResult = await db.query('SELECT * FROM schemes WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) return res.status(404).json({ error: 'Scheme not found' });
    const existing = existingResult.rows[0];

    const final = {
      title: title || existing.title,
      category_id: category_id || existing.category_id,
      description: description || existing.description,
      benefit_amount: benefit_amount || existing.benefit_amount,
      income_limit: income_limit || existing.income_limit,
      department: department || existing.department,
      official_url: official_url || existing.official_url,
      application_mode: application_mode || existing.application_mode,
      eligibility_criteria: eligibility_criteria || existing.eligibility_criteria,
      key_benefits: key_benefits || existing.key_benefits
    };

    await db.query(`
      UPDATE schemes
      SET title=$1, category_id=$2, description=$3, benefit_amount=$4, income_limit=$5,
          department=$6, official_url=$7, application_mode=$8, eligibility_criteria=$9, key_benefits=$10
      WHERE id=$11
    `, [final.title, final.category_id, final.description, final.benefit_amount, final.income_limit,
        final.department, final.official_url, final.application_mode, final.eligibility_criteria, final.key_benefits, id]);

    if (documents && documents.length > 0) {
      await db.query('DELETE FROM required_documents WHERE scheme_id = $1', [id]);
      for (const doc of documents.filter(d => d.trim() !== '')) {
        await db.query('INSERT INTO required_documents (scheme_id, document_name) VALUES ($1, $2)', [id, doc.trim()]);
      }
    }

    res.json({ message: 'Scheme updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteScheme = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM required_documents WHERE scheme_id = $1', [id]);
    const result = await db.query('DELETE FROM schemes WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Scheme not found' });
    res.json({ message: 'Scheme deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};