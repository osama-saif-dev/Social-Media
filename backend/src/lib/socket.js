import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import User from '../model/User.model.js';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: [process.env.FRONTEND_URL]
    }
});

const userSocketMap = {};

export default function getRecieverSocketId(RecieverId) {
    return userSocketMap[RecieverId];
};

io.on('connection', async (socket) => {
    console.log('User Connected', socket.id);

    const userId = socket.handshake.query.userId;
    if (userId) {
        userSocketMap[userId] = socket.id;
        await User.findByIdAndUpdate(userId, {
            lastSeen: null
        });
    }

    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    socket.on('disconnect', async () => {
        delete userSocketMap[userId];
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
        console.log(`A user disconnect ${socket.id}`);

        if (userId) {
            await User.findByIdAndUpdate(userId, {
                lastSeen: Date.now()
            })
        }
    });
});

export { io, app, server } 