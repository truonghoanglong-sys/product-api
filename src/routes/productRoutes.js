const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productController');

router.post('/', ctrl.createProduct);
router.get('/', ctrl.getProducts);
router.get('/:pid', ctrl.getProductById);
router.put('/:pid', ctrl.updateProduct);
router.delete('/:pid', ctrl.deleteProduct);

module.exports = router;