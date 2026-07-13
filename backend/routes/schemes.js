const express = require('express');
const router = express.Router();
const schemeController = require('../controllers/schemeController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/', schemeController.getAllSchemes);
router.get('/categories', schemeController.getCategories);
router.get('/:id/documents', schemeController.getSchemeDocuments);
router.get('/:id', schemeController.getSchemeById);

// Protected routes - admin only
router.post('/', verifyToken, schemeController.createScheme);
router.put('/:id', verifyToken, schemeController.updateScheme);
router.delete('/:id', verifyToken, schemeController.deleteScheme);

module.exports = router;