import _ from 'lodash';
import contactRepo from '../Repositories/contact.repository';
import memberChatRepo from '../Repositories/memberChat.repository';
import { IAccount } from '~/Models/account.model';
import accountRepo from '~/Repositories/account.repository';
import { FilterQuery, Types } from 'mongoose';
import { IMemberChat } from '~/Models/chat_member';

const searchUser = async (currentUserId: string, keyword: string) => {
    const regex = new RegExp(keyword, 'i');

    const contacts = await contactRepo.findByUserId(currentUserId);
    const contactUserIds = _.map(contacts, 'contactUserId');
    const contactsMap = _.keyBy(contacts, contact => contact.contactUserId.toString());

    const memberChats = await memberChatRepo.getPrivateChatMembersExcludeContacts(currentUserId);
    const memberChatMap: Record<string, IMemberChat> = _.keyBy(memberChats, memberChat => memberChat.userId.toString());

    const conditions: FilterQuery<IAccount>[] = [
        { _id: { $in: contactUserIds } },
        { _id: { $in: Object.values(memberChatMap), name: regex } }
    ];

    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(keyword)) {
        conditions.push({ email: regex });
    }

    if (/^[0-9+\-().\s]+$/.test(keyword)) {
        conditions.push({ phoneNumber: regex });
    }

    const rawAccounts = await accountRepo.findMany({ _id: { $ne: currentUserId }, $or: conditions });

    const matchedAccounts = rawAccounts.reduce((result, account) => {
        const contact = contactsMap[account._id as string];

        const entry = { ...account } as any;
        if (contact) {
            if (regex.test(contact.name) && !regex.test(account.name) && !regex.test(account.phoneNumber || "") && regex.test(account.email || "")) {
                return result;
            }
            entry.name = contact.name;
        }

        if (memberChatMap[account.id]) {
            entry.chatId = memberChatMap[account.id].chatId;
        }

        return result;
    }, [] as IAccount[]);

    return matchedAccounts;
}