import { asyncHandler } from "../components/asyncHandler.js";
import { schemaResponse } from "../components/schemaResponse.js";
import { signupSchema } from '../validation/signup.validation.js';
import { sendCode } from '../utils/sendCode.js';
import { generateAccessAndRefreshToken } from "../components/generateAccessAndRefreshToken.js";
import { loginSchema } from '../validation/login.validation.js';
import { forgetPasswordSchema } from '../validation/forgetPassword.validation.js';
import { sendEmail } from "../utils/sendEmail.js";
import { resetPasswordSchema } from '../validation/resetPassword.validation.js';
import CustomError from "../utils/customError.js";
import User from "../model/User.model.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export const signup = asyncHandler(async (req, res) => {
    const { name, email, password, password_confirmation } = req.body;

    const validationData = schemaResponse(signupSchema, {
        name, email, password, password_confirmation
    });
    if (!validationData) throw new CustomError('Validation Error');

    const existedUser = await User.findOne({ email });
    if (existedUser) throw new CustomError('Email already exists', 400, {
        email: ['Email already exists']
    });

    const user = await User.create({
        name: validationData.name,
        email: validationData.email,
        password: validationData.password
    });

    await sendCode(user);

    const token = jwt.sign({ userId: user._id }, process.env.JWT_API_SECRET, {
        expiresIn: '15m'
    });

    res.status(201).json({ success: true, accessToken: token, message: 'Sign Up Successfully' });
});

export const resendCode = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) throw new CustomError('User Not Found', 401);

    await sendCode(user);
    res.status(200).json({ success: true, message: 'Send Code Successfully' });
});

export const verifyCode = asyncHandler(async (req, res) => {
    const { code } = req.body;

    if (!code || code.length != 4)
        throw new CustomError('Code is required and must be exactly 4 characters', 400);

    const user = await User.findById(req.user._id);

    if (Date.now() > user.codeExpiresAt) {
        throw new CustomError('Verification code has expired', 400);
    }

    if (user.code != code) {
        throw new CustomError('Invalid verification code', 400);
    }

    user.isVerified = true;
    await user.save();

    const accessToken = generateAccessAndRefreshToken(res, user);
    res.status(200).json({ success: true, message: 'Account verified successfully', accessToken, user });
});

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const validationData = schemaResponse(loginSchema, { email, password });
    if (!validationData)
        throw new CustomError('Validation Error');

    const user = await User.findOne({ email });
    if (!user)
        throw new CustomError('User not found', 404);

    const isCorretedPassword = await bcrypt.compare(password, user.password);
    if (!isCorretedPassword)
        throw new CustomError('Email or password is invalid', 400);

    if (user && !user.isVerified) {
        const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_API_SECRET, {
            expiresIn: '15m'
        });
        return res.status(400).json({ success: false, message: 'Please Verify Your Email', accessToken })
    }

    const accessToken = generateAccessAndRefreshToken(res, user);
    res.status(200).json({ success: true, accessToken, user })
});

export const refreshToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.jwt;
    if (!refreshToken) throw new CustomError('Unauthorized - refresh token not provide', 401);

    const decoded = jwt.verify(refreshToken, process.env.JWT_API_SECRET);
    if (!decoded) throw new CustomError('Token is invalid', 401);

    const user = await User.findById(decoded.userId).select('-password');
    const accessToken = generateAccessAndRefreshToken(res, user);

    res.status(200).json({ success: true, accessToken, user, message: 'Refresh token successfully' });
});

export const logout = asyncHandler(async (req, res) => {
    res.clearCookie('jwt');
    res.status(200).json({ success: true, message: 'Logout Successfully' });
});

export const forgetPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    
    const validationData = schemaResponse(forgetPasswordSchema, {email});
    if (!validationData) throw new CustomError('Validation Error', 400);

    const existedUser = await User.findOne({ email });
    if (!existedUser) throw new CustomError('Email is invalid', 400);

    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 3600000; // 1 hour  

    existedUser.resetPasswordToken = token;
    existedUser.resetPasswordExpires = expires;
    await existedUser.save();

    const link = `http://localhost:5000/reset-password?token=${token}`;
    await sendEmail({ 
        to: existedUser.email,
        subject: 'Reset password',
        text: link
    });

    res.status(200).json({ success: true, message: 'we sent link to your email, please check your email' });
});

export const resetPassword = asyncHandler(async (req, res) => {
    const { token, password, password_confirmation } = req.body;

    const validationData = schemaResponse(resetPasswordSchema, { token, password, password_confirmation });
    if (!validationData) throw new CustomError('Validation Error', 400);

    const user = await User.findOne({ 
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
     });

     if (!user) throw new CustomError('Invalid or expired token', 400);

     user.password = password;
     user.resetPasswordExpires = null;
     user.resetPasswordToken = null;

     await user.save();
     res.status(200).json({ success: true, message: 'Updated Password Successfully' });
});