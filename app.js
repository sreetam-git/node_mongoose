const express = require('express');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const User = require('./models/user');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const errorController = require('./controllers/error');
const mongoose = require('mongoose');

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
  
});

app.use('/admin',adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);

mongoose.connect(
  'mongodb+srv://nsreetam_db_user:z94p3hAtTcV8k0l4@cluster0.gtinb2c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
)
.then(() => {
  console.log("✅ Mongoose Connected!");
  app.listen(3000);
})
.catch(err => console.log(err));

