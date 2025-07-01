import type { IUser } from "./Auth";
import type { IPosts } from "./Post";

export interface UserState {
    user: IUser | null,
    friends: IUser[] | [],
    isDeletingFriend: boolean;
    getUser: (id: string | undefined) => void;
    getFriends: () => void;
    setUser: (data: IUser) => void;
    deleteFriend: (id: string) => void;
    userPosts: IPosts[],
    suggestedFriends: IUser[] | [],
    getSuggestedFriends: () => void;
    setSuggestedFriends: (data: IUser[] | []) => void;
}