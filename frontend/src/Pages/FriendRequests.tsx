import {
  UserCheckIcon,
  BellIcon,
  ClockIcon,
  MessageSquareIcon,
  Loader2,
  X,
} from "lucide-react";
import { useFriendRequest } from "@/store/useFriendRequest";
import defaultImage from "../assets/default.jpg";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";


export default function FriendRequests() {
  const { incomingReqs, acceptedReqs, getFriendRequests, acceptRequest, rejectRequest, removeAcceptedRequest, notificationCount, setNotificationCount } = useFriendRequest();
  const [acceptRequestNum, setAcceptRequestNum] = useState<string | null>(null);
  const [rejectRequestNum, setRejectRequestNUm] = useState<string | null>(null);

  useEffect(() => {
    getFriendRequests();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setNotificationCount(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notificationCount]);

  const handleAcceptRequest = async (e: React.MouseEvent<HTMLButtonElement>, senderId: string, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    acceptRequest({ senderId, id });
    setAcceptRequestNum(id);
  }

  const handleRejectRequest = async (e: React.MouseEvent<HTMLButtonElement>, senderId: string, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    rejectRequest({ senderId, id });
    setRejectRequestNUm(id);
  }

  const handleDeleteAcceptedRequest = async (requestId: string) => removeAcceptedRequest(requestId);

  return (
    <div className="flex-1 space-y-8">
      {/* INCOMING REQUESTS */}
      {incomingReqs && incomingReqs.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <UserCheckIcon className="h-5 w-5 text-primary" />
            Friend Requests
            <span className="ml-2">{incomingReqs.length}</span>
          </h2>

          <div className="space-y-3">
            {incomingReqs.map((request) => (
              <Link to={`/user/${request?.senderId?._id}`}
                key={request._id}
                 className="block mt-4 rounded-md"
              >
                <div className="p-4 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-md overflow-hidden">
                        <img
                          src={request?.senderId?.profilePic || defaultImage}
                          alt={request?.senderId?.name}
                          className="shadow-md w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-semibold">{request?.senderId?.name}</h3>
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        className="px-6 py-2 rounded-md text-white bg-red-500 hover:bg-red-600 transition-all duration-300 ease-in"
                        onClick={(e) => handleRejectRequest(e, request.senderId._id, request._id)}
                        disabled={request._id === rejectRequestNum}
                      >
                        {request._id === rejectRequestNum ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="size-5 animate-spin" />
                            Loading...
                          </div>
                        ) : (
                          "Reject"
                        )}
                      </button>

                      <button
                        className="px-6 py-2 rounded-md text-white bg-green-500 hover:bg-green-600 transition-all duration-300 ease-in"
                        onClick={(e) => handleAcceptRequest(e, request.senderId._id, request._id)}
                        disabled={request._id === acceptRequestNum}
                      >
                        {request._id === acceptRequestNum ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="size-5 animate-spin" />
                            Loading...
                          </div>
                        ) : (
                          "Accept"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ACCEPTED REQUESTS */}
      {acceptedReqs && acceptedReqs.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BellIcon className="h-5 w-5 text-success" />
            New Connections
          </h2>

          <div className="space-y-3">
            {acceptedReqs.map((request) => (
              <Link to={`/user/${request?.receiverId?._id}`} key={request?._id}  className="block mt-4 rounded-md">
                <div className="p-1 shadow-md">
                  <X onClick={(e) => {
                    e.preventDefault();
                    handleDeleteAcceptedRequest(request?._id)
                  }} className="ml-auto bg-secondary text-primary cursor-pointer rounded-md p-1 hover:text-red-600 hover:bg-[#eee] transition-all duration-300 ease-in mb-3"/>
                  <div className="flex items-start gap-3 p-2">
                    <div className="mt-1 size-10 rounded-md overflow-hidden">
                      <img
                        src={request?.receiverId?.profilePic || defaultImage}
                        alt={request?.receiverId?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{request?.receiverId?.name}</h3>
                      <p className="text-sm text-gray-500">
                        {request?.receiverId?.name} accepted your friend request
                      </p>
                      <p className="text-xs flex items-center opacity-70 mt-2 text-gray-500">
                        <ClockIcon className="h-3 w-3 mr-1 " />
                        {new Date(request?.updatedAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 bg-green-400 px-4 py-2 rounded-md text-white">
                      <MessageSquareIcon className="h-3 w-3 mr-1" />
                      New Friend
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* NO REQUESTS FOUND */}
      {incomingReqs?.length === 0 && acceptedReqs?.length === 0 && (
        <div className="text-center text-gray-500 flex items-center flex-col gap-2">
          <BellIcon className="w-[50px]" />
          No friend requests or new connections found.
        </div>
      )}
    </div>
  );
}
