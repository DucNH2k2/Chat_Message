import axiosInstance from "./axiosInstance";

export const getMessages = (chatId: string, cursor: string = "", limit: number = 20) => {
    return axiosInstance.get("/chat/messages", {
        params: {
            chatId,
            cursor,
            limit
        }
    });
}

