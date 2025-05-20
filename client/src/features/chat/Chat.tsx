/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux";
import socketIO, { Socket } from "socket.io-client";
import { RootState } from "~/app/store";
import { getChatDialogs } from "~/services/chat.service";
import { getMessages } from "~/services/message.service";
import { ACCESS_TOKEN, AUTH_PROVIDER, ProviderAccount } from "~/utils/auth";

const formatDistanceToNow = (value: unknown) => {
    const date = new Date(value as Date)
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}
const DialogChat = () => {

    const [dialogs, setDiaLogs] = useState([]);

    useEffect(() => {
        const get = async () => {
            const res = await getChatDialogs();
            setDiaLogs(res.data);
        }

        get()
    }, []);

    return (
        <div className="w-full max-w-md mx-auto mt-6">
            {dialogs.map((dialog, index) => {
                const lastMessage = dialog.lastMessage;

                const user = dialog.chatInfo;
                if (!user) {
                    return null;
                }

                return (
                    <div
                        key={index}
                        className="flex items-center p-4 border-b hover:bg-gray-50 cursor-pointer"
                    >
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover mr-4"
                        />

                        <div className="flex-1">
                            <div className="flex justify-between">
                                <span className="font-semibold">{user.name}</span>
                                <span className="text-sm text-gray-400">
                                    {formatDistanceToNow(lastMessage.createAt)}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600 truncate">{lastMessage.content}</div>
                        </div>

                        {dialog.unreadCount > 0 && (
                            <span className="ml-2 text-xs bg-blue-500 text-white rounded-full px-2 py-0.5">
                                {dialog.unreadCount}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    )
}

function MessageInput({ onSend, socket, chatId }: { chatId: string, socket?: Socket, onSend: (text: string) => void }) {
    const [text, setText] = useState("");
    const [typing, setIsTyping] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim() === "") return;
        onSend(text);
        setText("");
    };

    return (
        <form onSubmit={handleSubmit} className="border-t px-4 py-2 flex">
            <input
                type="text"
                className="flex-1 border rounded-full px-4 py-2 mr-2 focus:outline-none"
                placeholder="Nhập tin nhắn..."
                value={text}
                onChange={(e) => {
                    if (!typing) {
                        setIsTyping(true);
                        socket?.emit("typing:server", { chatId, isTyping: true });
                    }
                    setText(e.target.value)
                }}
                onBlur={() => {
                    setIsTyping(false);
                    socket?.emit("typing:server", { chatId, isTyping: false });
                }}
            />
            <button
                type="submit"
                className="bg-blue-500 text-white rounded-full px-4 py-2 hover:bg-blue-600"
            >
                Gửi
            </button>
        </form>
    );
}

const Chat = () => {
    const { currentAccount } = useSelector((state: RootState) => state.chat);

    const [chatId, setChatId] = useState("");

    const [socket, setSocket] = useState<Socket>();

    const [messages, setMessages] = useState<Array<{ _id: string, content: string, senderId: string, chatId: string, messageType: string, chatType: string }>>([]);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [cursor, setCursor] = useState<string>("");
    const containerRef = useRef<HTMLDivElement>(null);

    const [typing, setTyping] = useState(null);

    const fetchMessages = async (chatId: string) => {
        if (loading || !hasMore) {
            return;
        }

        setLoading(true);
        const res = await getMessages(chatId, cursor)

        const newMessages = res.data.messages;
        setMessages((pre) => [...newMessages.reverse(), ...pre]);

        if (newMessages.length === 0) {
            setHasMore(false);
        } else {
            setCursor(newMessages[0]._id);
        }
        setLoading(false);
    };

    const handleScroll = () => {
        if (!containerRef.current) {
            return;
        }

        if (containerRef.current.scrollTop < 100) {
            fetchMessages(chatId);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        const authProvider = localStorage.getItem(AUTH_PROVIDER) as ProviderAccount;

        const socketIo = socketIO('http://localhost:4000', {
            auth: { token, authProvider }
        });

        setSocket(socketIo)

        socketIo.on('connect', () => {
            console.log('Connected to server');
        });

        socketIo.on("send_message:client", (message) => {
            setMessages(pre => [...pre, message])
        });

        socketIo.on("typing:client", (data) => {
            console.log(123)
            setTyping(data.isTyping ? data : null)
        });

        return () => {
            socketIo.disconnect()
        }
    }, []);

    useEffect(() => {
        if (currentAccount) {
            let chatId = null
            if (currentAccount._id === "6824002ea92e9fce8391b64e") {
                chatId = "682449577ae2251659824dc3";
            } else {
                chatId = "6824002ea92e9fce8391b64e"
            }

            socket?.emit("join_chat", { chatId })
            setChatId(chatId)
            fetchMessages(chatId)
        }
    }, [currentAccount])

    const senMessage = (content: string) => {

        const messageSend = {
            _id: "",
            chatId: chatId,
            chatType: "accounts",
            messageType: "text",
            content: content,
            senderId: currentAccount?._id || ""
        }
        socket?.emit('send_message', messageSend);
        setMessages(pre => [...pre, messageSend])
    }

    return (
        <div className="flex flex-col h-screen max-w-2xl mx-auto border rounded shadow bg-white">
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-4 py-2 space-y-2"
            >
                {loading && <div className="text-center text-sm text-gray-400">Loading...</div>}
                {messages.map((msg) => (
                    <div
                        key={msg._id}
                        className={`flex ${msg.senderId === currentAccount?._id ? "justify-end" : "justify-start"
                            }`}
                    >
                        <div
                            className={`px-4 py-2 rounded-2xl text-sm max-w-xs break-words ${msg.senderId === currentAccount?._id ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}

                {typing && (
                    <p>...người dùng is typing</p>
                )}
            </div>
            <MessageInput onSend={senMessage} socket={socket} chatId={chatId} />
        </div>
    )
}

const Index = () => {
    return (
        <section className="d-flex">
            <DialogChat />

            <Chat />
        </section>
    )
}

export default Index;
