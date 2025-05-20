import { authenticateSocket } from "../Middlewares/authenticateSocket";
import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { IAccount } from "../Models/account.model";
import { redisClient } from "./redis";
import { MessageModel } from "../Models/message.model";
import { ChatType } from "../Utils/chat";
import { DialogModel } from "../Models/dialog.model";

export let socketIO: Server;

export const setupSocketIO = (server: HttpServer) => {
    socketIO = new Server(server, {
        cors: {
            origin: "*"
        }
    });

    socketIO.use(authenticateSocket);
    console.log("Set up socket.io")

    socketIO.on('connection', async (socket) => {
        const account: IAccount = socket.data.account;

        const key = `user_sockets:${account._id}`;
        await redisClient.sAdd(key, socket.id);

        console.log(`User ${account._id} connected: ${socket.id}`);

        socket.on('disconnect', async () => {
            const remaining = await redisClient.sCard(key);
            console.log(`User ${account._id} disconnected: ${socket.id}`);

            if (remaining === 0) {
                await redisClient.del(key);
                return;
            }

            await redisClient.sRem(key, socket.id);
        });

        socket.on("join_chat", async (data) => {
            if (data.preChatId) {
                socket.leave(data.preChatId);
            }

            socket.join(data.chatId);
        })

        socket.on("typing:server", (data) => {
            socketIO.to(data.chatId).emit("typing:client", {
                userId: account._id,
                chatId: data.chatId,
                isTyping: data.isTyping,
            });
        })

        socket.on("send_message", async (data) => {
            const message = await MessageModel.create({
                chatId: data.chatId,
                chatType: data.chatType,
                senderId: account._id,
                messageType: data.messageType,
                content: data.content,
            });

            let diaLog = await DialogModel.exists({ userId: account._id });
            if (!diaLog) {
                await DialogModel.create({
                    userId: account._id,
                    chatType: data.chatType,
                    chatId: data.chatId,
                });

                if (message.chatType === ChatType.USER) {
                    await DialogModel.create({
                        userId: data.chatId,
                        chatType: data.chatType,
                        chatId: account._id,
                    });
                }
            }

            const userSockets: Array<string> = [];

            let dialogs: any = [];
            if (data.chatType === ChatType.USER) {
                dialogs = await DialogModel.find({ userId: data.chatId });
            } else {
                dialogs = await DialogModel.find({ chatId: data.chatId });
            }

            for (const dialog of dialogs) {
                const socketIds = await redisClient.sMembers(`user_sockets:${dialog.userId}`);
                userSockets.push(...socketIds)
            }

            const set = new Set(userSockets)
            set.delete(socket.id)

            set.forEach((socketId) => {
                socketIO.to(socketId).emit("send_message:client", message.toObject())
            });
        });

        socket.on("read_outbox_message:server", async (data) => {
            const now = Date.now();

            await DialogModel.updateMany({
                userId: account._id,
                chatId: { $in: data.chatIds }
            }, {
                $set: {
                    readOutboxMaxTime: now
                }
            });

            for (const chatId of data.chatIds) {
                socketIO.to(chatId).emit("read_outbox_message:client", { chatId, readTime: now });
            }
        });

        socket.on("read_inbox_message:server", async (data) => {
            const now = Date.now();

            const dialog = await DialogModel.findOne({ userId: account._id, chatId: data.chatId });
            if (!dialog) {
                return;
            }

            dialog.readInboxMaxTime = now;
            dialog.save()

            const socketIds = await redisClient.sMembers(`user_sockets:${account._id}`);

            socketIds.forEach((socketId) => {
                socketIO.to(socketId).emit("read_inbox_message:client", { chatId: data.chatId })
            });

            socketIO.to(data.chatId).except(socketIds)
                .emit("read_inbox_message:client", { userId: account._id });
        });
    });
};


// await DialogModel.updateOne(
//     {
//         userId: account._id,
//         chatId,
//         lastReadAt: { $lt: now },
//     },
//     {
//         $set: { lastReadAt: now },
//     }
// );