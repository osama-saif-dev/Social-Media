interface IUser {
    _id: string,
    name: string,
    email: string,
    profilePic: string
};

interface IncommingData {
    _id: string,
    status: string,
    senderId: IUser
}

interface AcceptedData {
    _id: string,
    updatedAt: string,
    status: string,
    receiverId: IUser
}

export interface FriendRequestState {
    incomingReqs: IncommingData[] | null;
    acceptedReqs: AcceptedData[] | null;
    isAddingFriend: boolean;
    getFriendRequests: () => void;
    removeAcceptedRequest: (requestId: string) => void;
    acceptRequest: (data: { senderId: string, id: string }) => void;
    rejectRequest: (data: { senderId: string, id: string }) => void;
    sendFriendRequest: (receiverId: string | undefined) => Promise <boolean>;
    setIncommingReq :(data: IncommingData[]) => void;
    setAcceptedReqs :(data: AcceptedData[]) => void;
    notificationCount: number;
    setNotificationCount: (count: number) => void;
}