import { Request, Response } from 'express';
import _, { result } from 'lodash';
import { AccountModel, IAccount } from '~/Models/account.model';
import { ChatModel, ChatType } from '~/Models/chat.model';
import { MemberChatModel } from '~/Models/chat_member';
import { ContactModel, IContact } from '~/Models/contact.model';

const search = async (req: Request, res: Response): Promise<void> => {
    const currentUserId = req.account._id;
    const { keyword } = req.body;

    if (!keyword) {
        res.status(400).json({ error: 'Keyword is required' });
        return;
    }

    const regex = new RegExp(keyword, 'i');

    const contacts = await ContactModel.find({ userId: currentUserId });

    const contactsMap = _.keyBy(contacts, contact => contact.contactUserId.toString());
    const contactUserIds = contacts.map(c => c.contactUserId);

    const memberUserIdObjs = await MemberChatModel.aggregate([
        { $match: { userId: currentUserId } },
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
                                    { $ne: ['$userId', currentUserId] }
                                ]
                            }
                        }
                    },
                    { $project: { userId: 1, _id: 0 } }
                ],
                as: 'memberChat'
            }
        },
        { $unwind: '$memberChat' },
        { $match: { 'memberChat.userId': { $nin: contactUserIds } } },
        { $replaceRoot: { newRoot: '$memberChat' } }
    ]);
    const memberUserIds = memberUserIdObjs.map(obj => obj.userId);

    // Tìm các account phù hợp
    const accounts = await AccountModel.find({
        _id: { $ne: currentUserId },
        $or: [
            { email: regex, _id: { $ne: contactUserIds } },
            { phoneNumber: regex, _id: { $ne: contactUserIds } },
            { name: regex, _id: { $in: memberUserIds } },
            { _id: { $in: contactUserIds } }
        ]
    }).limit(50); // giới hạn kết quả để tăng hiệu suất

    // Lọc kết quả nếu là contact thì phải match theo contact.name
    const results = accounts.reduce((result, account) => {
        const contact = contactsMap[account._id.toString()];
        if (contact) {
            if (regex.test(contact.name)) {
                result.push(account); // match theo contact.name
            }
        } else {
            result.push(account); // match theo account.name/email/phone
        }
        return result;
    }, [] as IAccount[]);

    res.json(results);
};

