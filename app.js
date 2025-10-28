const express = require('express');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const User = require('./models/user');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const errorController = require('./controllers/error');
const { connectDB } = require('./util/database');

const bodyParser = require('body-parser');
const app = express();
let db;
app.set('view engine', 'ejs');
app.set('views', 'views'); 


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayouts);
app.set('layout', 'layouts/layout');

app.use((req, res, next) => {
  if (!db) {
    return res.status(503).send("⚠️ Database is not available right now. Please try again later.");
  }
  User.findById("68f05b189d66e5ed1ee8192d")
  .then(user => {
    // console.log('user found: ', user);
    req.user = user;
    next();
  })
  .catch(err => console.log(err));
});

app.use('/admin',adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);

async function startServer(){
    try{
        db = await connectDB();
        console.log('mongodb connected');
    }catch(err){
        console.error("❌ MongoDB connection failed. Server will still run.");
        console.log(err);
    }

    app.listen(3000, () => {
        console.log("🚀 Server running on port 3000");
    });
}

startServer();

