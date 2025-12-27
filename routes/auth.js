const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const csrf = require('../middleware/csrf');
const { body } = require('express-validator');

router.get('/login', authController.getLogin);
router.post('/login', 
    [
        body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required.')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail(),

        body('password')
        .trim()
        .notEmpty()
        .withMessage('Password is required.')
    ],
    authController.postLogin);
router.post('/logout', authController.postLogout);
router.get('/signup', authController.getSignup);
router.post('/signup',
    [
        body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({min: 3})
        .withMessage('Name must be atleast 3 characters'),

        body('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail(),

        body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({min: 6})
        .withMessage('Password must be atleast 6 characters')
        .isAlphanumeric()
        .withMessage('Password must contain only letters and numbers'),

        body('rePassword')
        .custom((value, {req}) => {
            if(value !== req.body.password){
                return new Error('Password does not match');
            }
            return true;
        })
    ],
     authController.postSignup
    );
router.get('/reset-password', authController.getResetPassword);
router.post('/reset-password', authController.postResetPassword);
// router.post('/new-password', authController.getNewPassword);
router.get('/reset-password/:token', csrf, authController.getNewPassword);
router.post('/change-password', authController.postChangePassword);

module.exports = router;