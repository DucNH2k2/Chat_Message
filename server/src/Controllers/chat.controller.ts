import { Request, Response } from "express";
import { DialogModel } from "../Models/dialog.model";
import mongoose from "mongoose";
import { MessageModel } from "../Models/message.model";
import { AccountModel } from "../Models/account.model";
import { GroupModel } from "../Models/group.model";

export const getChatDialogs = async (req: Request, res: Response) => {
    const dialogsWithInfo = await DialogModel.aggregate([
        { $match: { userId: req.account._id } },

        // Lấy thông tin chatId tương ứng chatType
        {
            $lookup: {
                from: AccountModel.collection.name,         // collection accounts (user chat 1-1)
                localField: 'chatId',
                foreignField: '_id',
                as: 'chatUser',
                pipeline: [
                    { $project: { _id: 1, name: 1, avatar: 1 } }
                ]
            }
        },
        {
            $lookup: {
                from: GroupModel.collection.name,           // collection groups
                localField: 'chatId',
                foreignField: '_id',
                as: 'chatGroup',
                pipeline: [
                    { $project: { _id: 1, name: 1, avatar: 1 } }
                ]
            }
        },

        // Gộp thông tin chatUser hoặc chatGroup vào field chatInfo
        {
            $addFields: {
                chatInfo: {
                    $cond: [
                        { $eq: ['$chatType', 'accounts'] },
                        { $arrayElemAt: ['$chatUser', 0] },
                        { $arrayElemAt: ['$chatGroup', 0] }
                    ]
                }
            }
        },

        { $project: { chatUser: 0, chatGroup: 0 } },

        // Lấy tin nhắn cuối cùng
        {
            $lookup: {
                from: 'messages',
                let: { chatId: '$chatId', chatType: '$chatType' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$chatId', '$$chatId'] },
                                    { $eq: ['$chatType', '$$chatType'] }
                                ]
                            }
                        }
                    },
                    { $sort: { createAt: -1 } },
                    { $limit: 1 }
                ],
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
            $sort: {
                "lastMessage.createAt": -1
            }
        }
    ]);

    res.status(200).json(dialogsWithInfo);
}

export const getMessages = async (req: Request, res: Response) => {
    const account = req.account;

    const { chatId, limit = 20, cursor } = req.query;

    if (!chatId) {
        res.status(400).json({ error: 'chatId is required' });
        return
    }

    const query: any = {
        chatType: 'Account',
        $or: [
            { chatId: chatId, senderId: account._id },
            { chatId: account._id, senderId: chatId }
        ]
    };

    if (cursor) {
        // Giả sử cursor là ObjectId cũ nhất hiện tại
        query._id = { $lt: new mongoose.Types.ObjectId(cursor as string) };
    }

    const messages = await MessageModel.find(query)
        .sort({ createAt: 1 }) // Lấy các tin nhắn mới nhất trước
        .limit(Number(limit));

    const nextCursor = messages.length > 0 ? messages[messages.length - 1]._id : null;

    res.json({
        messages,
        nextCursor,
        hasMore: messages.length === Number(limit),
    });

}

const dialogs = await DialogModel.aggregate([
  {
    $match: {
      userId:
        new ObjectId(currentUserId)
    }
  },

  {
    $lookup: {
      from: 'messages',
      let: { chatId: '$chatId' },
      pipeline: [
        { $match: { $expr: { $eq: ['$chatId', '$$chatId'] } } },
        { $sort: { createdAt: -1 } },
        { $limit: 1 }
      ],
      as: 'lastMessage'
    }
  },

  { $unwind: { path: '$lastMessage', preserveNullAndEmptyArrays: true } },

  // Thêm bước đếm số message chưa đọc
  {
    $lookup: {
      from: 'messages',
      let: { chatId: '$chatId', readMax: '$readInboxMaxTime', userId: '$userId' },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$chatId', '$$chatId'] },
                { $gt: ['$createdAt', '$$readMax'] },
                { $ne: ['$senderId', '$$userId'] }
              ]
            }
          }
        },
        { $count: 'count' }
      ],
      as: 'unreadCountArr'
    }
  },

  {
    $addFields: {
      unreadCount: {
        $ifNull: [{ $arrayElemAt: ['$unreadCountArr.count', 0] }, 0]
      }
    }
  },
{
  $lookup: {
    from: 'usernicknames',
    let: { ownerId: new ObjectId(currentUserId), mentionedIds: '$lastMessage.mentionedUserIds' },
    pipeline: [
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ['$ownerUserId', '$$ownerId'] },
              { $in: ['$targetUserId', '$$mentionedIds'] }
            ]
          }
        }
      }
    ],
    as: 'mentionedNicknames'
  }
},

{
  $lookup: {
    from: 'accounts',
    localField: 'lastMessage.mentionedUserIds',
    foreignField: '_id',
    as: 'mentionedUsers'
  }
},

// Tạo mảng tên hiển thị theo thứ tự của mentionedUserIds
{
  $addFields: {
    'lastMessage.mentionedUsersDisplayNames': {
      $map: {
        input: '$lastMessage.mentionedUserIds',
        as: 'mentionedId',
        in: {
          $let: {
            vars: {
              nickname: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: '$mentionedNicknames',
                      as: 'n',
                      cond: { $eq: ['$$n.targetUserId', '$$mentionedId'] }
                    }
                  },
                  0
                ]
              },
              user: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: '$mentionedUsers',
                      as: 'u',
                      cond: { $eq: ['$$u._id', '$$mentionedId'] }
                    }
                  },
                  0
                ]
              }
            },
            in: {
              $ifNull: ['$$nickname.nickname', '$$user.name']
            }
          }
        }
      }
    }
  }
}
  { $project: { unreadCountArr: 0 } }, // loại bỏ trường phụ không cần thiết

  { $sort: { 'lastMessage.createdAt': -1 } }, // Nếu cần sort theo tin nhắn cuối
  { $limit: 20 }
]);