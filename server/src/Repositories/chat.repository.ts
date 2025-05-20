import { Types } from "mongoose";
import { DialogModel } from "~/Models/dialog.model";
import { MessageModel } from "~/Models/Message.model";

const getDialogByUser = async (userId: string) => {
    const dialogsWithLastMessage = await DialogModel.aggregate([
        {
            $match: {
                userId: new Types.ObjectId(userId)
            },
        },
        {
            $lookup: {
                from: MessageModel.collection.name,
                localField: 'topMessageId',
                foreignField: 'messageId',
                as: 'lastMessage'
            }
        },
        {
            $unwind: {
                path: '$lastMessage',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                peerType: 1,
                chatId: 1,
                unreadCount: 1,
                draft: 1,
                notificationsMuted: 1,
                lastMessage: 1
            }
        }
    ]);

    return dialogsWithLastMessage;
}