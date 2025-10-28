const Product = require('../models/product');
const Cart = require('../models/cart');
const { where } = require('sequelize');

exports.getIndex = (req, res, next) => {
    Product.fetchAll()
    .then(products => {
        res.render('shop/index', { prods: products, docTitle: 'Shop', path: '/' });
    })
    .catch(err => {
        console.log(err);
    });
    
}

exports.getProducts = (req, res, next) => {
    // console.log('Products in shop:', products);
    // res.sendFile(path.join(__dirname, '../', 'views', 'shop.html'));
    Product.fetchAll()
    .then(products => {
        res.render('shop/product-list', { prods: products, docTitle: 'Shop', path: '/home' });
    })
    .catch(err => {
        console.log(err);
    });
    
};

exports.getProductDetails = (req, res, next) => {
    const productId = req.params.productId;
    Product.findById(productId).then(product => {
        console.log(product);
        res.render('shop/product-details', { product: product, docTitle: 'Product Details', path: '/products' });
    }).catch(err => console.log(err));
   
}

exports.postAddToCart = async (req, res, next) => {
  try {
    const productId = req.body.productId;

    // Wait for product to load
    Product.findById(productId).then( product => {
        // Add item to user's cart
        console.log('single product:',product);
        const result = Cart.addItem(req.user._id, product);
        if(result){
            res.redirect('/cart');
        }
    })
    .catch(err => console.log(err));
    
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong while adding to cart");
  }
};



exports.getCart = async (req, res, next) => {
    const cart = await Cart.getCart(req.user._id);
    res.render('shop/cart', { docTitle: 'Cart', path: '/cart', cart: cart });
}

exports.postDeleteCartProduct = (req, res, next) => {
    const productId = req.body.productId;
    const result = Cart.removeItem(req.user._id, productId);
    if(result){
        res.redirect('/cart');
    }
    
}

exports.postOrder = (req, res, next) => {
    let fetchedCart;
    req.user.getCart()
    .then(cart => {
        fetchedCart = cart;
        return cart.getProducts();
    })
    .then(products => {
        return req.user.createOrder()
        .then(order => {
            return order.addProducts(
                products.map(product => {
                  product.orderItem = { quantity: product.cartItem.quantity }; 
                  return product; 
                })
            );
        })
        .catch(err => console.log(err));
    })
    .then(result => {
        return fetchedCart.setProducts(null);
    })
    .then(result => {
        res.redirect('/orders');
    })
    .catch(err => console.log(err));
}

exports.getOrders = (req, res, next) => {
    req.user.getOrders({include: ['products']})
    .then(orders => {
        res.render('shop/orders', { docTitle: 'Orders', path: '/orders', orders: orders });
    })
    .catch(err => console.log(err));
    
}