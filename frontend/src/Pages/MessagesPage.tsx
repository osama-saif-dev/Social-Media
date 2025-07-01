import { useUserStore } from "@/store/useUserStore";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ClockIcon, SendHorizontal } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useMessageStore } from "@/store/useMessages";

dayjs.extend(relativeTime);

export default function MessagesPage() {
  const { id } = useParams();
  const { getUser, user } = useUserStore();
  const { onlineUsers, authUser } = useAuthStore();
  const { isSendingMessage, sendMessage, messages, getMessages } = useMessageStore();
  const [showButton, setShowButton] = useState(false);
  const [message, setMessage] = useState('');
  const [now, setNow] = useState(Date.now());
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    getUser(id);
    getMessages(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, onlineUsers]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    bottomRef?.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = await sendMessage({ recieverId: id, message });
    if (success) setMessage('');
  }

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-md shadow-md mb-6">
        <div className="relative w-12 h-12 shrink-0">
          <img
            className="w-full h-full object-cover rounded-full shadow"
            src={user?.profilePic}
            alt={user?.name}
          />
          {user && onlineUsers.includes(user._id) && (
            <span className="absolute right-0 bottom-0 bg-green-500 border-2 border-white rounded-full w-3 h-3"></span>
          )}
        </div>

        <div>
          <h1 className="font-semibold text-lg">{user?.name}</h1>
          {user && (
            onlineUsers.includes(user._id) ? (
              <span className="text-sm text-green-600">Online</span>
            ) : user.lastSeen && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <ClockIcon className="w-3 h-3 mb-[2px]" />
                <span>last seen {dayjs(user.lastSeen).from(now)}</span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Messages Section */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 max-h-[500px] rounded-md bg-gray-50 scrollbar-thin scrollbar-thumb-primary scrollbar-track-primary">
        {messages?.length > 0 &&
          messages.map((message) => {
            const isSender = authUser?._id === message.sender._id;

            return (
              <div
                key={message._id}
                className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex flex-col items-start max-w-[70%]">
                  <div
                    className={`px-4 py-2 rounded-xl shadow-sm text-sm break-words ${isSender
                      ? 'bg-primary text-white rounded-br-none self-end'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none self-start'
                      }`}
                  >
                    {message.message}
                  </div>
                  <div
                    className={`text-[10px] mt-1 text-gray-500 flex items-center gap-1
                       ${isSender ? 'self-end text-right' : 'self-start text-left'
                      }`}
                  >
                    <ClockIcon className="w-3 h-3 mb-[2px]" />
                    {dayjs(message.createdAt).from(now)}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef}></div>
      </div>

      {/* Input */}
      <form className="mt-4" onSubmit={handleSubmit}>
        <div className="flex items-center gap-3 bg-white p-3 rounded-md shadow-md">
          <input
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setShowButton(!!e.target.value.trim());
            }}
            className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none border-collapse"
            placeholder="Type your message..."
          />
          <button
            type="submit"
            disabled={!showButton || isSendingMessage}
            className={`transition-all size-10 p-2 rounded-full flex items-center justify-center border shadow-sm
              ${showButton ? 'text-primary bg-white hover:bg-gray-50' : 'text-gray-400 bg-gray-100 cursor-not-allowed'}
            `}
          >
            <SendHorizontal size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
