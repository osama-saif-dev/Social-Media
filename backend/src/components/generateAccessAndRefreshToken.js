import jwt from 'jsonwebtoken';

export const generateAccessAndRefreshToken = (res, user) => {
    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_API_SECRET, {
        expiresIn: '15m',
    });

    const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_API_SECRET, {
        expiresIn: '7d',
    });
    
    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return accessToken;
}