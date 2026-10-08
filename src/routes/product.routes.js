const express = require('express');
const controller = require('../controllers/product.controller');

const router = express.Router();

router.post('/', controller.createProduct);
router.get('/', controller.getProducts);
router.get('/:pid', controller.getProductByPid);
router.put('/:pid', controller.updateProduct);
router.delete('/:pid', controller.deleteProduct);

module.exports = router;
