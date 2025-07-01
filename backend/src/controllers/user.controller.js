import { asyncHandler } from "../components/asyncHandler.js";
import getRecieverSocketId from "../lib/socket.js";
import FriendRequest from "../model/FriendRequest.mode.js";
import User from "../model/User.model.js";
import CustomError from "../utils/customError.js";
import { io } from "../lib/socket.js";
import { schemaResponse } from '../components/schemaResponse.js';
import { profileSchema } from '../validation/editProfile.validation.js';
import Post from '../model/Posts.model.js';

// User
export const getUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    if (!id) throw new CustomError('User is not define', 400);

    const user = await User.findById(id);
    if (!user) throw new CustomError('User is not found', 404);

    const posts = await Post.find({ userId: id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name profilePic')
        .populate('comments.user', 'name profilePic');
    
    const totalCount = await Post.countDocuments({ userId: id });
    const totalPages = Math.ceil(totalCount / limit);

    const totalLikes = posts?.reduce((acc, currentPost) =>
        acc + currentPost.likes.length, 0) || 0;

    res.status(200).json({ success: true, user, posts, totalLikes, totalPages });
});

export const getFriends = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const user = await User.findById(id).populate('friends');
    const friends = user.friends;
    res.status(200).json({ success: true, friends });
});

export const deleteFriend = asyncHandler(async (req, res) => {
    const { id: senderId } = req.user;
    const { id: receiverId } = req.params;
    if (!receiverId) throw new CustomError('User is not defined', 400);

    const user = await User.findById(receiverId);
    if (!user) throw new CustomError('User not found', 404);

    const alreadyFriends = user.friends.includes(senderId);
    if (!alreadyFriends) throw new CustomError('You are not friends', 400);

    const friend_request = await FriendRequest.findOne({
        $or: [
            { senderId: receiverId, receiverId: senderId },
            { receiverId: receiverId, senderId: senderId }
        ]
    });

    if (friend_request) await friend_request.deleteOne();

    await User.findByIdAndUpdate(senderId, {
        $pull: { friends: receiverId }
    });

    await User.findByIdAndUpdate(receiverId, {
        $pull: { friends: senderId }
    });

    const senderUser = await User.findById(senderId);
    const deletedUser = await User.findById(receiverId);
    
    const data = {
        sender: senderUser,
        reciever: deletedUser
    }

    const recieverSocketId = getRecieverSocketId(receiverId);
    if (recieverSocketId) {
        io.to(recieverSocketId).emit('delete_user', data);
    }

    res.status(200).json({ success: true, deletedUser });
});

// Profile
export const EditProfileImage = asyncHandler(async (req, res) => {
    const { id } = req.user;
    if (!req.file)
        throw new CustomError('No image uploaded', 400);

    const imageUrl = req.file.path;
    const user = await User.findByIdAndUpdate(id, {
        profilePic: imageUrl
    }, { new: true }).select('-password');

    res.status(200).json({ success: true, user });
});

export const EditProfile = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { name, bio } = req.body;

    const validationData = schemaResponse(profileSchema, { name, bio });
    if (!validationData) throw new CustomError('Validation Error', 400);

    const user = await User.findByIdAndUpdate(id, {
        name,
        bio
    }, { new: true }).select('-password');

    res.status(200).json({ success: true, user, message: 'Updated Successfully' });
});

// Friend Requests 
export const sendFriendRequest = asyncHandler(async (req, res) => {
    const { receiverId } = req.body;
    const { id: senderId } = req.user;

    if (!receiverId) throw new CustomError('Reciever is not define', 404);

    const receiverUser = await User.findById(receiverId);
    const senderUser = await User.findById(senderId);
    if (!receiverUser) throw new CustomError('User is not found', 400);

    const alreadyFriends = receiverUser.friends.includes(senderId) ||
        senderUser.friends.includes(receiverId);
    if (alreadyFriends) throw new CustomError('You are already friends', 400);

    const existedFriendRequest = await FriendRequest.findOne({
        $or: [
            { senderId: senderId, receiverId: receiverId },
            { senderId: receiverId, receiverId: senderId }
        ],
    })
    if (existedFriendRequest) throw new CustomError('Friend request already exists', 400);

    const create_friend_req = await FriendRequest.create({
        senderId: senderId,
        receiverId: receiverId
    });

    const friend_request = await FriendRequest.findById(create_friend_req._id).populate('senderId');
    const sender = await User.findById(senderId);

    const data = { sender, friend_request };

    const recieverSocketId = getRecieverSocketId(receiverId);
    if (recieverSocketId) {
        io.to(recieverSocketId).emit('send_friend_request', data);
    }

    res.status(200).json({ success: true, message: 'Send friend request successfully' });
});

export const getFriendRequest = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const incomingReqs = await FriendRequest.find({
        receiverId: id,
        status: 'pending'
    }).populate('senderId');

    const acceptedReqs = await FriendRequest.find({
        senderId: id,
        status: 'accepted'
    }).populate('receiverId');
    res.status(200).json({ success: true, incomingReqs, acceptedReqs });
});

export const acceptFriendRequest = asyncHandler(async (req, res) => {
    const { id: receiverId } = req.user;
    const { senderId, id } = req.body;

    if (!senderId) throw new CustomError('Sender is not define', 400);
    if (!id) throw new CustomError('Friend request id is invalid', 400);

    const existedSender = await User.findById(senderId);
    if (!existedSender) throw new CustomError('Sender is not found', 400);

    const friend_request = await FriendRequest.findById(id).populate('receiverId');
    if (!friend_request) throw new CustomError('Friend request is not found', 400)

    friend_request.status = 'accepted';
    await friend_request.save();

    await User.findByIdAndUpdate(senderId, {
        $addToSet: { friends: receiverId }
    });

    await User.findByIdAndUpdate(receiverId, {
        $addToSet: { friends: senderId }
    });


    const senderSocketId = getRecieverSocketId(senderId);
    if (senderSocketId) {
        io.to(senderSocketId).emit('accepted_request', friend_request);
    }

    res.status(200).json({ success: true });
});

export const rejectFriendRequest = asyncHandler(async (req, res) => {
    const { id: receiverId } = req.user;
    const { senderId, id } = req.body;

    if (!senderId) throw new CustomError('Sender is not define', 400);
    if (!id) throw new CustomError('Friend request id is invalid', 400);

    const existedSender = await User.findById(senderId);
    if (!existedSender) throw new CustomError('Sender is not found', 400);

    const friend_request = await FriendRequest.findById(id);
    if (!friend_request) throw new CustomError('Friend request is not found', 400)

    await friend_request.deleteOne();

    await User.findByIdAndUpdate(senderId, {
        $pull: { friends: receiverId }
    });

    await User.findByIdAndUpdate(receiverId, {
        $pull: { friends: senderId }
    });

    const sender = await User.findById(receiverId);
    const reciever = await User.findById(senderId);

    const recieverSocketId = getRecieverSocketId(senderId);
    if (recieverSocketId){
        io.to(recieverSocketId).emit('remove_friend_request', sender);
    }

    res.status(200).json({ success: true, reciever });
});

export const removeAcceptRequest = asyncHandler(async (req, res) => {
    const { id: requestId } = req.params;
    if (!requestId) throw new CustomError('Request id is not define', 400);

    const friend_request = await FriendRequest.findById(requestId);
    if (!friend_request) throw new CustomError('Friend Request is not found', 404);

    await friend_request.deleteOne();
    res.status(200).json({ success: true });
});

// suggested friends 
export const suggestedFriends = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const friend_request = await FriendRequest.find({
        $or: [
            { senderId: id }, { receiverId: id }
        ]
    });
    const requestIds = friend_request.flatMap((req) => [req.senderId.toString(), req.receiverId.toString()]);
    const me = await User.findById(id).select('friends');
    const excludeIds = new Set([...requestIds, id, ...me.friends.map(f => f.toString())]);
    const users = await User.find({ _id: { $nin: Array.from(excludeIds) } }).select('name profilePic');
    res.status(200).json({ success: true, users });
});

