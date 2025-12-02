const user = require('../models/user');

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

exports.postLogout = async (req, res, next) => {
    await req.session.destroy();
    res.redirect('/');
};