import type { IUser } from "./Auth";

export interface IMessages {
    _id: string,
    reciever: IUser,
    sender: IUser,
    message: string
    createdAt: string,
}

export interface MessageState {
    isSendingMessage: boolean,
    messagesNotification: number,
    messages: IMessages[] | [],
    setMessagesNotification: (count: number)  => void;
    getMessages: (id: string | undefined) => void;
    sendMessage: (data: { recieverId: string | undefined, message: string }) => Promise<boolean | undefined>;
}