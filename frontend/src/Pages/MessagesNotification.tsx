import { useMessageStore } from "@/store/useMessages";
import type { IMessages } from "@/types/Message";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import defaultImage from '@/assets/default.jpg';
import { BellIcon, ClockIcon, MessageSquareIcon, MessagesSquare, X } from 'lucide-react'

export default function MessagesNotification() {
    const { setMessagesNotification, messagesNotification } = useMessageStore();
    const [messages, setMessages] = useState<IMessages[] | []>([]);

    useEffect(() => {
        setMessagesNotification(0);
        const raw = localStorage.getItem('senderMessage');
        if (raw) setMessages(JSON.parse(raw));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messagesNotification]);

    const handleDeleteUserMessage = (messageId: string) => {
        const updatedMessages = messages?.filter((message) => message._id !== messageId);
        localStorage.setItem('senderMessage', JSON.stringify(updatedMessages));
        setMessages(updatedMessages);
    }

    return (
        <div className="flex-1 space-y-8">

            <section className="space-y-4">
                {messages?.length > 0 && (
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <MessagesSquare className="h-5 w-5 text-primary" />
                        Messages
                        {messages?.length > 0 && (
                            <span className="ml-2">{messages?.length}</span>
                        )}
                    </h2>
                )}
                {messages?.length > 0 ? messages.map((message) => (
                    <Link to={`/messages/${message?.sender?._id}`} key={message?._id} className="block mt-4 rounded-md">
                        <div className="p-1 shadow-md">
                            <X onClick={(e) => {
                                e.preventDefault();
                                handleDeleteUserMessage(message?._id)
                            }} className="ml-auto bg-secondary text-primary cursor-pointer rounded-md p-1 hover:text-red-600 hover:bg-[#eee] transition-all duration-300 ease-in mb-3" />
                            <div className="flex items-start gap-3 p-2">
                                <div className="mt-1 size-10 rounded-md overflow-hidden">
                                    <img
                                        src={message?.sender?.profilePic || defaultImage}
                                        alt={message?.sender?.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold">{message?.sender?.name}</h3>
                                    <p className="text-sm text-gray-500">
                                        {message?.sender?.name} sent a new message
                                    </p>
                                    <p className="text-xs flex items-center opacity-70 mt-2 text-gray-500">
                                        <ClockIcon className="h-3 w-3 mr-1 " />
                                        {new Date(message?.createdAt).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                        })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 bg-green-400 px-4 py-2 rounded-md text-white">
                                    <MessageSquareIcon className="h-3 w-3 mr-1" />
                                    New Message
                                </div>
                            </div>
                        </div>
                    </Link>
                )) : (
                    <div className="text-center text-gray-500 flex items-center flex-col gap-2">
                        <BellIcon className="w-[50px]" />
                        No Messages Yet.
                    </div>
                )}
            </section>
        </div>
    )
}
