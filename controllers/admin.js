const Product = require("../models/product");
// const { getDB } = require("../util/database");

exports.getProducts = (req, res, next) => {
  console.log(req.session.user);
  Product.find({userId: req.session.user._id})
    .select('title price description imageUrl _id userId')
    .then(products => {
      console.log(products);
        res.render('admin/product-list', {
          prods: products,
          docTitle: 'Admin Products',
          path: '/admin/products',
          isLoggedIn: req.session.isLoggedIn,
          loggedInUser: req.session.user
        });
    })
    .catch(err => {
        console.log(err);
    });;
  
};


exports.getAddProduct = (req, res, next) => { 
    console.log('add product form');
  // res.sendFile(path.join(rootDir, 'views', 'add-product.html'));
  res.render('admin/add-product', {docTitle: 'Add Product', path: '/admin/add-product', isLoggedIn: req.session.isLoggedIn});
};

exports.postAddProduct = (req, res, next) => {
    const sentToken = req.body._csrf;
    const sessionToken = req.session.csrfToken;

    if (!sentToken || sentToken !== sessionToken) {
        return res.status(403).send("Invalid CSRF token");
    }
    const product = new Product({
        title: req.body.name, 
        price: req.body.price, 
        description: req.body.description, 
        imageUrl: req.body.imageUrl,
        userId: req.session.user._id
    });
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
      {product: product, docTitle: 'Edit Product', path:'admin/products', isLoggedIn: req.session.isLoggedIn});
  }).catch(err => console.log(err));
};

exports.postUpdateProduct = (req, res, next) => {
    console.log('Product updated:', req.body);
    // const product = new Product(req.body.name, req.body.price, req.body.description, req.body.imageUrl);
    const id = req.body.id;
    Product.findById(id).then(product => {
        if(product.userId.toString() !== req.session.user._id.toString()){
          return res.redirect('/admin/products');
        }
        product.title = req.body.name, 
        product.price = req.body.price, 
        product.description = req.body.description, 
        product.imageUrl = req.body.imageUrl
      
      return product.save();
    })
    .then(res => console.log('record updated.'))
    .catch(err => console.log(err));
    res.redirect('/admin/products');
};

exports.postDeleteProduct = (req, res, next) => {
  console.log('product delete ', req.params);
  const id = req.params.productId;
  Product.findByIdAndDelete(id)
  .then(() => {
    res.redirect('/admin/products');
  })
  .catch(err => console.log(err));
  
  // Cart.delete(id, product.price);
  
}
