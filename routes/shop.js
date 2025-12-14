const express = require('express');
const path = require('path');
const router = express.Router();
// const adminData = require('./admin');
const shopController = require('../controllers/shop');
const checkoutController = require('../controllers/checkout');
const authMiddleware = require('../middleware/is-auth');

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProductDetails);

router.get('/cart', authMiddleware, shopController.getCart);

router.post('/cart/add', authMiddleware, shopController.postAddToCart);

router.post('/cart-order', authMiddleware, checkoutController.postCheckout);

// router.get('/orders', shopController.getOrders);

router.post('/cart/delete-product', authMiddleware, shopController.postDeleteCartProduct);

module.exports = router;