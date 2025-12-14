const express = require('express');
const path = require('path');
const router = express.Router();
const rootDir = require('../util/path');
const adminController = require('../controllers/admin');
const authMiddleware = require('../middleware/is-auth');
const csrf = require('../middleware/csrf');

router.get('/products', authMiddleware, adminController.getProducts);
router.get('/add-product', authMiddleware, csrf, adminController.getAddProduct);
router.get('/edit-product/:productId', authMiddleware, csrf,  adminController.getEditProduct);
router.post('/product', authMiddleware, adminController.postAddProduct);
router.post('/update-product', authMiddleware, csrf, adminController.postUpdateProduct);
router.post('/delete-product/:productId', authMiddleware, csrf, adminController.postDeleteProduct);

// exports.routes = router;
// exports.products = products;

module.exports = router;