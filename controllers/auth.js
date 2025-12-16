const user = require('../models/user');
const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');
const User = require('../models/user');
// require('dotenv').config();
sgMail.setApiKey('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');

exports.getLogin = (req, res, next) => {
    // console.log(req.get('Cookie'));
    console.log(req.session.isLoggedIn);
    let message = req.flash('error');
    if(message.length > 0){
        message = message[0];
    }else{
        message = null;
    }
    res.render('auth/login', {
        docTitle: 'Login',
        path: '/login',
        isLoggedIn: req.session.isLoggedIn,
        errorMessage: message
    });
   
};

exports.postLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // 1. Basic validation
        if (!email || !password) {
            req.flash("error", "Email and password are required");
            return res.redirect("/login");
        }

        // 2. Find user by email
        const userData = await user.findOne({ email });

        if (!userData) {
            req.flash("error", "User not found");
            return res.redirect("/login");
        }

        // 3. Compare password
        const isMatch = await bcrypt.compare(password, userData.password);

        if (!isMatch) {
            req.flash("error", "Incorrect password");
            return res.redirect("/login");
        }

        // 4. Create session
        req.session.isLoggedIn = true;
        req.session.user = userData;

        return res.redirect("/");

    } catch (error) {
        console.error(error);
        return res.redirect("/login");
    }
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
        //send mail to user
        const msg = {
            to: 'nsreetam@gmail.com',
            from: 'info@sreevanatech.com',
            subject: 'Welcome to E shop',
            text: 'Your registration is successful.',
            html: '<strong>Your registration is successful.</strong>',
        };

        await sgMail.send(msg);
        res.redirect('/login');
    }
};

exports.postLogout = async (req, res, next) => {
    await req.session.destroy();
    res.redirect('/');
};

exports.getResetPassword = async (req, res, next) => {
    let message = req.flash('error');
    if(message.length > 0){
        message = message[0];
    }else{
        message = null;
    }
    res.render('auth/reset-password', {
        docTitle: 'Reset Password',
        path: '/reset-password',
        isLoggedIn: req.session.isLoggedIn,
        errorMessage: message
    });
}

exports.postResetPassword = async (req, res, next) => {
    const email = req.body.email;
    if(email != ''){
        //send mail to user
        const token = crypto.randomBytes(32, (err, buffer) => {
            if (err) {
                console.log(err);
            }else{
                return buffer.toString('hex');
            }
        });
        const user = await User.findOne({email: email});
        if(user){
            user.forgotPasswordToken = token;
            user.tokenExpiry = Date.now() + 3600000;
            if(user.save()){
                 const msg = {
                    to: 'nsreetam@gmail.com',
                    from: 'info@sreevanatech.com',
                    subject: 'Password Reset',
                    html: `<strong>Please click the <a href="http://localhost:3000/reset-password/${token}">Link</a> to reset your password.</strong>`,
                };

                await sgMail.send(msg);
                req.flash('success', 'A password reset mail has been sent to your mail.');
                return res.redirect('/reset-password');
            }
        }else{
            req.flash('error', 'No account with that email found.');
            return res.redirect('/reset-password');
        }
    }
}