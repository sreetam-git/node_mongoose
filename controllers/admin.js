// const Product = require('../models/product');
// const Cart = require('../models/cart');
const Product = require("../models/product");
const { getDB } = require("../util/database");

exports.getProducts = (req, res, next) => {
  Product.fetchAll().then(products => {
        res.render('admin/product-list', {
          prods: products,
          docTitle: 'Admin Products',
          path: '/admin/products'
        });
    })
    .catch(err => {
        console.log(err);
    });;
  
};


exports.getAddProduct = (req, res, next) => { 
  // res.sendFile(path.join(rootDir, 'views', 'add-product.html'));
  res.render('admin/add-product', {docTitle: 'Add Product', path: '/admin/add-product'});
};

exports.postAddProduct = (req, res, next) => {
    console.log('Product added:', req.body);
    console.log('user object: ', req.user);
    const product = new Product(req.body.name, req.body.price, req.body.description, req.body.imageUrl, null, req.user._id)
    product.save().then((result) => {
      console.log(result);
      res.redirect('/admin/products');
    }).catch(err => {
      console.log(err);
    });
    
};

exports.getEditProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product.findById(productId).then(product => {
    if (!product) {
        return res.status(404).render('404', { docTitle: 'Product Not Found', path: '/404' });
    }
    res.render('admin/edit-product', 
      {product: product, docTitle: 'Edit Product', path:'admin/products'});
  }).catch(err => console.log(err));
};

exports.postUpdateProduct = (req, res, next) => {
    console.log('Product updated:', req.body);
    // const product = new Product(req.body.name, req.body.price, req.body.description, req.body.imageUrl);
    const id = req.body.id;
    Product.findById(id).then(result => {
      // product.title = req.body.name;
      // product.price = req.body.price;
      // product.description = req.body.description;
      // product.imageUrl = req.body.imageUrl;
      const product = new Product(req.body.name, req.body.price, req.body.description, req.body.imageUrl, id)
      return product.save();
    })
    .then(res => console.log('record updated.'))
    .catch(err => console.log(err));
    res.redirect('/products');
};

exports.postDeleteProduct = (req, res, next) => {
  console.log('product delete ', req.params);
  const id = req.params.productId;
  Product.findById(id).then(product => {
    return Product.deleteById(id);
  })
  .then(() => {
    res.redirect('/admin/products');
  })
  .catch(err => console.log(err));
  
  // Cart.delete(id, product.price);
  
}
