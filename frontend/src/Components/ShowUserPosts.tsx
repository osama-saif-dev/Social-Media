import { useState } from 'react'
import Pagination from './Pagination';
import { useAuthStore } from '@/store/useAuthStore';
import { usePostStore } from '@/store/usePostStore';
import defaultImage from '@/assets/default.jpg';
import { useUserStore } from '@/store/useUserStore';
import { Bookmark, ClockIcon, Delete, MessageCircleMore, SendHorizontal, Share2, SquarePen, ThumbsUp, Trash2 } from 'lucide-react';
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useNavigate } from 'react-router-dom';

dayjs.extend(relativeTime);

export default function ShowUserPosts() {
    const { authUser } = useAuthStore();
    const { userPosts } = useUserStore();
    const navigate = useNavigate();
    const [isLike, setIsLike] = useState<boolean>(false);
    const [showComment, setShowComment] = useState<boolean>(false);
    const {
        deletePost, isDeletingPost, setIsUpdatingPost, isDeletingComment, deleteComment, isBookMarke,
        setMyPostToUpdate, targetRef, toggleLike, isSendingComment, sendComment, updateComment, toggleBookMark
    } = usePostStore();
    const [showTrash, setShowTrash] = useState<boolean>(false);
    const [showCommentTrash, setShowCommentTrash] = useState<boolean>(false);
    const [postId, setPostId] = useState<string | null>(null);
    const [commentId, setCommentId] = useState<string | null>(null);
    const [commentIdData, setCommentIdData] = useState<string | null>(null);
    const [checkPostId, setCheckPostId] = useState<string | null>(null);
    const [refreshUpdateOrStoreComment, setRefreshUpdateOrStoreComment] = useState<boolean>(false);
    const [text, setText] = useState<string>('')

    const handleLike = async (postId: string) => {
        setIsLike(!isLike);
        toggleLike(postId);
    }

    const handleComment = async (postId: string) => {
        const success = await sendComment({ postId, text });
        if (success) {
            setText('');
            setCheckPostId(null);
            setShowComment(false);
        }
    }

    const handleUpdateComment = async () => {
        const success = await updateComment(postId, commentIdData, text);
        if (success) {
            setPostId('');
            setCommentIdData('');
            setText('');
            setShowComment(false);
            setRefreshUpdateOrStoreComment(false)
            setCheckPostId('')
        }
    }

    const handleBookMark = async (postId: string) => toggleBookMark(postId);

    return (
        <div className="mt-14 pb-4">
            <h1 className="text-[40px] font-bold mb-2 text-primary">Posts</h1>
            <div className="flex flex-col gap-8">
                {userPosts && userPosts.length > 0 && userPosts.map((post) => (
                    <div onClick={() => navigate(`/post/${post._id}`)} onMouseEnter={() => {
                        setPostId(post._id);
                        setShowTrash(true);
                    }}
                        onMouseLeave={() => {
                            setPostId(post._id);
                            setShowTrash(false);
                        }}
                        key={post._id} className="bg-secondary p-4 rounded-md shadow-md cursor-pointer">
                        {/* User Info */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="size-10 self-start">
                                    <img
                                        className="rounded-full w-full h-full object-cover"
                                        src={post?.userId.profilePic || defaultImage} alt="User Image" />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="font-bold">{post?.userId?.name}</h3>
                                    <div className="flex items-center gap-1 opacity-70">
                                        <ClockIcon className="w-3 mb-[2px]" />
                                        <p className="text-[12px]">{dayjs(post.createdAt).fromNow()}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {post.userId._id === authUser?._id && (
                                    <>
                                        <SquarePen
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setMyPostToUpdate(post);
                                                setIsUpdatingPost(true);
                                                targetRef?.current?.scrollIntoView({ behavior: 'smooth' })
                                            }}
                                            className={`${showTrash && postId === post._id ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0 delay-75'} transition-all duration-500 ease-in-out w-5 cursor-pointer text-gray-600 hover:text-primary`} />
                                        <Trash2
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (!isDeletingPost) deletePost(post._id);
                                            }}
                                            className={`${showTrash && postId === post._id ? 'translate-x-0 opacity-100 delay-75' : 'translate-x-2 opacity-0'} transition-all duration-500 ease-in-out w-5 cursor-pointer text-gray-600 hover:text-red-700`} />
                                    </>
                                )}
                            </div>
                        </div>
                        {/* Post Info */}
                        <div className="my-2 ml-14">
                            <h4 className="mb-2">{post.text && post.text}</h4>
                            {post.image && (
                                <div>
                                    <img
                                        className="w-full h-full object-cover"
                                        src={post?.image} alt="Post Image" />
                                </div>
                            )}
                        </div>
                        {/* Post Actions */}
                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-4">
                                <div onClick={(e) => {
                                    e.stopPropagation();
                                    handleLike(post._id)
                                }} className={`flex gap-1 items-center cursor-pointer ${authUser && post.likes?.includes(authUser._id) ? 'text-blue-500' : 'text-gray-500'} `}>
                                    <ThumbsUp
                                        className='w-5 cursor-pointer hover:text-blue-500 transition-all duration-300 ease-in' />
                                    <span>{post.likes.length}</span>
                                </div>
                                <div onClick={(e) => {
                                    e.stopPropagation()
                                    setCheckPostId(post._id);
                                    setShowComment(prev => !prev)
                                }} className="flex gap-1 items-center text-gray-600 cursor-pointer">
                                    <MessageCircleMore className="w-5 " />
                                    <span>{post.comments?.length}</span>
                                </div>
                                <div>
                                    <Share2 className="w-5 cursor-pointer text-gray-600" />
                                </div>
                            </div>
                            <div onClick={(e) => {
                                e.stopPropagation();
                                if (!isBookMarke) handleBookMark(post._id)
                            }} className={`${authUser && post.bookmarks?.includes(authUser._id) ? 'text-blue-500' : 'text-gray-500'} cursor-pointer flex items-center gap-1`}>
                                <Bookmark className={`w-5`} />
                                <span>{post.bookmarks?.length}</span>
                            </div>
                        </div>
                        {/* Send Comment */}
                        <div
                            className={`transition-all duration-700 ease-in-out overflow-hidden  ${showComment && post._id === checkPostId ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'
                                }`}
                        >

                            <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => {
                                e.preventDefault();
                                if (!refreshUpdateOrStoreComment) {
                                    handleComment(post._id)
                                } else {
                                    handleUpdateComment()
                                }
                            }} className="flex flex-col gap-1 rounded-md mt-4">
                                {refreshUpdateOrStoreComment && (
                                    <Delete onClick={(e) => {
                                        e.stopPropagation();
                                        setShowComment(false);
                                        setRefreshUpdateOrStoreComment(false)
                                        setCheckPostId('')
                                        setPostId('');
                                        setCommentIdData('');
                                        setText('');
                                    }} className="ml-auto text-red-500 cursor-pointer mr-1" />
                                )}
                                <div className="flex items-center gap-4">
                                    <input
                                        onClick={(e) => e.stopPropagation()}
                                        value={text}
                                        onChange={(e) => {
                                            setText(e.target.value)
                                        }
                                        }
                                        type="text"
                                        className="flex-1 w-full focus:outline-none p-2 rounded-md border"
                                    />
                                    <button type="submit"
                                        disabled={isSendingComment} className="cursor-pointer size-9 p-2 rounded-full text-primary bg-white border flex items-center justify-center">
                                        <SendHorizontal />
                                    </button>
                                </div>
                            </form>
                        </div>
                        {/* Get Comments */}
                        {post.comments?.length > 0 ? (
                            post.comments.map((comment) => (
                                <div
                                    onMouseEnter={() => {
                                        setCommentId(comment._id);
                                        setShowCommentTrash(true);
                                    }}
                                    onMouseLeave={() => {
                                        setCommentId(comment._id);
                                        setShowCommentTrash(false);
                                    }}
                                    key={comment._id} className="p-4 rounded-md bg-white shadow-md mt-4">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 self-start">
                                            <img className="w-full h-full object-cover rounded-full"
                                                src={comment.user.profilePic || defaultImage} alt={comment.user.name} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold">{comment.user.name}</h3>
                                            <div className="flex items-center gap-1 opacity-70">
                                                <ClockIcon className="w-3 mb-[2px]" />
                                                <p className="text-[12px]">{dayjs(comment.createdAt).fromNow()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 self-start ml-auto">
                                            {authUser?._id === comment.user._id && (
                                                <>
                                                    <SquarePen
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setShowComment(true);
                                                            setRefreshUpdateOrStoreComment(true)
                                                            setCheckPostId(post._id)
                                                            setPostId(post._id);
                                                            setCommentIdData(comment._id);
                                                            setText(comment.text);
                                                        }}
                                                        className={`${showCommentTrash && commentId === comment._id ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0 delay-75'} transition-all duration-500 ease-in-out w-5 cursor-pointer text-gray-600 hover:text-primary`} />
                                                    <Trash2
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            if (!isDeletingComment) deleteComment(post._id, comment._id)
                                                        }}
                                                        className={`${showCommentTrash && commentId === comment._id ? 'translate-x-0 opacity-100 delay-75' : 'translate-x-2 opacity-0'} transition-all duration-500 ease-in-out w-5 cursor-pointer text-gray-600 hover:text-red-700`} />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <span className="mt-2 ml-14 flex">{comment.text}</span>
                                </div>
                            ))
                        ) : (
                            <span className="text-gray-500 flex items-center justify-center mt-4">No Comments Yet</span>
                        )}
                    </div>
                ))}
            </div>
            {/* Pagination */}
            <Pagination setShowComment={setShowComment} setText={setText} setCheckPostId={setCheckPostId} />
        </div>
    )
}
