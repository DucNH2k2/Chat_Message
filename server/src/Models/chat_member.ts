import { Document, model, Schema, Types } from "mongoose";
import { ChatModel } from "./chat.model";
import { AccountModel } from "./account.model";

export enum ChatMemberRole {
    OWNER = "owner",
    ADMIN = "admin",
    MEMBER = "member"
}

export interface IMemberChat extends Document {
    chatId: Types.ObjectId;
    userId: Types.ObjectId;
    role: ChatMemberRole;
    addedBy: Types.ObjectId;
    nickname: string;
    joinedAt?: Date;
    readInboxMaxTime: number;
    readOutboxMaxTime: number;
    updatedAt: number,
}

const MemberChatSchema = new Schema<IMemberChat>({
    chatId: {
        type: Schema.Types.ObjectId,
        ref: ChatModel.modelName,
        required: true,

    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: AccountModel.modelName,
        required: true,
    },
    role: {
        type: String,
        enum: Object.values(ChatMemberRole),
        default: ChatMemberRole.MEMBER,
    },
    addedBy: {
        type: Schema.Types.ObjectId,
        ref: AccountModel.modelName
    },
    joinedAt: {
        type: Date
    },
    readInboxMaxTime: {
        type: Number,
        default: Date.now()
    },
    readOutboxMaxTime: {
        type: Number,
        default: Date.now()
    },
    updatedAt: {
        type: Number,
        default: Date.now()
    }
});

export const MemberChatModel = model<IMemberChat>("MemberChat", MemberChatSchema);