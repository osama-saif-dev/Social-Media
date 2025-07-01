import { asyncHandler } from "../components/asyncHandler.js";
import CustomError from "../utils/customError.js";
import Message from '../model/Message.model.js';
import getRecieverSocketId, { io } from "../lib/socket.js";

export const getMessages = asyncHandler(async (req, res) => {
    const { id: senderId } = req.user;
    const { id: recieverId } = req.params;
    if (!recieverId || !recieverId.trim()) throw new CustomError('Reciever is required');

    const messages = await Message.find({
        $or: [
            { sender: senderId, reciever: recieverId },
            { sender: recieverId, reciever: senderId }
        ]
    }).sort({ createdAt: 1 });

    res.status(200).json({ success: true, messages });
});

export const sendMessage = asyncHandler(async (req, res) => {
    const { id: senderId } = req.user;
    const { recieverId, message } = req.body;

    if (!recieverId || !recieverId.trim())
        throw new CustomError('Reciver is not defiend', 400);

    if (!message || !message.trim())
        throw new CustomError('Message is required', 400);

    const newMessage = await Message.create({
        message, reciever: recieverId, sender: senderId
    });

    const userMessage = await Message.findById(newMessage._id)
    .populate('reciever')
    .populate('sender');

    const recieverSocketId = getRecieverSocketId(recieverId);
    if (recieverSocketId) {
        io.to(recieverSocketId).emit('new_message', userMessage);
    }

    res.status(200).json({ success: true, userMessage });
});