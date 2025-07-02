import defaultImage from '@/assets/default.jpg';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import PostCard from '@/Components/PostCard';
import { usePostStore } from '@/store/usePostStore';
import ShowMyPosts from '@/Components/ShowMyPosts';

export default function MyProfilePage() {
  const { authUser, editProfile, isEditingProfile, editProfileImage, errors } = useAuthStore();
  const { getMyPosts, page, totalLikes } = usePostStore();
  const [show, setShow] = useState<boolean>(false);
  const [image, setImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: authUser?.name || '',
    bio: authUser?.bio || ''
  });

  useEffect(() => {
    getMyPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleChangeImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(URL.createObjectURL(file));
    editProfileImage(file);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = await editProfile(formData);
    if (success) setShow(!show);
  }
  
  return (
    <div className='flex-1'>
      <div className='flex flex-col items-center gap-6'>
        {/* Edit Profile Card */}
        {show && (
          <div className='bg-[#b0b0b0e8] absolute left-0 top-0 w-full h-full z-10' onClick={() => setShow(!show)}>
            <div onClick={(e) => e.stopPropagation()} className='fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100] p-4 rounded-md bg-secondary w-3/4 lg:w-1/2'>
              <div className='flex items-center justify-between'>
                <h1 className='text-[20px] font-semibold'>Edit Profile</h1>
                <X onClick={() => setShow(!show)} className='cursor-pointer hover:text-gray-400 transition-all duration-300 ease-in' />
              </div>
              <form onSubmit={handleSubmit} className='mt-6 flex flex-col gap-4'>
                <div className='flex flex-col gap-1'>
                  <label htmlFor="name" className='opacity-70 pl-1'>Name</label>
                  <input onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} id='name' type="text" name='name' value={formData.name}
                    className='focus:outline-none p-2 rounded-md border border-collapse' />
                  {errors?.name && <span className='text-red-500'>{errors.name[0]}</span>}
                </div>
                <div className='flex flex-col gap-1'>
                  <label htmlFor="bio" className='opacity-70 pl-1'>Bio</label>
                  <input onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))} id='bio' type="text" name='bio' value={formData.bio}
                    className='focus:outline-none p-2 rounded-md border border-collapse' />
                </div>
                <button className='px-10 py-2 rounded-md bg-primary text-white mt-4 mx-auto flex items-center gap-4' disabled={isEditingProfile}>
                  {isEditingProfile ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Update"
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
        <label htmlFor="image" className='overflow-hidden w-[170px] h-[170px]'>
          <img src={image || authUser?.profilePic || defaultImage} alt="User Image" className='h-full w-full rounded-full cursor-pointer object-cover' />
          <input onChange={handleChangeImage} type="file" accept='image/*' id='image' className='hidden' name='image' />
        </label>
        <h1 className='text-center font-semibold text-[20px]'>{authUser?.name}</h1>
        <div className='flex items-center justify-between gap-4'>

          <Link to={'/friends'} className='border-2 border-collapse p-2 rounded-md text-center px-12'>
            <span>{authUser && authUser?.friends.length > 0 ? authUser?.friends?.length : 0}</span>
            <h1>Friends</h1>
          </Link>

          <div className='border-2 border-collapse p-2 rounded-md text-center px-12'>
            <span>{totalLikes}</span>
            <h1>Likes</h1>
          </div>

        </div>
        {authUser?.bio ? (
          <span className='text-center text-gray-400'>{authUser.bio}</span>
        )
          : (
            <span className='text-center'>No bio yet</span>
          )}
        <button onClick={(e) => {
          setShow(!show)
          e.stopPropagation()
        }} className='px-4 py-2 rounded-md text-white bg-primary'>Edit Profile</button>

      </div>
      <PostCard />
      <ShowMyPosts />
    </div>
  )
}
