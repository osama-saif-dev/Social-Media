import express from 'express';
import { protecteRoute } from '../utils/protecteRoute.js'
import {
    sendFriendRequest, EditProfileImage, EditProfile, getFriendRequest,
    acceptFriendRequest, rejectFriendRequest, removeAcceptRequest, getUser,
    getFriends, deleteFriend,
    suggestedFriends
} from '../controllers/user.controller.js';
import upload from '../lib/uploads.js';

const router = express.Router();
router.use(protecteRoute);

// Profile
router.patch('/profile-image', upload.single('image'), EditProfileImage);
router.patch('/profile', EditProfile);

// Friend Request
router.post('/send/friend-request', sendFriendRequest);
router.get('/friend-request', getFriendRequest);
router.patch('/accept/friend-request', acceptFriendRequest);
router.patch('/reject/friend-request', rejectFriendRequest);

router.get('/suggested-friends', suggestedFriends);

// user
router.get('/friends', getFriends);
router.delete('/remove/accepted-request/:id', removeAcceptRequest);
router.delete('/:id', deleteFriend);
router.get('/:id', getUser);

export default router;