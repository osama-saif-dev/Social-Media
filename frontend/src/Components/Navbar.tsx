import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from '../assets/pngegg (70) 1.png';
import { useAuthStore } from "@/store/useAuthStore";
import { Avatar, AvatarImage } from '@/Components/ui/avatar';
import userImage from '../assets/default.jpg';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import { Bookmark, Home, MessagesSquare, Search, User, UserPlus, Users, UserSearch } from 'lucide-react';
import { Bell } from 'lucide-react';
import { usePostStore } from "@/store/usePostStore";
import { useEffect } from "react";
import { useFriendRequest } from "@/store/useFriendRequest";
import { useMessageStore } from "@/store/useMessages";

export default function Navbar() {
  const { authUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { notificationCount } = useFriendRequest();
  const { messagesNotification } = useMessageStore();
  const { commentNotification, postNotifications, notificationsCount, setNotificationsCount, searchPost, getFriendPosts } = usePostStore();

  useEffect(() => {
    const count = Number(localStorage.getItem('count'));
    if (count > 0) setNotificationsCount(count);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentNotification, postNotifications])

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const success = await logout();
    if (success) navigate('/login', { replace: true });
  }

  return (
    <header className="flex items-center justify-between bg-secondary px-[10px] xl:px-[50px] py-3">
      {/* Logo */}
      <Link to={'/'}>
        <img src={Logo} alt="Logo" className="w-[60px] sm:w-[80px]" />
      </Link>
      {authUser && (
        <>
          {/* Search */}
          {location.pathname === '/' && (
            <div className="rounded-md relative w-[200px] sm:w-[400px]">
              <Search className="absolute left-[10px] top-1/2 transform -translate-y-1/2 text-gray-400 w-[20px]" />
              <input onChange={(e) => {
                if (e.target.value.trim()) {
                  searchPost(e.target.value)
                } else {
                  getFriendPosts()
                }
              }} type="text" placeholder="Search For Posts..."
                className="focus:outline-none p-2 border border-collapse rounded-md w-full pl-10" />
            </div>
          )}
          {/* DropDown Menu */}
          <div className="flex items-center gap-5">
            <Link to={'/notifications'} className="relative">
              <Bell className="w-8" />
              {notificationsCount > 0 && (
                <span className="absolute right-[-10px] top-[-10px] text-[12px] bg-red-500 text-white rounded-full size-[18px] flex items-center justify-center">
                  {notificationsCount}
                </span>
              )}
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <Avatar>
                  <AvatarImage src={authUser?.profilePic || userImage} />
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-[250px] outline-none fixed left-[-230px] top-[10px] bg-primary text-white shadow-lg rounded-xl p-2 mt-2 border border-[#163844]"
              >
                <DropdownMenuLabel className="text-gray-300 text-sm px-2 pb-1">
                  Navigation
                </DropdownMenuLabel>

                <DropdownMenuItem asChild>
                  <Link
                    to="/"
                    className="flex items-center gap-2 px-3 py-2 text-white rounded-md hover:bg-[#2d5f72] transition-all"
                  >
                    <Home size={18} /> Home
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-2 text-white rounded-md hover:bg-[#2d5f72] transition-all"
                  >
                    <User size={18} /> Profile
                  </Link>
                </DropdownMenuItem>

                {/* Hidden */}
                <DropdownMenuItem asChild className="lg:hidden">
                  <Link
                    to="/messages"
                    className="flex items-center gap-2 px-3 py-2 text-white rounded-md hover:bg-[#2d5f72] transition-all"
                  >
                    <MessagesSquare size={18} /> Messages
                    {messagesNotification > 0 && (
                      <span className="inline-block ml-auto">{messagesNotification}</span>
                    )}
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="lg:hidden">
                  <Link
                    to="/book-marks"
                    className="flex items-center gap-2 px-3 py-2 text-white rounded-md hover:bg-[#2d5f72] transition-all"
                  >
                    <Bookmark size={18} /> Bookmarks
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    to="/friends"
                    className="flex items-center gap-2 px-3 py-2 text-white rounded-md hover:bg-[#2d5f72] transition-all"
                  >
                    <Users size={18} /> Friends
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="lg:hidden">
                  <Link
                    to="/friend-request"
                    className="flex items-center gap-2 px-3 py-2 text-white rounded-md hover:bg-[#2d5f72] transition-all"
                  >
                    <UserPlus size={18} /> Friend Requests
                    {notificationCount > 0 && (
                      <span className="inline-block ml-auto">{notificationCount}</span>
                    )}
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="lg:hidden">
                  <Link
                    to="/suggested-friends"
                    className="flex items-center gap-2 px-3 py-2 text-white rounded-md hover:bg-[#2d5f72] transition-all"
                  >
                    <UserSearch size={18} /> Suggested Friends
                  </Link>
                </DropdownMenuItem>

                <div className="mt-2 border-t border-[#163844] pt-2">
                  <DropdownMenuItem>
                    <button
                      onClick={handleLogout}
                      className="w-full text-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition"
                    >
                      Logout
                    </button>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      )
      }
    </header >
  )
}
