import { Types } from "mongoose";
import { ChatModel, ChatType } from "~/Models/chat.model";
import { IMemberChat, MemberChatModel } from "~/Models/chat_member";

const getPrivateChatMembersExcludeContacts = async (userId: string): Promise<IMemberChat[]> => {
    return await MemberChatModel.aggregate([
        { $match: { userId } },
        {
            $lookup: {
                from: ChatModel.collection.name,
                localField: 'chatId',
                foreignField: '_id',
                as: 'chat'
            }
        },
        { $unwind: '$chat' },
        { $match: { 'chat.type': ChatType.PRIVATE } },
        {
            $lookup: {
                from: MemberChatModel.collection.name,
                let: { chatId: '$chatId' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$chatId', '$$chatId'] },
                                    { $ne: ['$userId', userId] }
                                ]
                            }
                        }
                    },
                ],
                as: 'memberChat'
            }
        },
        { $unwind: '$memberChat' },
        { $replaceRoot: { newRoot: '$memberChat' } }
    ]);
}

export default {
    getPrivateChatMembersExcludeContacts
}