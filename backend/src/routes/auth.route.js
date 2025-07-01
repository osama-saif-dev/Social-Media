import express  from "express";
import { signup, login, resendCode, verifyCode, refreshToken, logout, forgetPassword, resetPassword } from '../controllers/auth.controller.js';
import { protecteRoute } from '../utils/protecteRoute.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/send-code', protecteRoute, resendCode);
router.post('/verify-code', protecteRoute, verifyCode);
router.get('/refresh-token', refreshToken);
router.get('/logout', protecteRoute, logout);
router.post('/forget-password', forgetPassword);
router.post('/reset-password', resetPassword);

export default router;