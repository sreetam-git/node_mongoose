const express = require('express');
const path = require('path');
const router = express.Router();
// const adminData = require('./admin');
const shopController = require('../controllers/shop');
const checkoutController = require('../controllers/checkout');

// router.get('/', shopController.getIndex);

// router.get('/products', shopController.getProducts);

// router.get('/products/:productId', shopController.getProductDetails);

// router.get('/cart', shopController.getCart);

// router.post('/cart/add', shopController.postAddToCart);

// router.post('/cart-order', checkoutController.postCheckout);

// router.get('/orders', shopController.getOrders);

// router.post('/cart/delete-product', shopController.postDeleteCartProduct);

module.exports = router;