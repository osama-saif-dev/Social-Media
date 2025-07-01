import { asyncHandler } from "../components/asyncHandler.js";
import getRecieverSocketId, { io } from "../lib/socket.js";
import Post from "../model/Posts.model.js";
import User from "../model/User.model.js";
import CustomError from "../utils/customError.js";

// Posts 
export const sendPost = asyncHandler(async (req, res) => {
    const { id: userId } = req.user;
    const { text } = req.body;

    if (!text || !text.trim()) throw new CustomError('Text is required', 400);
    const user = await User.findById(userId);
    const friends = user.friends;

    const image = req?.file?.path;
    const createdPost = await Post.create({ text, image, userId });

    const post = await Post.findById(createdPost._id)
        .populate('userId', 'name profilePic')
        .populate('comments.user', 'name profilePic');

    friends.forEach(friend => {
        const recieverSocketId = getRecieverSocketId(friend._id);
        if (recieverSocketId) {
            io.to(recieverSocketId).emit('new_post', post)
        }
    });

    res.status(200).json({ success: true });
});

export const getPost = asyncHandler(async (req, res) => {
    const { id: userId } = req.user;
    const { id } = req.params;
    if (!id) throw new CustomError('Post id is not defiend', 400);

    const post = await Post.findById(id)
        .populate('userId', 'name profilePic')
        .populate('comments.user', 'name profilePic');
    if (!post) throw new CustomError('Post is not found', 404);

    res.status(200).json({ success: true, post });
});

export const getMyPosts = asyncHandler(async (req, res) => {
    const { id: userId } = req.user;

    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ userId }).skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate('userId')
        .populate('comments.user', 'name profilePic')

    const totalCount = await Post.countDocuments({ userId });
    const totalPages = Math.ceil(totalCount / limit);

    const myPosts = await Post.find({ userId });
    const totalLikes = myPosts.reduce((acc, post) => acc + post.likes.length, 0) || 0;

    res.status(200).json({ success: true, posts, totalPages, totalLikes });
});

export const deletePost = asyncHandler(async (req, res) => {
    const { id: userId } = req.user;
    const { id: postId } = req.params;

    if (!postId) throw new CustomError('Post id is not defined', 400);

    const post = await Post.findOne({ _id: postId, userId });
    if (!post) throw new CustomError('Post is not found', 404);

    await post.deleteOne();

    io.emit('delete_post', post);
    res.status(200).json({ success: true, message: 'Deleted Successfully' });
});

export const updatePost = asyncHandler(async (req, res) => {
    const { id: userId } = req.user;
    const { id: postId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) throw new CustomError('Text is required', 400);
    if (!postId.trim()) throw new CustomError('Post id is not defined', 400);

    const post = await Post.findOne({ _id: postId, userId })
        .populate('userId', 'name profilePic')
        .populate('comments.user', 'name profilePic');;
    if (!post) throw new CustomError('Post not found', 404);

    const imagePath = req.file?.path;
    post.text = text

    if (imagePath) post.image = imagePath;
    await post.save();

    io.emit('update_post', post)
    res.status(200).json({ success: true, message: 'Updated Successfully' });
});

// all posts for my friends 
export const getFriendPosts = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const user = await User.findById(id).populate('friends');

    const friendIds = user.friends.map(friend => friend._id);
    const allIds = Array.from(new Set([...friendIds, id]));

    const posts = await Post.find({ userId: { $in: allIds } })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate('userId')
        .populate('comments.user', 'name profilePic')

    const totalCount = await Post.countDocuments({ userId: { $in: allIds } });
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({ success: true, posts, totalPages });
});

// Likes Post 
export const toggleLike = asyncHandler(async (req, res) => {
    const { id: userId } = req.user;
    const { id: postId } = req.params;
    if (!postId.trim()) throw new CustomError('Post id is not defiend', 400);

    const post = await Post.findById(postId);
    if (!post) throw new CustomError('Post is not found', 404);

    const alreadyExists = post.likes.includes(userId);
    if (alreadyExists) {
        await Post.findByIdAndUpdate(postId, {
            $pull: { likes: userId }
        });
    } else {
        await Post.findByIdAndUpdate(postId, {
            $addToSet: { likes: userId }
        });
    }

    const updatedPost = await Post.findById(postId)
        .sort({ createdAt: -1 })
        .populate('userId')
        .populate('comments.user', 'name profilePic');

    const myPosts = await Post.find({ userId });
    const totalLikes = myPosts.reduce((acc, post) => acc + post.likes.length, 0) || 0;

    io.emit('updated_likes', updatedPost);
    const senderSocketId = getRecieverSocketId(userId);
    if (senderSocketId) {
        io.to(senderSocketId).emit('total_likes', totalLikes);
    }

    const recieverPosts = await Post.find({ userId: post.userId });
    const total_likes_for_reciever_user = recieverPosts.reduce((acc, post) => acc + post.likes?.length, 0) || 0;

    const recieverSocketId = getRecieverSocketId(post.userId);
    if (recieverSocketId && post.userId != userId) {
        io.to(recieverSocketId).emit('total_likes_reciever', total_likes_for_reciever_user);
    }

    res.status(200).json({ success: true, post: updatedPost });
});

// comments Post
export const storeComment = asyncHandler(async (req, res) => {
    const { id: userId } = req.user;
    const { text, postId } = req.body;

    if (!text || !text.trim()) throw new CustomError('Text is required', 400);
    if (!postId.trim()) throw new CustomError('Post is not defiend', 400);

    const post = await Post.findById(postId);
    if (!post) throw new CustomError('Post not found', 404);

    const comment = {
        user: userId,
        text,
        createdAt: Date.now()
    };

    post.comments.push(comment);
    await post.populate('comments.user', 'name profilePic');
    await post.save();

    const data = {
        lastComment: post.comments[post.comments.length - 1],
        postId: post._id
    };

    // make socket here
    io.emit('store_comment', data);

    res.status(200).json({
        success: true,
        message: 'Created Successfully',
        comment: data.lastComment
    });
});

export const updateComment = asyncHandler(async (req, res) => {
    const { id: userId } = req.user;
    const { text, commentId, postId } = req.body;

    if (!text || !text.trim()) throw new CustomError('Text is required', 400);
    if (!postId.trim()) throw new CustomError('Post is not defiend', 400);

    const post = await Post.findById(postId).populate('comments.user', 'name profilePic');;
    if (!post) throw new CustomError('Post not found', 404);

    const comment = post.comments.id(commentId);
    if (!comment) throw new CustomError('Comment not found', 404);

    if (!comment.user.equals(userId))
        throw new CustomError('Not authorized to edit this comment', 403);

    comment.text = text;
    await post.save();

    const data = {
        lastComment: comment,
        postId: post._id
    }

    io.emit('update_comment', data);

    res.status(200).json({ success: true, message: 'Updated Successfully', comment, post });
});

export const deleteComment = asyncHandler(async (req, res) => {
    const { postId, commentId } = req.params;

    if (!postId.trim() || !commentId.trim())
        throw new CustomError('Data is required', 400);

    const post = await Post.findById(postId)
        .populate('userId', 'name profilePic')
        .populate('comments.user', 'name profilePic');;
    if (!post) throw new CustomError('Post not found', 404);

    const comment = post.comments.id(commentId);
    if (!comment) throw new CustomError('Comment not found', 404);

    post.comments.pull(comment)
    await post.save();

    io.emit('delete_comment', post);

    res.status(200).json({ success: true, message: 'Deleted Successfully' });
});

// Book Marks 
export const toogleBookMarks = asyncHandler(async (req, res) => {
    const { id: userId } = req.user;
    const { id: postId } = req.params;
    if (!postId) throw new CustomError('Post is not defiend', 400);

    const post = await Post.findById(postId)
        .populate('userId', 'name profilePic')
        .populate('comments.user', 'name profilePic');

    if (!post) throw new CustomError('Post not found', 404);

    if (post.bookmarks.includes(userId)) {
        post.bookmarks.pull(userId);
    } else {
        post.bookmarks.push(userId);
    }

    await post.save();

    io.emit('toogle_bookmarks', post);

    res.status(200).json({ success: true, post });
});

export const getBookMarks = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const page = Number(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ bookmarks: { $in: id } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name profilePic')
        .populate('comments.user', 'name profilePic');

    const totalCount = await Post.countDocuments({ userId: id });
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({ success: true, posts, totalPages });
});

// Search 
export const searchPost = asyncHandler(async (req, res) => {
    const { id: userId } = req.user;
    const { text } = req.query;
    if (!text || !text.trim()) throw new CustomError('Text not found');

    const page = 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const me = await User.findById(userId).populate('friends');
    const friendIds = me.friends?.map((friend) => friend._id);
    const allIds = Array.from(new Set([...friendIds, userId]))

    const posts = await Post.find({ userId: { $in: allIds }, text: { $regex: text, $options: 'i' } })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate('userId')
        .populate('comments.user', 'name profilePic')

    const totalCount = await Post.countDocuments({ userId: { $in: allIds }, text: { $regex: text, $options: 'i' } });
    const totalPages = Math.ceil(totalCount / limit);
    
    res.status(200).json({ success: true, posts, totalPages });
});