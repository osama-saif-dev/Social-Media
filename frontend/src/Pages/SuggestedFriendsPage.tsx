import { useUserStore } from "@/store/useUserStore"
import { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom";
import defaultImage from '@/assets/default.jpg';
import { Check, X } from 'lucide-react';
import { useFriendRequest } from "@/store/useFriendRequest";

export default function SuggestedFriendsPage() {
    const navigate = useNavigate();
    const { sendFriendRequest, isAddingFriend } = useFriendRequest();
    const { suggestedFriends, getSuggestedFriends, setSuggestedFriends } = useUserStore();

    useEffect(() => {
        getSuggestedFriends();
        if (window.innerWidth >= 1024) navigate('/');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAddFriend = async (recieverId: string | undefined) => sendFriendRequest(recieverId);

    return (
        <div className="flex lg:hidden flex-col gap-3 w-full text-center bg-secondary rounded-md p-4 md:sticky top-[20px] self-start">
            <h1 className="font-bold text-[25px]">Suggested Friends</h1>
            <div className={`${suggestedFriends?.length > 0 && ' mt-4'} space-y-4`}>
                {suggestedFriends?.length > 0 ? (
                    suggestedFriends.map((friend) => (
                        <Link className="flex items-center justify-between p-3 rounded-md cursor-pointer shadow-md" to={`/user/${friend._id}`} key={friend._id}>
                            <div className="flex items-center gap-2">
                                <div className="size-10">
                                    <img className="rounded-full object-cover w-full h-full shadow-sm" src={friend.profilePic || defaultImage} alt={friend.name} />
                                </div>
                                <h1>{friend.name}</h1>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (!isAddingFriend) handleAddFriend(friend._id)
                                }} className="bg-green-500 text-white rounded-full p-[2px] hover:bg-green-600 transition-all duration-300 ease-in" />
                                <X onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const updatedFriends = suggestedFriends?.filter((user) => user._id != friend._id);
                                    setSuggestedFriends(updatedFriends)
                                }} className="bg-red-500 text-white rounded-full p-[2px] hover:bg-red-600 transition-all duration-300 ease-in" />
                            </div>
                        </Link>
                    ))
                ) : (
                    <span className="text-gray-500">No Friends Yet</span>
                )}
            </div>
        </div>
    )
}
