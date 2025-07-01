import { axiosInstance } from "@/lib/axios";
import type { MessageState } from "@/types/Message";
import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import axios from "axios";
import notificationLiveChat from '@/assets/notification-likes.mp3';
import toast from "react-hot-toast";

export const useMessageStore = create<MessageState>((set, get) => ({
    isSendingMessage: false,
    messages: [],
    messagesNotification: Number(localStorage.getItem('notificationMessage')) || 0,
    setMessagesNotification: (count) => {
        localStorage.setItem('notificationMessage', count.toString());
        set({ messagesNotification: count })
    },

    getMessages: async (id) => {
        const { accessToken } = useAuthStore.getState();
        try {
            const res = await axiosInstance.get(`/message/${id}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const { messages } = res.data;
            set({ messages });
        } catch (error) {
            console.log(error);
        }
    },

    sendMessage: async (data) => {
        const { accessToken } = useAuthStore.getState();
        const { messages } = get();
        set({ isSendingMessage: true });
        try {
            const res = await axiosInstance.post('/message', data, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const { userMessage } = res.data;
            set({ messages: [...messages, userMessage] });
            new Audio(notificationLiveChat).play().catch((err) => console.log(err));
            return true;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errors = error?.response?.data?.message;
                if (errors) toast.error(errors);
                return false;
            }
            return false;
        } finally {
            set({ isSendingMessage: false });
        }
    },

}));

