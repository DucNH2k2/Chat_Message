import { Document, model, Schema, Types } from "mongoose";
import { AccountModel } from "./account.model";

export enum ChatType {
    PRIVATE = "private", // chat 1-1
    GROUP = "group"      // chat group
}

export interface IChat extends Document {
    type: ChatType;
    name: String;
    avatarUrl: String;
    createdBy: Types.ObjectId;
    createdAt: Date;
}

const ChatSchema = new Schema<IChat>({
    type: {
        type: String,
        enum: Object.values(ChatType),
        required: true
    },
    name: {
        type: String,
        required: function (this: IChat) {
            return this.type === ChatType.GROUP;
        },
        default: null
    },
    avatarUrl: {
        type: String,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: AccountModel.modelName,
        required: true
    }
}, {
    timestamps: true
});


export const ChatModel = model<IChat>('Chat', ChatSchema);
