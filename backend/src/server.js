import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDb from './lib/db.js';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import postRouter from './routes/post.route.js';
import messageRouter from './routes/message.route.js';
import { app, server } from './lib/socket.js';
import path from 'path';
import history from 'connect-history-api-fallback';

const port = process.env.PORT || 5000;
const __dirName = path.resolve();

connectDb();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:5173'],
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
    //     app.get("*", (req, res) => {
    //     if (!req.path.startsWith('/api')) {
    //         res.sendFile(path.join(__dirName, "../frontend/dist/index.html"));
    //     } else {
    //         res.status(404).json({ error: 'API endpoint not found' });
    //     }
    // });
}

server.listen(port, () => {
    console.log(`Server runinng on port ${port}`);
});

