const db = require('../config/db');

// Get all schemes with category name
exports.getAllSchemes = (req, res) => {
  const query = `
    SELECT schemes.*, categories.name AS category_name
    FROM schemes
    JOIN categories ON schemes.category_id = categories.id
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Get single scheme details by ID
exports.getSchemeById = (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT schemes.*, categories.name AS category_name
    FROM schemes
    JOIN categories ON schemes.category_id = categories.id
    WHERE schemes.id = ?
  `;
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Scheme not found' });
    res.json(results[0]);
  });
};

// Get all categories
exports.getCategories = (req, res) => {
  db.query('SELECT * FROM categories', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Get required documents for a scheme
exports.getSchemeDocuments = (req, res) => {
  const { id } = req.params;
  db.query('SELECT document_name FROM required_documents WHERE scheme_id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results.map(r => r.document_name));
  });
};

// Add new scheme
exports.createScheme = (req, res) => {
  const {
    title, category_id, description, benefit_amount, income_limit,
    department, official_url, application_mode, eligibility_criteria,
    key_benefits, documents
  } = req.body;

  if (!title || !category_id) {
    return res.status(400).json({ error: 'Title and category are required' });
  }

  const query = `
    INSERT INTO schemes 
    (title, category_id, description, benefit_amount, income_limit, department, official_url, application_mode, eligibility_criteria, key_benefits)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    title, category_id, description, benefit_amount, income_limit || null,
    department, official_url, application_mode, eligibility_criteria, key_benefits
  ];

  db.query(query, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    const schemeId = result.insertId;

    if (documents && documents.length > 0) {
      const docValues = documents.filter(d => d.trim() !== '').map(doc => [schemeId, doc.trim()]);
      if (docValues.length > 0) {
        db.query('INSERT INTO required_documents (scheme_id, document_name) VALUES ?', [docValues], (err) => {
          if (err) console.error('Failed to insert documents:', err.message);
        });
      }
    }

    res.json({ message: 'Scheme created successfully', id: schemeId });
  });
};

// Update scheme
exports.updateScheme = (req, res) => {
  const { id } = req.params;
  const {
    title, category_id, description, benefit_amount, income_limit,
    department, official_url, application_mode, eligibility_criteria,
    key_benefits, documents
  } = req.body;

  db.query('SELECT * FROM schemes WHERE id = ?', [id], (err, existingResults) => {
    if (err) return res.status(500).json({ error: err.message });
    if (existingResults.length === 0) return res.status(404).json({ error: 'Scheme not found' });

    const existing = existingResults[0];

    const finalValues = {
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

    const query = `
      UPDATE schemes
      SET title = ?, category_id = ?, description = ?, benefit_amount = ?, income_limit = ?, 
          department = ?, official_url = ?, application_mode = ?, eligibility_criteria = ?, key_benefits = ?
      WHERE id = ?
    `;
    const values = [
      finalValues.title, finalValues.category_id, finalValues.description, finalValues.benefit_amount,
      finalValues.income_limit, finalValues.department, finalValues.official_url,
      finalValues.application_mode, finalValues.eligibility_criteria, finalValues.key_benefits, id
    ];

    db.query(query, values, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      if (documents && documents.length > 0) {
        db.query('DELETE FROM required_documents WHERE scheme_id = ?', [id], (err) => {
          if (err) console.error('Failed to clear old documents:', err.message);

          const docValues = documents.filter(d => d.trim() !== '').map(doc => [id, doc.trim()]);
          if (docValues.length > 0) {
            db.query('INSERT INTO required_documents (scheme_id, document_name) VALUES ?', [docValues], (err) => {
              if (err) console.error('Failed to insert documents:', err.message);
            });
          }
        });
      }

      res.json({ message: 'Scheme updated successfully' });
    });
  });
};

// Delete scheme
exports.deleteScheme = (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM required_documents WHERE scheme_id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    db.query('DELETE FROM schemes WHERE id = ?', [id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Scheme not found' });
      res.json({ message: 'Scheme deleted successfully' });
    });
  });
};