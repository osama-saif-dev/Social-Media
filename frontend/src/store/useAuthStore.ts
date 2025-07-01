import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import type { AuthState } from "../types/Auth";
import axios from "axios";
import Cookies from 'js-cookie'
import toast from "react-hot-toast";
import { io, Socket } from 'socket.io-client';

const BASE_URL = import.meta.env.MODE === 'development' ? 'http://localhost:5000' : '/';

export const useAuthStore = create<AuthState>((set, get) => ({
    errors: null,
    socket: null,
    authUser: null,
    accessToken: null,
    isSigningUp: false,
    isVerifing: false,
    isLoginig: false,
    isSendCode: false,
    isEditingProfile: false,
    isResitingPassword: false,
    isForgetingPassword: false,
    onlineUsers: [],
    setIsSendCode: (q) => set({ isSendCode: q }),
    setAuthuser: (data) => set({ authUser: data }),
    setAccessToken: (data) => set({ accessToken: data }),
    
    signUp: async (data) => {
        set({ isSigningUp: true })
        try {
            const res = await axiosInstance.post('/auth/signup', data);
            const { accessToken, message } = res.data;
            Cookies.set('access_token', accessToken);
            set({ errors: null, isSendCode: true });
            toast.success(message);
            return true;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errors = error?.response?.data?.errors;
                set({ errors: errors });
                return false;
            }
        } finally {
            set({ isSigningUp: false })
        }
    },

    sendCode: async () => {
        try {
            const res = await axiosInstance.get('/auth/send-code', {
                headers: {
                    Authorization: `Bearer ${Cookies.get('access_token')}`
                }
            });
            toast.success(res.data.message);
            return true;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const expiredError = error?.response?.data?.message;
                if (expiredError) {
                    toast.error('Expired Token Please Login Again');
                    set({
                        errors: {
                            token: false,
                        }
                    })
                }
                return false;
            }
        }
    },

    verifyCode: async (code) => {
        try {
            const res = await axiosInstance.post('/auth/verify-code', { code }, {
                headers: {
                    Authorization: `Bearer ${Cookies.get('access_token')}`
                }
            });
            const { message, accessToken, user } = res.data;
            toast.success(message);
            set({ accessToken: accessToken, authUser: user });
            get().connectSocket();
            return true;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error?.response?.data?.message);
                return false;
            }
        }
    },

    refreshToken: async () => {
        try {
            const res = await axiosInstance.get('/auth/refresh-token');
            const { accessToken, user } = res.data;
            set({ accessToken: accessToken, authUser: user });
            get().connectSocket();
        } catch (error) {
            console.log(error);
        }
    },

    login: async (data) => {
        set({ isLoginig: true });
        try {
            const res = await axiosInstance.post('/auth/login', data);
            const { accessToken, user } = res.data
            set({ accessToken: accessToken, authUser: user });
            toast.success('Login Successfully');
            get().connectSocket();
            return { success: true };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errors = error?.response?.data?.errors;
                if (errors) set({ errors: errors });
                const message = error?.response?.data?.message;
                const accessToken = error?.response?.data?.accessToken;
                if (message) toast.error(message);
                if (message && accessToken) {
                    Cookies.set('access_token', accessToken);
                    return { success: false, notVerified: true };
                }
                return { success: false, notVerified: false };
            }
        } finally {
            set({ isLoginig: false })
        }
    },

    logout: async () => {
        const { disconnectSocket } = get();
        try {
            await axiosInstance.get('/auth/logout', {
                headers: {
                    Authorization: `Bearer ${get().accessToken}`
                }
            });
            toast.success('Logout Successfully');
            disconnectSocket();
            set({ authUser: null, accessToken: null });
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    },

    forgetPassword: async (email) => {
        set({ isForgetingPassword: true });
        try {
            const res = await axiosInstance.post('/auth/forget-password', { email });
            toast.success(res.data.message);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const emailError = error?.response?.data?.errors?.email;
                if (emailError) set({
                    errors: {
                        email: emailError
                    }
                });
                const message = error?.response?.data?.message;
                if (message) toast.error(message);
            }
        } finally {
            set({ isForgetingPassword: false });
        }
    },

    resetPassword: async (data) => {
        set({ isForgetingPassword: true });
        try {
            const res = await axiosInstance.post('/auth/reset-password', data);
            toast.success(res.data.message);
            return true;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errors = error?.response?.data?.errors;
                if (errors) set({ errors: errors });
                console.log(error);
                return false;
            }
        } finally {
            set({ isForgetingPassword: false });
        }
    },

    connectSocket: () => {
        const { authUser, socket } = get();
        if (!authUser || socket?.connected) return;

        const newSocket: Socket = io(BASE_URL, {
            query: {
                userId: authUser._id
            }
        });

        newSocket.connect();
        set({ socket: newSocket });

        newSocket.on('getOnlineUsers', (userIds) => {
            set({ onlineUsers: userIds })
        })
    },

    disconnectSocket: () => {
        if (get().socket?.connected) get().socket?.disconnect()
    },

    editProfile: async (data) => {
        const { accessToken } = get();
        set({ isEditingProfile: true });
        try {
            const res = await axiosInstance.patch('/user/profile', data, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
            const { message, user } = res.data;
            set({ authUser: user });
            toast.success(message);
            set({ errors: null });
            return true;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errors = error?.response?.data?.errors?.name;
                if (errors) set({
                    errors: {
                        name: errors
                    }
                });
                return false;
            }
        } finally {
            set({ isEditingProfile: false });
        }
    },

    editProfileImage: async (file) => {
        const { accessToken } = get();
        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await axiosInstance.patch('/user/profile-image', formData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "multipart/form-data",
                }
            });
            const { user } = res.data;
            set({ authUser: user });
            toast.success('Updated Successfully');
        } catch (error) {
            console.log(error);
        }
    },

}));
