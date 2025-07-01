import express from 'express';
import upload from '../lib/uploads.js';
import { 
    getFriendPosts, 
    getMyPosts, 
    sendPost, 
    deletePost, 
    updatePost, 
    toggleLike,
    storeComment,
    updateComment,
    deleteComment,
    getPost,
    toogleBookMarks,
    getBookMarks,
    searchPost,
 } from '../controllers/post.controller.js';
import { protecteRoute } from '../utils/protecteRoute.js';

const router = express.Router();
router.use(protecteRoute);

// Posts
router.post('/store', upload.single('image'), sendPost);
router.get('/my-posts', getMyPosts);
router.get('/friend-posts', getFriendPosts);
router.post('/comment', storeComment);
router.put('/comment', updateComment);
router.get('/bookmarks', getBookMarks);
router.get('/search', searchPost);

router.get('/book-marks/:id', toogleBookMarks);
router.delete('/comment/:postId/:commentId', deleteComment);
router.patch('/like/:id', toggleLike);
router.patch('/:id', upload.single('image'), updatePost);
router.delete('/:id', deletePost);
router.get('/:id', getPost);
export default router;