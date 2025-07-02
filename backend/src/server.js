import express from 'express';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirnameApp = path.dirname(__filename);

if (process.env.NODE_ENV !== 'production') {
  config({
    path: path.resolve(__dirnameApp, '..', '.env'),
    debug: true,
  });
}

import cors from 'cors';
import connectDb from './lib/db.js';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import postRouter from './routes/post.route.js';
import messageRouter from './routes/message.route.js';
import { app, server } from './lib/socket.js';
import history from 'connect-history-api-fallback';

const port = process.env.PORT || 5000;

const __dirName = path.resolve();
console.log('💥 MONGO_URL =', process.env.MONGO_URL);
connectDb();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true
}));

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/post', postRouter);
app.use('/api/message', messageRouter);

app.use((err, req, res, next) => {
    res.status(err.code || 500).json({
        success: false,
        message: err.message || 'Server Error',
        errors: err.errors || null
    });
});

if (process.env.NODE_ENV === 'production') {
    app.use(history());
    app.use(express.static(path.join(__dirName, "../frontend/dist")));

}

server.listen(port, () => {
    console.log(`Server runinng on port ${port}`);
});

