const express = require('express');
const userRegController = require('../controllers/auth/userRegController');
const userLoginController = require('../controllers/auth/userLoginController');
const userLogoutController = require('../controllers/auth/userLogoutController');
const userResetPasswordController = require('../controllers/auth/userResetPasswordController');
const emailVerifyController = require('../controllers/auth/emailVerifyController');
const meController = require('../controllers/auth/meController');
const { refresh, requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', userRegController);
router.post('/login', userLoginController);
router.post('/logout', requireAuth, userLogoutController);
router.post('/refresh', refresh);
router.post('/password-reset', userResetPasswordController.resetPassword);
router.post('/password-reset/:confirm_token', userResetPasswordController.confirmToken);
router.post('/verify-email/send', emailVerifyController.sendVerification);
router.post('/verify-email/:token', emailVerifyController.confirmVerification);

router.get('/verify-email/:token', emailVerifyController.confirmVerification);
router.get('/me', requireAuth, meController);

module.exports = router;
