import { useUserStore } from "@/store/useUserStore";
import { Users } from 'lucide-react';
import { useEffect } from "react";
import { Link } from "react-router-dom";
import defaultImage from '../assets/default.jpg';

export default function FriendsPage() {
  const { getFriends, friends, deleteFriend } = useUserStore();

  useEffect(() => {
    getFriends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className='flex-1 space-y-4'>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Users />
          My Friends
        </h2>

      <div className="space-y-3">
        {friends && friends.length > 0 ? friends.map((friend) => (
          <Link to={`/user/${friend._id}`} key={friend._id}>
            <div className="p-4 shadow-md">
              <div className="flex flex-col md:flex-row lg:flex-col xl:flex-row xl:items-start justify-between gap-3">
                <div className="mt-1 size-10 rounded-md overflow-hidden">
                  <img
                    src={friend.profilePic || defaultImage}
                    alt={friend.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{friend.name}</h3>
                  <p>{friend.bio ? friend.bio : 'No bio yet'}</p>
                </div>
                <button
                  onClick={() => deleteFriend(friend._id)}
                  className='bg-red-500 hover:bg-red-600 text-white p-2 transition-all duration-300 rounded-md text-center px-4'
                >
                  Remove Friend
                </button>
              </div>
            </div>
          </Link>
        )) : (
          <span className="flex items-center justify-center opacity-70">No friends here, if you want you can add new friend</span>
        )}
      </div>
    </section>
  )
}
