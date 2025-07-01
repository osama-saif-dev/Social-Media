import { Link, useLocation } from "react-router-dom";
import { House } from 'lucide-react';
import { UserRoundPen } from 'lucide-react';
import { UserRoundPlus } from 'lucide-react';
import { MessageCircle } from 'lucide-react';
import { Bookmark } from 'lucide-react';
import { useFriendRequest } from "@/store/useFriendRequest";
import { useMessageStore } from "@/store/useMessages";

const links = [
    { to: '/', title: 'Home', icon: <House /> },
    { to: '/profile', title: 'Profile', icon: <UserRoundPen /> },
    { to: '/messages', title: 'Messages', icon: <MessageCircle /> },
    { to: '/book-marks', title: 'Book Marks', icon: <Bookmark /> },
    { to: '/friend-request', title: 'Friend Requests', icon: <UserRoundPlus /> },
];

export default function Aside() {
    const location = useLocation();
    const handleScrollTop = () => {
        scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    const { notificationCount } = useFriendRequest();
    const { messagesNotification} = useMessageStore()
    return (
        <aside className="hidden lg:flex flex-col gap-3 w-[250px] xl:w-[300px] bg-secondary rounded-md p-4 sticky top-[20px] self-start">
            {links && links.length > 0 && (
                links.map((link, index) => (
                    <Link to={link.to} key={index}
                        onClick={handleScrollTop}
                        className={`${location.pathname === link.to ? 'bg-primary text-white' : 'bg-secondary'} p-3 text-center rounded-md font-semibold text-[18px] hover:bg-primary hover:text-white transition-all duration-300 ease-in flex items-center gap-2`}>
                        <span>{link.icon}</span>
                        {link.title}
                        {link.to === '/friend-request' && notificationCount > 0 && location.pathname !== link.to && (
                            <span
                                className={`${location.pathname === link.to ? 'bg-secondary text-primary' : 'text-secondary bg-primary'} ml-auto  rounded-full size-6 flex items-center justify-center transition-all duration-300 ease-in`}>
                                {notificationCount}
                            </span>
                        )}
                        {link.to === '/messages' && messagesNotification > 0 && location.pathname !== link.to && (
                            <span
                                className={`${location.pathname === link.to ? 'bg-secondary text-primary' : 'text-secondary bg-primary'} ml-auto  rounded-full size-6 flex items-center justify-center transition-all duration-300 ease-in`}>
                                {messagesNotification}
                            </span>
                        )}
                    </Link>
                ))
            )}
        </aside>
    )
}
