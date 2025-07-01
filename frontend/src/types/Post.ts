import type { RefObject } from "react";
import type { IUser } from "./Auth";

export interface ISendPostData {
    image?: File | null,
    text?: string
}

interface UserComment {
    _id: string,
    name: string,
    profilePic: string,
}

export interface IComments {
    _id: string
    user: UserComment,
    text: string,
    createdAt: string
    postId?: string,
    notificationId?: string
}

export interface IPosts {
    _id: string,
    bookmarks: string[],
    likes: string[],
    comments: IComments[],
    createdAt: string,
    image?: string,
    text?: string,
    userId: IUser,
    notificationId?: string
}

interface ISendComment {
    postId: string,
    text: string
}

export interface PostState {
    isSendingPost: boolean;
    isDeletingPost: boolean;
    isUpdatingPost: boolean;
    isBookMarke: boolean;
    isDeletingComment: boolean;
    isSendingComment: boolean;
    totalPages: number;
    notificationsCount: number;
    page: number;
    totalLikes: number;
    post: IPosts | null;
    myPostToUpdate: IPosts | null;
    myPosts: IPosts[] | [],
    friendPosts: IPosts[] | [],
    bookMarks: IPosts[] | [],
    targetRef: RefObject<HTMLDivElement | null> | null,
    setTargetRef: (ref: RefObject<HTMLDivElement | null>) => void;
    sendPost: (data: ISendPostData) => Promise <boolean>; 
    updatePost: (data: ISendPostData) => Promise <boolean>;
    setNotificationsCount: (count: number) => void;
    setIsUpdatingPost: (state: boolean) => void;
    setPage: (count: number) => void;
    setMyPostToUpdate: (post: IPosts | null) => void;
    getMyPosts: () => void; 
    deletePost: (postId: string) => void;
    toggleLike: (postId: string) => void;
    setTotalLikes: (count: number) => void;
    sendComment: (data: ISendComment) => Promise<boolean>;
    deleteComment: (postId: string, commentId: string) => void;
    updateComment: (postId: string | null, commentId: string | null, text: string) => Promise<boolean>;
    postNotifications: IPosts[],
    commentNotification: IComments[],
    getPost: (id: string) => void;
    toggleBookMark: (postId: string) => void;
    getBookMarks: () => void;
    getFriendPosts: () => void;
    searchPost: (text: string) => void;
} 
