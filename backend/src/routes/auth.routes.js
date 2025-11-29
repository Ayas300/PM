const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);
router.post('/forgot-password/request', authCtrl.requestForgotPassword);
router.post('/forgot-password/verify', authCtrl.verifyForgotPassword);

// show-password OTP (protected)
router.post('/show-password/request', authMiddleware, authCtrl.requestShowPasswordOTP);
router.post('/show-password/verify', authMiddleware, authCtrl.verifyShowPasswordOTP);

module.exports = router;
