import { Timestamp } from "@angular/fire/firestore";
import { ProfileUser } from "./user";

export interface Chat {
    id: string;
    lastMessage?: string;
    lastMessageDate?: Date & Timestamp;
    userIds: string[];
    users: ProfileUser[];

    // not stored, only for display
    chatPic?: string;
    chatName?: string;
}

export interface Message {
    text: string;
    senderId: string;
    sentDate: Date & Timestamp;
}