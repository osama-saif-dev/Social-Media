import Pagination from "@/Components/Pagination";
import { useAuthStore } from "@/store/useAuthStore";
import { usePostStore } from "@/store/usePostStore"
import { Bookmark, ClockIcon, Delete, MessageCircleMore, SendHorizontal, Share2, SquarePen, ThumbsUp, Trash2 } from "lucide-react";
import { useEffect, useState } from "react"
import defaultImage from '@/assets/default.jpg';
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";


dayjs.extend(relativeTime);

export default function BookMarksPage() {
  const { authUser } = useAuthStore();
  const [isLike, setIsLike] = useState<boolean>(false);
  const [showComment, setShowComment] = useState<boolean>(false);
  const {
    getBookMarks, myPosts,
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

  useEffect(() => {
    getBookMarks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <div className="flex-1 pb-4">
      <h1 className="text-[40px] font-bold mb-2 text-primary">My BookMarks</h1>
      <div className="flex flex-col gap-8">
        {myPosts && myPosts.length > 0 && myPosts.map((bookMark) => (
          <div onMouseEnter={() => {
            setPostId(bookMark._id);
            setShowTrash(true);
          }}
            onMouseLeave={() => {
              setPostId(bookMark._id);
              setShowTrash(false);
            }}
            key={bookMark._id} className="bg-secondary p-4 rounded-md shadow-md">
            {/* User Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-10 self-start">
                  <img
                    className="rounded-full w-full h-full object-cover"
                    src={bookMark?.userId?.profilePic || defaultImage} alt="User Image" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-bold">{bookMark?.userId?.name}</h3>
                  <div className="flex items-center gap-1 opacity-70">
                    <ClockIcon className="w-3 mb-[2px]" />
                    <p className="text-[12px]">{dayjs(bookMark.createdAt).fromNow()}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                { authUser?._id === bookMark.userId._id && (
                  <>
                    <SquarePen
                      onClick={() => {
                        setMyPostToUpdate(bookMark);
                        setIsUpdatingPost(true);
                        targetRef?.current?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className={`${showTrash && postId === bookMark._id ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0 delay-75'} transition-all duration-500 ease-in-out w-5 cursor-pointer text-gray-600 hover:text-primary`} />
                    <Trash2
                      onClick={() => {
                        if (!isDeletingPost) deletePost(bookMark._id);
                      }}
                      className={`${showTrash && postId === bookMark._id ? 'translate-x-0 opacity-100 delay-75' : 'translate-x-2 opacity-0'} transition-all duration-500 ease-in-out w-5 cursor-pointer text-gray-600 hover:text-red-700`} />
                  </>
                ) }
              </div>
            </div>
            {/* Post Info */}
            <div className="my-2 ml-14">
              <h4 className="mb-2">{bookMark.text && bookMark.text}</h4>
              {bookMark.image && (
                <div>
                  <img
                    className="w-full h-full object-cover"
                    src={bookMark?.image} alt="Post Image" />
                </div>
              )}
            </div>
            {/* Post Actions */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4">
                <div onClick={() => handleLike(bookMark._id)} className={`flex gap-1 items-center cursor-pointer ${authUser && bookMark.likes?.includes(authUser._id) ? 'text-blue-500' : 'text-gray-500'} `}>
                  <ThumbsUp
                    className='w-5 cursor-pointer hover:text-blue-500 transition-all duration-300 ease-in' />
                  <span>{bookMark.likes.length}</span>
                </div>
                <div onClick={() => {
                  setCheckPostId(bookMark._id);
                  setShowComment(prev => !prev)
                }} className="flex gap-1 items-center text-gray-600 cursor-pointer">
                  <MessageCircleMore className="w-5 " />
                  <span>{bookMark.comments?.length}</span>
                </div>
                <div>
                  <Share2 className="w-5 cursor-pointer text-gray-600" />
                </div>
              </div>
              <div onClick={() => {
                if (!isBookMarke) handleBookMark(bookMark._id)
              }} className={`${authUser && bookMark.bookmarks.includes(authUser._id) ? 'text-blue-500' : 'text-gray-500'} cursor-pointer flex items-center gap-1`}>
                <Bookmark className={`w-5`} />
                <span>{bookMark.bookmarks?.length}</span>
              </div>
            </div>
            {/* Send Comment */}
            <div
              className={`transition-all duration-700 ease-in-out overflow-hidden  ${showComment && bookMark._id === checkPostId ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'
                }`}
            >

              <form onSubmit={(e) => {
                e.preventDefault();
                if (!refreshUpdateOrStoreComment) {
                  handleComment(bookMark._id)
                } else {
                  handleUpdateComment()
                }
              }} className="flex flex-col gap-1 rounded-md mt-4">
                {refreshUpdateOrStoreComment && (
                  <Delete onClick={() => {
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
                    value={text}
                    onChange={(e) =>
                      setText(e.target.value)
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
            {bookMark.comments?.length > 0 ? (
              bookMark.comments.map((comment) => (
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
                            onClick={() => {
                              setShowComment(true);
                              setRefreshUpdateOrStoreComment(true)
                              setCheckPostId(bookMark._id)
                              setPostId(bookMark._id);
                              setCommentIdData(comment._id);
                              setText(comment.text);
                            }}
                            className={`${showCommentTrash && commentId === comment._id ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0 delay-75'} transition-all duration-500 ease-in-out w-5 cursor-pointer text-gray-600 hover:text-primary`} />
                          <Trash2
                            onClick={() => {
                              if (!isDeletingComment) deleteComment(bookMark._id, comment._id)
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
