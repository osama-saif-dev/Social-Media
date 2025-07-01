import { axiosInstance } from "@/lib/axios";
import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import type { FriendRequestState } from "@/types/FriendRequest";
import notificationSound from '../assets/notification-18-270129.mp3';
import { useUserStore } from "./useUserStore";

export const useFriendRequest = create<FriendRequestState>((set, get) => ({
    incomingReqs: [],
    acceptedReqs: [],
    isAddingFriend: false,
    setIncommingReq: (data) => set({ incomingReqs: data }),
    setAcceptedReqs: (data) => set({ acceptedReqs: data }),
    notificationCount: Number(localStorage.getItem('notificationCount')) || 0,
    setNotificationCount: (count) => {
        localStorage.setItem('notificationCount', count.toString());
        set({ notificationCount: count });
    },

    getFriendRequests: async () => {
        const { accessToken } = useAuthStore.getState();
        try {
            const res = await axiosInstance.get('/user/friend-request', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            const { incomingReqs, acceptedReqs } = res.data;
            set({ incomingReqs, acceptedReqs });
        } catch (error) {
            console.log(error)
        }
    },

    acceptRequest: async (data) => {
        const { accessToken, authUser, setAuthuser } = useAuthStore.getState();
        const { incomingReqs } = get();
        const { setUser, user } = useUserStore.getState();
        set({ isAddingFriend: true });
        try {
            await axiosInstance.patch('/user/accept/friend-request', data, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            const filterIncommingReq = incomingReqs?.filter((req) => req._id !== data.id);
            set({ incomingReqs: filterIncommingReq });
            if (authUser){
                setAuthuser({ ...authUser, friends: [...authUser.friends, data.senderId] });
                if (user){
                    const updatedUser = {
                        ...user,
                        friends: [...user.friends, authUser._id]
                    }
                    setUser(updatedUser);
                }
            }
            new Audio(notificationSound).play().catch((err) => console.log(err));
        } catch (error) {
            console.log(error);
        } finally {
            set({ isAddingFriend: false });
        }
    },

    removeAcceptedRequest: async (requestId) => {
        const { accessToken } = useAuthStore.getState();
        const { acceptedReqs } = get();
        try {
            await axiosInstance.delete(`/user/remove/accepted-request/${requestId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            const filterAcceptedReq = acceptedReqs?.filter((req) => req._id !== requestId);
            set({ acceptedReqs: filterAcceptedReq });
        } catch (error) {
            console.log(error);
        }
    },

    rejectRequest: async (data) => {
        const { accessToken } = useAuthStore.getState();
        const { incomingReqs } = get();
        set({ isAddingFriend: true });
        try {
            const res = await axiosInstance.patch('/user/reject/friend-request', data, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            const { reciever } = res.data;
            const filterIncommingReq = incomingReqs?.filter((req) => req._id !== data.id);
            useUserStore.setState((state) => {
                const alreadyExists = state.suggestedFriends?.some((user) => user._id === data.senderId);
                if (alreadyExists) return state;

                return {
                    suggestedFriends: [reciever, ...state.suggestedFriends]
                };
            })
            set({ incomingReqs: filterIncommingReq });

        } catch (error) {
            console.log(error);
        } finally {
            set({ isAddingFriend: false });
        }
    },

    sendFriendRequest: async (receiverId) => {
        const { accessToken } = useAuthStore.getState();
        set({ isAddingFriend: true });
        try {
            await axiosInstance.post('/user/send/friend-request', { receiverId }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            new Audio(notificationSound).play().catch((err) => console.log(err));
            useUserStore.setState((state) => {
                const filterUsers = state.suggestedFriends?.filter((friend) => friend._id !== receiverId);
                return { suggestedFriends: filterUsers }
            });
            
            return true;
        } catch (error) {
            console.log(error);
            return false;
        } finally {
            set({ isAddingFriend: false });
        }
    },

}));