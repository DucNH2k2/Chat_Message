import { model, Schema } from "mongoose";
import { ChatModel } from "./chat.model";
import { AccountModel } from "./account.model";
import { MessageType } from "../Utils/chat";

export interface IMessage extends Document {
    chatId: Schema.Types.ObjectId;
    senderId: Schema.Types.ObjectId;
    messageType: MessageType;
    content: any;
    createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
    chatId: {
        type: Schema.Types.ObjectId,
        ref: ChatModel.modelName,
        required: true,
    },
    senderId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: AccountModel.modelName
    },
    messageType: {
        type: String,
        enum: Object.values(MessageType),
        required: true,
    },
    content: {
        type: Schema.Types.Mixed,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
}, {
    timestamps: true
});

export const MessageModel = model<IMessage>('Message', MessageSchema);