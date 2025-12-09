const user = require('../models/user');
const bcrypt = require('bcryptjs')

exports.getLogin = (req, res, next) => {
    // console.log(req.get('Cookie'));
    console.log(req.session.isLoggedIn);
    res.render('auth/login', {
        docTitle: 'Login',
        path: '/login',
        isLoggedIn: req.session.isLoggedIn
    });
   
};

exports.postLogin = async (req, res, next) => {
    const userData = await user.findOne({email: req.body.email});
    if(userData){
        req.session.isLoggedIn = true;
        req.session.user = userData;
    }
    // res.setHeader('Set-Cookie', 'loggedIn=true');
    
    res.redirect('/');
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        docTitle: 'Signup',
        path: '/signup',
        isLoggedIn: req.session.isLoggedIn
    });
   
};

exports.postSignup = async (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const rePassword = req.body.rePassword;

    const userExists = await user.findOne({email:email});
    
    if(userExists){
        console.log('user exists');
        res.redirect('/signup');
    }else{
        console.log('new user');
        const hashPassword = await bcrypt.hash(password, 12);
        const userRecord = new user({
            name: name,
            email: email,
            password: hashPassword
        });
        userRecord.save();
        res.redirect('/login');
    }
};

exports.postLogout = async (req, res, next) => {
    await req.session.destroy();
    res.redirect('/');
};