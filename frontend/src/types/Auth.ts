import type { Socket } from "socket.io-client";

interface ISignupData {
    name: string,
    email: string,
    password: string,
    password_confirmation: string
}

interface ILoginData {
    email: string,
    password: string,
}

interface IErrors {
    name?: string[] | null,
    email?: string[] | null,
    password?: string[] | null,
    password_confirmation?: string[] | null,
    token?: boolean
}

interface IProfileData {
    name: string,
    bio: string | null
}

export interface IUser {
    _id: string,
    name: string,
    email: string,
    profilePic: string | undefined,
    bio: string | undefined,
    friends: string[],
    likes: string[],
    lastSeen?: Date;
};

interface IReturnLogin {
    success: boolean,
    notVerified?: boolean
};

interface IResetPassword {
    password: string,
    password_confirmation: string,
    token: string | null
};

export interface AuthState {
    authUser: null | IUser;
    errors: null | IErrors;
    socket: null | Socket;
    onlineUsers: string[];
    isSigningUp: boolean;
    isVerifing: boolean;
    isSendCode: boolean;
    isLoginig: boolean;
    isEditingProfile: boolean,
    isResitingPassword: boolean;
    isForgetingPassword: boolean;
    accessToken: string | null;
    refreshToken: () => void;
    setIsSendCode: (q: boolean) => void;
    setAccessToken: (q: string) => void;
    sendCode: () => Promise<boolean | undefined>;
    signUp: (data: ISignupData) => Promise<boolean | undefined>;
    login: (data: ILoginData) => Promise<IReturnLogin | undefined>;
    verifyCode: (code: string | undefined) => Promise<boolean | undefined>;
    forgetPassword: (email: string) => void;
    editProfile: (data: IProfileData) => Promise<boolean | undefined>;
    connectSocket: () => void;
    disconnectSocket: () => void;
    editProfileImage: (file: File) => void;
    logout: () => Promise<boolean | undefined>;
    resetPassword: (data: IResetPassword) => Promise<boolean | undefined>
    setAuthuser: (data: IUser) => void,
}
