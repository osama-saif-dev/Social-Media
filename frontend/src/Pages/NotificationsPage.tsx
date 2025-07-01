import { usePostStore } from "@/store/usePostStore";
import type { IComments, IPosts } from "@/types/Post";
import { useEffect, useState } from "react"
import { Layers, X, MessagesSquare, ClockIcon, BellIcon } from 'lucide-react';
import { Link } from "react-router-dom";
import defaultImage from '@/assets/default.jpg';
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default function NotificationsPage() {
    const { setNotificationsCount, notificationsCount, postNotifications, commentNotification } = usePostStore();
    const [posts, setPosts] = useState<IPosts[] | []>([]);
    const [comments, setComments] = useState<IComments[] | []>([]);

    useEffect(() => {
        setNotificationsCount(0)
        localStorage.removeItem('count');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [notificationsCount]);

    useEffect(() => {
        const posts = JSON.parse(localStorage.getItem('postNotifications') || '[]');
        const comments = JSON.parse(localStorage.getItem('commentNotifications') || '[]');
        setPosts(posts);
        setComments(comments);
    }, [postNotifications, commentNotification]);

    const handleRemovePost = (notificationId: string, type: string) => {
        const posts = JSON.parse(localStorage.getItem('postNotifications') || '[]');
        const comments = JSON.parse(localStorage.getItem('commentNotifications') || '[]');
        if (posts && type === 'post') {
            const updatedPosts = posts.filter((post: IPosts) => post.notificationId != notificationId);
            localStorage.setItem('postNotifications', JSON.stringify(updatedPosts));
            setPosts(updatedPosts);
        } else if (comments && type === 'comment') {
            const updatedPosts = comments.filter((comment: IComments) => comment.notificationId != notificationId);
            localStorage.setItem('commentNotifications', JSON.stringify(updatedPosts));
            setComments(updatedPosts);
        }
    }

    return (
        <div className="flex-1 space-y-8">
            {/* Posts */}
            {posts && posts.length > 0 && (
                <section className="space-y-4">
                    <h1 className="text-[30px] font-semibold flex items-center">
                        <Layers className="size-7 text-primary" />
                        <h3 className="ml-2">Posts</h3>
                    </h1>

                    <div className="space-y-4">
                        {posts.map((post) => (
                            <Link to={`/post/${post._id}`}
                                key={post._id}
                                className="flex flex-col gap-10"
                            >
                                <div className="p-4 bg-[#f5f3f3] rounded-md">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-md overflow-hidden">
                                                <img
                                                    src={post?.userId?.profilePic || defaultImage}
                                                    alt={post?.userId?.name}
                                                    className="shadow-md w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <h3 className="font-bold">
                                                    {post?.userId?.name}
                                                    <span className="font-normal"> add a new post </span>
                                                </h3>
                                                <div className="flex items-center gap-1 opacity-70">
                                                    <ClockIcon className="w-3 mb-[2px]" />
                                                    <p className="text-[12px]">{dayjs(post.createdAt).fromNow()}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <X onClick={(e) => {
                                            handleRemovePost(post.notificationId ?? '', 'post');
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }} className="text-gray-500 hover:text-black transition-all duration-500 ease-in-out" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Comments */}
            {comments && comments.length > 0 && (
                <section className="space-y-4">
                    <h1 className="text-[30px] font-semibold flex items-center">
                        <MessagesSquare className="size-7 text-primary" />
                        <h3 className="ml-2">Comments</h3>
                    </h1>

                    <div className="space-y-4">
                        {comments.map((comment) => (
                            <Link to={`/post/${comment.postId}`}
                                key={comment._id}
                                className="flex flex-col gap-10"
                            >
                                <div className="p-4 bg-[#f5f3f3] rounded-md">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-md overflow-hidden">
                                                <img
                                                    src={comment?.user?.profilePic || defaultImage}
                                                    alt={comment?.user?.name}
                                                    className="shadow-md w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <h3 className="font-bold">
                                                    {comment?.user?.name}
                                                    <span className="font-normal"> make a new comment </span>
                                                </h3>
                                                <div className="flex items-center gap-1 opacity-70">
                                                    <ClockIcon className="w-3 mb-[2px]" />
                                                    <p className="text-[12px]">{dayjs(comment.createdAt).fromNow()}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <X onClick={(e) => {
                                            handleRemovePost(comment.notificationId ?? '', 'comment');
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }} className="text-gray-500 hover:text-black transition-all duration-500 ease-in-out" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
            {/* NO REQUESTS FOUND */}
            {comments?.length === 0 && posts?.length === 0 && (
                <div className="text-center text-gray-500 flex items-center flex-col gap-2">
                    <BellIcon className="w-[50px]" />
                    No friend requests or new connections found.
                </div>
            )}
        </div>
    )
}
