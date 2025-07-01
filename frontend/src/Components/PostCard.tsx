import { useAuthStore } from "@/store/useAuthStore"
import defaultImage from '../assets/default.jpg';
import { ImagePlus, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ISendPostData } from "@/types/Post";
import { usePostStore } from "@/store/usePostStore";
import { Link, useLocation } from "react-router-dom";

export default function PostCard() {
    const { authUser } = useAuthStore();
    const location = useLocation();
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const { sendPost, isSendingPost, myPostToUpdate, setTargetRef, isUpdatingPost, updatePost, setMyPostToUpdate, getMyPosts, getFriendPosts } = usePostStore();
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const ref = useRef<HTMLInputElement | null>(null);

    const [formData, setFormData] = useState<ISendPostData>({
        image: null,
        text: ''
    });

    const [UpdatingFormData, setUpdatingFormData] = useState<ISendPostData>({
        image: null,
        text: myPostToUpdate?.text
    });

    useEffect(() => {
        if (scrollRef?.current) setTargetRef(scrollRef)
    }, [scrollRef, setTargetRef]);

    useEffect(() => {
        if (myPostToUpdate) {
            setUpdatingFormData((prev) => ({
                ...prev,
                text: myPostToUpdate.text
            }))
        }
        if (myPostToUpdate?.image) setImageUrl(myPostToUpdate.image);
    }, [myPostToUpdate]);

    const handleChangeImages = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target;
        if (!files) return;
        setImageUrl(URL.createObjectURL(files[0]));
        if (isUpdatingPost) {
            setUpdatingFormData({ ...UpdatingFormData, image: files[0] });
        }
        setFormData({ ...formData, image: files[0] });
    }

    const handleSendPost = async () => {
        const success = await sendPost(formData);
        if (success) {
            setFormData({ image: null, text: '' });
            setImageUrl(null);
            return location.pathname === '/' ? getFriendPosts() : getMyPosts()
        }
    }

    const handleUpdatePost = async () => {
        const success = await updatePost(UpdatingFormData);
        if (success) {
            setUpdatingFormData({ image: null, text: '' });
            setImageUrl(null);
            setMyPostToUpdate(null);
            return location.pathname === '/' ? getFriendPosts() : getMyPosts()

        }
    }

    return (
        <>
            <div ref={scrollRef} className={`${location.pathname !== '/' && 'mt-8'} bg-secondary shadow-md rounded-md p-4`} >
                {isUpdatingPost ? (
                    <>
                        <div className="flex items-center gap-4">
                            <Link to={'/profile'} className=" self-start">
                                <img src={authUser?.profilePic || defaultImage} alt="User Profile" className='size-10 rounded-full' />
                            </Link>
                            <textarea value={UpdatingFormData.text} onChange={(e) => setUpdatingFormData({ ...UpdatingFormData, text: e.target.value })} className='flex-1 p-2 size-20 rounded-md focus:outline-none' name="text" id="" placeholder="what's on your mind"></textarea>
                        </div>
                        {imageUrl && (
                            <div className="my-4">
                                <img src={imageUrl} alt="Selected Image" className="w-full max-h-[400px] object-cover" />
                            </div>
                        )}
                        <div className='flex items-center gap-6 justify-end'>
                            <ImagePlus onClick={() => { ref?.current?.click() }} className='mt-3 opacity-70 cursor-pointer' />
                            <input onChange={handleChangeImages} ref={ref} type="file" accept='image/*' className='hidden' />
                            <button onClick={handleUpdatePost} className="bg-primary py-2 px-8 rounded-md mt-4 text-white flex items-center justify-center gap-2" type="submit" disabled={isSendingPost}>
                                {isSendingPost ? (
                                    <>
                                        <Loader2 className="size-5 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    "Update"
                                )}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-4">
                            <Link to={'/profile'} className=" self-start">
                                <img src={authUser?.profilePic || defaultImage} alt="User Profile" className='size-10 rounded-full self-start' />
                            </Link>
                            <textarea value={formData.text} onChange={(e) => setFormData({ ...formData, text: e.target.value })} className='flex-1 p-2 size-20 rounded-md focus:outline-none' name="text" id="" placeholder="what's on your mind"></textarea>
                        </div>
                        {imageUrl && (
                            <div className="my-4">
                                <img src={imageUrl} alt="Selected Image" className="w-full max-h-[400px] object-cover" />
                            </div>
                        )}
                        <div className='flex items-center gap-6 justify-end'>
                            <ImagePlus onClick={() => { ref?.current?.click() }} className='mt-3 opacity-70 cursor-pointer' />
                            <input onChange={handleChangeImages} ref={ref} type="file" accept='image/*' className='hidden' />
                            <button onClick={handleSendPost} className="bg-primary py-2 px-8 rounded-md mt-4 text-white flex items-center justify-center gap-2" type="submit" disabled={isSendingPost}>
                                {isSendingPost ? (
                                    <>
                                        <Loader2 className="size-5 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    "Post"
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    )
}
