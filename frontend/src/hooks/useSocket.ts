import { useAuthStore } from "@/store/useAuthStore";
import { useFriendRequest } from "@/store/useFriendRequest";
import { useEffect } from "react";
import notificationAudio from '../assets/notification-18-270129.mp3';
import notificationLiveChat from '../assets/livechat-129007.mp3';
import { usePostStore } from "@/store/usePostStore";
import { useUserStore } from "@/store/useUserStore";
import notification from '../assets/notification-18-270129.mp3';
import { toast as toastify } from "react-toastify";
import { useMessageStore } from "@/store/useMessages";
import { useLocation } from "react-router-dom";

export default function useSocket() {
    const { accessToken, refreshToken, onlineUsers, socket } = useAuthStore();
    const location = useLocation();

    useEffect(() => {
        if (!accessToken) refreshToken();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accessToken]);

    useEffect(() => {
        const { setAuthuser, authUser } = useAuthStore.getState();
        const { setTotalLikes } = usePostStore.getState();
        const { incomingReqs, setIncommingReq, acceptedReqs, setAcceptedReqs, setNotificationCount } = useFriendRequest.getState();

        if (onlineUsers.length > 0) {

            if (!socket) return;

            socket.on('new_message', (data) => {
                const { setMessagesNotification } = useMessageStore.getState();
                const count = Number(localStorage.getItem('notificationMessage') || 0) + 1;
                const old = JSON.parse(localStorage.getItem('senderMessage') || '[]');
                const updated = [...old, data];

                useMessageStore.setState((state) => {
                    return { messages: [...state.messages, data] }
                });
                
                if (location.pathname !== `/messages/${data.sender._id}`){
                    setMessagesNotification(count);
                    localStorage.setItem('notificationMessage', count.toString());
                    localStorage.setItem('senderMessage', JSON.stringify(updated));
                    toastify.success(`${data.sender.name} send to you a message`);
                }
                new Audio(notificationLiveChat).play().catch((err) => { console.warn(err) });
            });

            socket.on('send_friend_request', (data) => {
                const newArray = [...(incomingReqs || []), data.friend_request];
                setIncommingReq(newArray);
                setNotificationCount(Number(localStorage.getItem('notificationCount') || 0) + 1);
                toastify.success(`${data.friend_request.senderId.name} send to you a friend request`);

                useUserStore.setState((state) => {
                    const filterUsers = state.suggestedFriends?.filter((friend) => friend._id !== data.sender._id);
                    return { suggestedFriends: filterUsers }
                });

                new Audio(notificationAudio).play().catch((err) => { console.warn(err) });
            });

            socket.on('accepted_request', (data) => {
                const newArray = [...(acceptedReqs || []), data]
                setAcceptedReqs(newArray);
                setNotificationCount(Number(localStorage.getItem('notificationCount') || 0) + 1);
                toastify.success(`${data.receiverId.name} accepted to your request friend`);

                // useAuthStore.setState((state) => {
                //     if (state.authUser){
                //         return {
                //             authUser: {
                //                 ...state.authUser,
                //                 friends: [...state.authUser.friends, data.senderId],
                //             },
                //         };
                //     }
                //     return state;
                // });
                new Audio(notificationAudio).play().catch((err) => { console.warn(err) });
            })

            socket.on('delete_user', (data) => {
                useUserStore.setState((state) => {
                    const alreadyExists = state.suggestedFriends?.some((user) => user._id === data.sender._id);
                    if (alreadyExists) return state;

                    const updatedFriends = state.user?.friends?.filter((friendId) => friendId !== data.sender._id);

                    return {
                        suggestedFriends: [data.sender, ...state.suggestedFriends],
                        user: {
                            ...state.user!,
                            friends: updatedFriends || []
                        }
                    };
                });

                setAuthuser(data.reciever)
            });

            socket.on('remove_friend_request', (data) => {
                useUserStore.setState((state) => {
                    const alreadyExists = state.suggestedFriends?.some((user) => user._id === data._id);
                    if (alreadyExists) return state;

                    return {
                        suggestedFriends: [data, ...state.suggestedFriends]
                    };
                });
            });

            socket.on('new_post', (data) => {
                useUserStore.setState((state) => {
                    const isAlreadyAdded = state.userPosts.some(post => post._id === data._id);
                    if (isAlreadyAdded) return state;
                    usePostStore.setState((state) => {
                        return { postNotifications: [data, ...state.postNotifications] }
                    });
                    if (authUser?._id != data.userId._id) {
                        new Audio(notification).play().catch((err) => console.log(err));
                        toastify.success(`New Post From ${data.userId.name}`);
                        let count = parseInt(localStorage.getItem('count') ?? '') || 0;
                        ++count;
                        localStorage.setItem('count', count.toString());
                        const previous = JSON.parse(localStorage.getItem('postNotifications') || "[]");
                        const notificationId = crypto.randomUUID();
                        const updated = [{ ...data, notificationId }, ...previous];
                        localStorage.setItem('postNotifications', JSON.stringify(updated));
                    }
                    usePostStore.setState((state) => {
                        const newFriendPosts = [data, ...state.friendPosts];
                        const updatedTotalPages = Math.ceil(newFriendPosts.length / 5);
                        return { friendPosts: newFriendPosts, totalPages: updatedTotalPages }
                    })
                    return { userPosts: [data, ...state.userPosts] }
                });
            });

            socket.on('store_comment', (data) => {
                usePostStore.setState((state) => {
                    const updatedPost = state.myPosts?.map((post) =>
                        post._id == data.postId ? { ...post, comments: [...post.comments, data.lastComment] }
                            : post
                    );
                    if (authUser?._id != data.lastComment.user._id) {
                        new Audio(notification).play().catch((err) => console.log(err));
                        toastify.success(`New Comment From ${data.lastComment.user.name}`);
                        let count = parseInt(localStorage.getItem('count') ?? '') || 0;
                        ++count;
                        localStorage.setItem('count', count.toString());
                        const previous = JSON.parse(localStorage.getItem('commentNotifications') || '[]');
                        const notificationId = crypto.randomUUID();
                        const updated = [...previous, { ...data.lastComment, postId: data.postId, notificationId }];
                        localStorage.setItem('commentNotifications', JSON.stringify(updated));
                    }
                    const updatedPostFriends = state.friendPosts?.map((post) =>
                        post._id == data.postId ? { ...post, comments: [...post.comments, data.lastComment] }
                            : post
                    );
                    return {
                        commentNotification: [...state.commentNotification, { ...data.lastComment, postId: data.postId }],
                        myPosts: updatedPost,
                        friendPosts: updatedPostFriends
                    }
                });

                usePostStore.setState((state) => {
                    return { post: { ...state.post!, comments: [...(state.post?.comments ?? []), data.lastComment] } }
                })

                useUserStore.setState((state) => {
                    const updatedPost = state.userPosts.map((post) =>
                        post._id == data.postId ? { ...post, comments: [data.lastComment, ...post.comments] }
                            : post
                    );
                    return { userPosts: updatedPost }
                })
            });

            socket.on('update_comment', (data) => {

                useUserStore.setState((state) => {
                    const updatedPost = state.userPosts?.map((post) => {
                        if (post._id == data.postId) {
                            return {
                                ...post,
                                comments: post?.comments?.map((comment) => {
                                    if (comment._id == data.lastComment._id) {
                                        return data.lastComment
                                    }
                                    return comment;
                                })
                            }
                        }
                        return post;
                    })
                    return { userPosts: updatedPost }
                });

                usePostStore.setState((state) => {
                    const updatedPost = state.myPosts?.map((post) => {
                        if (post._id == data.postId) {
                            return {
                                ...post,
                                comments: post.comments?.map((comment) => {
                                    if (comment._id == data.lastComment._id) {
                                        return data.lastComment
                                    }
                                    return comment;
                                })
                            }
                        }
                        return post;
                    });
                    const updatedFriendPost = state.friendPosts?.map((post) => {
                        if (post._id == data.postId) {
                            return {
                                ...post,
                                comments: post.comments?.map((comment) => {
                                    if (comment._id == data.lastComment._id) {
                                        return data.lastComment
                                    }
                                    return comment;
                                })
                            }
                        }
                        return post;
                    });
                    return { myPosts: updatedPost, friendPosts: updatedFriendPost };
                });

                usePostStore.setState((state) => {
                    if (state.post?._id === data.postId) {
                        return {
                            post: {
                                ...state.post!,
                                comments: state.post!.comments?.map((comment) =>
                                    comment._id === data.lastComment._id ? data.lastComment :
                                        comment
                                ),
                            },
                        };
                    }

                    return {};
                });

            });

            socket.on('update_post', (data) => {
                usePostStore.setState((state) => {
                    if (state.post?._id === data._id) {
                        return { post: data };
                    }
                    return {};
                });

                usePostStore.setState((state) => {
                    const updatedPostFriends = state.friendPosts?.map((post) =>
                        post._id == data._id ? data : post
                    );
                    return { friendPosts: updatedPostFriends }
                })
            });

            socket.on('delete_comment', (data) => {

                usePostStore.setState((state) => {
                    const updatedPost = state?.myPosts?.map((post) => {
                        if (post._id == data._id) {
                            return data
                        }
                        return post
                    });
                    const updatedFriendPost = state?.friendPosts?.map((post) => {
                        if (post._id == data._id) {
                            return data
                        }
                        return post
                    });
                    return { myPosts: updatedPost, friendPosts: updatedFriendPost }
                });


                usePostStore.setState((state) => {
                    if (state.post?._id == data._id) {
                        return { post: data }
                    }
                    return {}
                });

                useUserStore.setState((state) => {
                    const updatedPost = state?.userPosts?.map((post) => {
                        if (post._id == data._id) {
                            return data
                        }
                        return post
                    });
                    return { userPosts: updatedPost }
                });

            });

            socket.on('delete_post', (data) => {
                usePostStore.setState((state) => {
                    if (state.post && state.post._id === data._id) {
                        return { post: null }
                    }
                    return {}
                });
                usePostStore.setState((state) => {
                    const filterFriendPost = state.friendPosts?.filter((post) => post._id !== data._id);
                    return { friendPosts: filterFriendPost }
                });
            });

            socket.on('total_likes', (data) => setTotalLikes(data));

            socket.on('total_likes_reciever', (data) => setTotalLikes(data));

            socket.on('updated_likes', (data) => {

                usePostStore.setState((state) => {
                    if (state.post && state.post._id === data._id) {
                        return { post: data }
                    }
                    return {}
                });

                usePostStore.setState((state) => {
                    const updatedPost = state?.myPosts?.map((post) => {
                        return post._id === data._id ? data : post
                    });
                    const updatedFriendPost = state?.friendPosts?.map((post) => {
                        return post._id === data._id ? data : post
                    });
                    return { myPosts: updatedPost, friendPosts: updatedFriendPost }
                });

                useUserStore.setState((state) => {
                    const updatedPost = state?.userPosts?.map((post) => {
                        return post._id === data._id ? data : post
                    });
                    return { userPosts: updatedPost }
                });

            });

            socket.on('toogle_bookmarks', (data) => {
                usePostStore.setState((state) => {
                    if (state.post?._id === data._id) {
                        return { post: data }
                    }
                    return {}
                });

                usePostStore.setState((state) => {
                    const updatedPost = state.myPosts?.map((post) => {
                        return post._id === data._id ? data : post
                    });
                    const updatedFriendPost = state?.friendPosts?.map((post) => {
                        return post._id === data._id ? data : post
                    });
                    return { myPosts: updatedPost, friendPosts: updatedFriendPost }
                });

                useUserStore.setState((state) => {
                    const updatedPost = state.userPosts?.map((post) => {
                        return post._id === data._id ? data : post
                    });
                    return { userPosts: updatedPost }
                });

            })

            return () => {
                socket.off("send_friend_request");
                socket.off("accepted_request");
                socket.off("new_post");
                socket.off("store_comment");
                socket.off("update_comment");
                socket.off("delete_comment");
                socket.off("delete_post");
                socket.off("update_post");
                socket.off("updated_likes");
                socket.off("total_likes");
                socket.off("delete_user");
                socket.off("toogle_bookmarks");
                socket.off("remove_friend_request");
                socket.off("total_likes_reciever");
                socket.off("new_message");
            };
        }
    }, [onlineUsers, socket, location]);
    return null;
}

