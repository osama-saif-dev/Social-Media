import defaultImage from '@/assets/default.jpg';
import ShowUserPosts from '@/Components/ShowUserPosts';
import { useAuthStore } from '@/store/useAuthStore';
import { useFriendRequest } from '@/store/useFriendRequest';
import { usePostStore } from '@/store/usePostStore';
import { useUserStore } from '@/store/useUserStore';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

export default function UserProfilePage() {
  const { id } = useParams();
  const { authUser } = useAuthStore()
  const { getUser, user, deleteFriend, isDeletingFriend } = useUserStore();
  const { totalLikes, page } = usePostStore();
  const { sendFriendRequest, isAddingFriend, incomingReqs, acceptRequest } = useFriendRequest();
  const [show, setShow] = useState(false);

  useEffect(() => {
    getUser(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, page]);

  const handleAcceptRequest = async (senderId: string, id: string) => {
    acceptRequest({ senderId, id });
    getUser(senderId);
  }

  const handleCancelFriend = async (senderId: string) => {
    deleteFriend(senderId);
    getUser(senderId);
    setShow(false);
  }

  const handleAddFriend = async (recieverId: string | undefined) => {
    sendFriendRequest(recieverId);
    getUser(recieverId);
    setShow(true);
  }

  return (
    <div className='flex-1'>
      <div className='flex flex-col items-center justify-center gap-6'>
        <label htmlFor="image" className='overflow-hidden w-[170px] h-[170px]'>
          <img src={user?.profilePic || defaultImage} alt="User Image" className='h-full w-full rounded-full object-cover' />
        </label>
        <h1 className='text-center font-semibold text-[20px]'>{user?.name}</h1>
        <div className='flex items-center justify-center w-full gap-4'>

          <div className='border-2 border-collapse p-2 bg-secondary rounded-md text-center px-20'>
            <span>{user?.friends && user.friends.length > 0 ? user?.friends.length : 0}</span>
            <h1>Friends</h1>
          </div>

          <div className='border-2 border-collapse p-2 bg-secondary rounded-md text-center px-20'>
            <span>{totalLikes > 0 ? totalLikes : (user && user.likes?.length > 0) ? user.likes?.length : 0}</span>
            <h1>Likes</h1>
          </div>

        </div>
        <div className='flex items-center justify-between gap-4'>
          {/* الحالة 1: عنده طلب صداقة مني (incoming request) */}
          {(incomingReqs?.some(req => req.senderId._id === user?._id)) ? (
            <button
              disabled={isAddingFriend}
              onClick={() => {
                const req = incomingReqs.find(r => r.senderId._id === user?._id);
                if (req && user) handleAcceptRequest(user?._id, req._id);
              }}
              className='bg-green-500 hover:bg-green-600 text-white p-2 transition-all duration-300 rounded-md text-center px-12 flex items-center gap-2'
            >
              {isAddingFriend ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                'Accept'
              )}
            </button>

          ) : (authUser && user?.friends?.includes(authUser._id)) ? (
            <button
              disabled={isDeletingFriend}
              onClick={() => handleCancelFriend(user?._id)}
              className='bg-red-500 hover:bg-red-600 text-white p-2 transition-all duration-300 rounded-md text-center px-12 flex items-center gap-2'
            >
              {isDeletingFriend ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                'Remove Friend'
              )}
            </button>

            // الحالة 3: مش صاحب ولا فيه طلب وارد → Add Friend
          ) 
          : (
            authUser && !user?.friends?.includes(authUser._id)) && !show && (
            <button
              disabled={isAddingFriend}
              onClick={() => handleAddFriend(user?._id)}
              className='bg-primary hover:bg-[#1f487b] text-white p-2 transition-all duration-300 rounded-md text-center px-12 flex items-center gap-2'
            >
              {isAddingFriend ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                'Add Friend'
              )}
            </button>
          )
          }
          <Link to={`/messages/${user?._id}`} className='p-2 bg-primary text-white hover:bg-[#1f487b] transition-all duration-300 rounded-md text-center px-12'>
            Message
          </Link>
        </div>
        {user?.bio ? (
          <span className='text-center'>{user.bio}</span>
        )
          : (
            <span className='text-center'>No bio yet</span>
          )}
      </div>
      <ShowUserPosts />
    </div>
  )
}

