import { axiosInstance } from "@/lib/axios";
import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import type { UserState } from "@/types/User";
import { usePostStore } from "./usePostStore";

export const useUserStore = create<UserState>((set, get) => ({
    user: null,
    friends: [],
    userPosts: [],
    isDeletingFriend: false,
    suggestedFriends: [],
    setSuggestedFriends: (data) => set({ suggestedFriends: data }),
    setUser: (data) => set({ user: data }),

    getUser: async (id) => {
        const { accessToken } = useAuthStore.getState();
        const { setTotalLikes, page } = usePostStore.getState();
        try {
            const res = await axiosInstance.get(`/user/${id}?page=${page}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            // when i get user posts and show it check the socket it called (store_comment) for updating user post comment
            const { totalLikes, user, posts, totalPages } = res.data;
            set({ user, userPosts: posts });
            usePostStore.setState(() => { return { totalPages: totalPages } })
            setTotalLikes(totalLikes);
        } catch (error) {
            console.log(error)
        }
    },

    getFriends: async () => {
        const { accessToken } = useAuthStore.getState();
        try {
            const res = await axiosInstance.get('/user/friends', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            set({ friends: res.data.friends });
        } catch (error) {
            console.log(error);
        }
    },

    deleteFriend: async (id) => {
        const { accessToken, authUser, setAuthuser } = useAuthStore.getState();
        const { user } = get();
        set({ isDeletingFriend: true });
        try {
            await axiosInstance.delete(`/user/${id}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            if (authUser) {
                const updatedUser = {
                    ...authUser,
                    friends: authUser.friends?.filter(friendId => friendId != id)
                };
                if (user) {
                    const updatedToUser = {
                        ...user,
                        friends: user?.friends?.filter((friendId) => friendId != authUser._id)
                    }
                    set({ user: updatedToUser });
                }
                setAuthuser(updatedUser);
                get().getSuggestedFriends()
            }
        } catch (error) {
            console.log(error);
        } finally {
            set({ isDeletingFriend: false });
        }
    },

    getSuggestedFriends: async () => {
        const { accessToken } = useAuthStore.getState();
        try {
            const res = await axiosInstance.get('/user/suggested-friends', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            set({ suggestedFriends: res.data.users })
        } catch (error) {
            console.log(error);
        }
    },
}));        