import { axiosInstance } from "@/lib/axios";
import type { PostState } from "@/types/Post";
import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";
import axios from "axios";
import notificationLikes from '../assets/notification-likes.mp3';
import notificationSendPost from '../assets/notification-alert-8-331718.mp3';

export const usePostStore = create<PostState>((set, get) => ({
    isSendingPost: false,
    isDeletingPost: false,
    isDeletingComment: false,
    isUpdatingPost: false,
    isSendingComment: false,
    isBookMarke: false,
    myPosts: [],
    friendPosts: [],
    myPostToUpdate: null,
    notificationsCount: 0,
    totalLikes: 0,
    targetRef: null,
    totalPages: 1,
    page: 1,
    postNotifications: [],
    commentNotification: [],
    post: null,
    bookMarks: [],
    setNotificationsCount: (count) => set({ notificationsCount: count }),
    setTargetRef: (ref) => set({ targetRef: ref }),
    setIsUpdatingPost: (state) => set({ isUpdatingPost: state }),
    setMyPostToUpdate: (post) => set({ myPostToUpdate: post }),
    setPage: (count) => set({ page: count }),
    setTotalLikes: (count) => set({ totalLikes: count }),

    getMyPosts: async () => {
        const { accessToken } = useAuthStore.getState();
        const { page } = get();
        try {
            const res = await axiosInstance.get(`/post/my-posts?page=${page}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            const { posts, totalPages, totalLikes } = res.data;
            set({ myPosts: posts, totalPages, totalLikes });
        } catch (error) {
            console.log(error);
        }
    },

    getPost: async (id) => {
        const { accessToken } = useAuthStore.getState();
        try {
            const res = await axiosInstance.get(`/post/${id}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            set({ post: res.data.post });
        } catch (error) {
            console.log(error);
        }
    },

    sendPost: async (data) => {
        const { accessToken } = useAuthStore.getState();
        set({ isSendingPost: true });
        try {
            const formData = new FormData();
            if (data.text) formData.append('text', data.text);
            if (data.image) formData.append('image', data.image);

            await axiosInstance.post('/post/store', formData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'multipart/form-data',
                }
            });
            new Audio(notificationSendPost).play().catch((err) => console.log(err));
            toast.success('Craeted Post Successfully');
            return true;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.log(error);
                const textError = error?.response?.data?.message;
                if (textError) toast.error(textError);
                return false;
            }
            return false;
        } finally {
            set({ isSendingPost: false });
        }
    },

    updatePost: async (data) => {
        const { accessToken } = useAuthStore.getState();
        set({ isUpdatingPost: true, isSendingPost: true });
        const { myPostToUpdate } = get();
        try {
            const formData = new FormData();
            if (data.image) formData.append('image', data.image);
            if (data.text) formData.append('text', data.text);
            const res = await axiosInstance.patch(`/post/${myPostToUpdate?._id}`, formData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'multipart/form-data',
                }
            });
            new Audio(notificationSendPost).play().catch((err) => console.log(err));
            toast.success(res.data.message);
            return true;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const textError = error?.response?.data?.message;
                if (textError) toast.error(textError);
                return false;
            }
            return false;
        } finally {
            set({ isUpdatingPost: false, isSendingPost: false });
        }
    },

    deletePost: async (postId) => {
        const { accessToken } = useAuthStore.getState();
        const { myPosts, page, getMyPosts, totalPages, getFriendPosts } = get();
        const pathName = window.location.pathname;

        set({ isDeletingPost: true });
        try {
            const res = await axiosInstance.delete(`/post/${postId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            toast.success(res.data.message);
            const filterMyPosts = myPosts?.filter((post) => post._id !== postId);
            const isPageEmpty = filterMyPosts.length === 0;

            if (isPageEmpty) {
                if (page > 1) {
                    const newPage = page - 1;
                    set({ page: newPage });
                    return pathName === '/' ? getFriendPosts() : getMyPosts();
                } else if (page === 1 && totalPages >= 1) {
                    return pathName === '/' ? getFriendPosts() : getMyPosts();
                } else {
                    return pathName === '/' ? set({ friendPosts: [] }) : set({ myPosts: [] });
                }
            } else {
                set({ myPosts: filterMyPosts });
            }

        } catch (error) {
            console.log(error);
        } finally {
            set({ isDeletingPost: false });
        }
    },

    toggleLike: async (postId) => {
        console.log(postId);
        const { accessToken } = useAuthStore.getState();
        const { myPosts, friendPosts } = get();
        const pathName = window.location.pathname;
        try {
            const res = await axiosInstance.patch(`/post/like/${postId}`, {}, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            const { post } = res.data;
            if (pathName === '/') {
                const updatedFriendPost = friendPosts?.map((q) => {
                    return q._id === postId ? post : q
                });
                set({ friendPosts: updatedFriendPost });
            } else {
                const updatedPost = myPosts?.map((q) => {
                    return q._id === postId ? post : q
                });
                set({ myPosts: updatedPost });
            }
            new Audio(notificationLikes).play().catch((err) => console.log(err));
        } catch (error) {
            console.log(error);
        }
    },

    sendComment: async (data) => {
        const { accessToken } = useAuthStore.getState();
        const { myPosts, getPost, friendPosts } = get();
        const pathName = window.location.pathname;
        set({ isSendingComment: true });
        try {
            const res = await axiosInstance.post('/post/comment', data, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const { message, comment } = res.data;
            toast.success(message);
            if (pathName === '/') {
                const updatedFriendPosts = friendPosts?.map((post) =>
                    post._id === data.postId ? { ...post, comments: [...post.comments, comment] } : post
                );
                set({ friendPosts: updatedFriendPosts })
            } else {
                const updatedPost = myPosts?.map((post) =>
                    post._id === data.postId ? { ...post, comments: [...post.comments, comment] } : post
                );
                set({ myPosts: updatedPost });
            }
            getPost(data.postId);
            new Audio(notificationSendPost).play().catch((err) => console.log(err));
            return true;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errors = error?.response?.data?.message;
                if (errors) toast.error(errors);
                return false;
            }
            return false;
        } finally {
            set({ isSendingComment: false });
        }
    },

    deleteComment: async (postId, commentId) => {
        const { accessToken } = useAuthStore.getState();
        set({ isDeletingComment: true });
        const pathName = window.location.pathname;
        const { myPosts, post, friendPosts } = get();
        try {
            const res = await axiosInstance.delete(`/post/${postId}/${commentId}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            toast.success(res.data.message);
            if (pathName === '/') {
                const filterFriendPost = friendPosts?.map((post) => {
                    if (post._id == postId) {
                        return {
                            ...post,
                            comments: post.comments.filter((comment) => comment._id !== commentId)
                        }
                    }
                    return post;
                });
                set({ myPosts: filterFriendPost });
            } else {
                const filterPost = myPosts?.map((post) => {
                    if (post._id == postId) {
                        return {
                            ...post,
                            comments: post.comments.filter((comment) => comment._id !== commentId)
                        }
                    }
                    return post;
                });
                set({ myPosts: filterPost });
            }
            if (post) {
                const updatedPost = post?.comments?.filter((comment) => comment._id !== commentId) ?? [];
                set({ post: { ...post, comments: updatedPost } });
            }
        } catch (error) {
            console.log(error);
        } finally {
            set({ isDeletingComment: false });
        }
    },

    updateComment: async (postId, commentId, text) => {
        const { accessToken } = useAuthStore.getState();
        const { myPosts, friendPosts } = get();
        const pathName = window.location.pathname;

        set({ isSendingComment: true });
        try {
            const res = await axiosInstance.put('/post/comment', { postId, commentId, text }, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const { message, comment: updatedComment, post } = res.data;
            toast.success(message);
            if (pathName === '/profile') {
                const updatedPost = myPosts?.map((post) => {
                    if (post._id == postId) {
                        return {
                            ...post,
                            comments: post?.comments?.map((comment) => {
                                if (comment._id === commentId) {
                                    return updatedComment;
                                }
                                return comment;
                            })
                        }
                    }
                    return post;
                }
                );
                set({ myPosts: updatedPost });
            } else if (pathName === '/') {
                const updatedFriendPost = friendPosts?.map((post) => {
                    if (post._id == postId) {
                        return {
                            ...post,
                            comments: post?.comments?.map((comment) => {
                                if (comment._id === commentId) {
                                    return updatedComment;
                                }
                                return comment;
                            })
                        }
                    }
                    return post;
                }
                );
                set({ friendPosts: updatedFriendPost });
            }
            set({ post });
            new Audio(notificationSendPost).play().catch((err) => console.log(err));
            return true;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errors = error?.response?.data?.message;
                if (errors) toast.error(errors);
                return false;
            }
            return false;
        } finally {
            set({ isSendingComment: false })
        }
    },

    toggleBookMark: async (postId) => {
        const { accessToken } = useAuthStore.getState();
        const { myPosts } = get();
        set({ isBookMarke: true });
        try {
            const res = await axiosInstance.get(`/post/book-marks/${postId}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const { post } = res.data
            const updatedPost = myPosts?.map((q) => {
                return q._id === post._id ? post : q
            })
            set({ myPosts: updatedPost });
            new Audio(notificationLikes).play().catch((err) => console.log(err));
            return true
        } catch (error) {
            console.log(error);
            return false;
        } finally {
            set({ isBookMarke: false });
        }
    },

    getBookMarks: async () => {
        const { accessToken } = useAuthStore.getState();
        const { page } = get();
        try {
            const res = await axiosInstance.get(`/post/bookmarks?page=${page}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const { posts, totalPages } = res.data;
            set({ myPosts: posts, totalPages });
        } catch (error) {
            console.log(error);
        }
    },

    getFriendPosts: async () => {
        const { accessToken } = useAuthStore.getState();
        const { page } = get();
        try {
            const res = await axiosInstance.get(`/post/friend-posts?page=${page}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const { posts, totalPages } = res.data;
            set({ friendPosts: posts, totalPages });
        } catch (error) {
            console.log(error);
        }
    },

    searchPost: async (text) => {
        const { accessToken } = useAuthStore.getState();
        try {
            const res = await axiosInstance.get(`/post/search?text=${text}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const { totalPages, posts } = res.data;
            set({ totalPages, friendPosts: posts });
        } catch (error) {
            console.log(error);
        }
    },

}));