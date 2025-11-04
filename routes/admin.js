const express = require('express');
const path = require('path');
const router = express.Router();
const rootDir = require('../util/path');
const adminController = require('../controllers/admin');

// router.get('/products', adminController.getProducts);
// router.get('/add-product', adminController.getAddProduct);
// router.get('/edit-product/:productId', adminController.getEditProduct);
// router.post('/product', adminController.postAddProduct);
// router.post('/update-product', adminController.postUpdateProduct);
// router.post('/delete-product/:productId', adminController.postDeleteProduct);

// exports.routes = router;
// exports.products = products;

module.exports = router;