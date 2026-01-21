const express = require('express');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const User = require('./models/user');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const errorController = require('./controllers/error');
const mongoose = require('mongoose');
const flash = require('connect-flash');

const bodyParser = require('body-parser');
const multer = require('multer');
const app = express();
const store = new MongoDBStore({
  uri: 'mongodb+srv://nsreetam_db_user:z94p3hAtTcV8k0l4@cluster0.gtinb2c.mongodb.net/shop?retryWrites=true&w=majority&appName=Cluster0',
  collection: 'sessions'
})

//multer storage definition
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if(file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg"){
    cb(null,  true);
  }else{
    cb(null, false);
  }
};

app.set('view engine', 'ejs');
app.set('views', 'views'); 


app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images',express.static(path.join(__dirname, 'images')));

app.use(expressLayouts);
app.use(session({
  secret: 'node application',
  resave: false,
  saveUninitialized: false,
  store: store
}));
app.use(flash());

app.set('layout', 'layouts/layout');

// app.use(async(req, res, next) => {
//   const user = await User.findById('69231f2590a8e8e94b258366');
//   req.user = user;
//   next();
// });

app.use('/admin',adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);
// app.use((error, req, res, next) => {
//   res.redirect('admin/500');
// });

mongoose.connect(
  'mongodb+srv://nsreetam_db_user:z94p3hAtTcV8k0l4@cluster0.gtinb2c.mongodb.net/shop?retryWrites=true&w=majority&appName=Cluster0'
)
.then(() => {
  console.log("✅ Mongoose Connected!");
  // const user = new User({
  //   name: 'admin',
  //   email: 'admin@gmail.com'
  // });
  // user.save();
  app.listen(3000);
})
.catch(err => console.log(err));

