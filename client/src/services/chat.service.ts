import axiosInstance from "./axiosInstance"

export const getChatDialogs = () => {
    return axiosInstance.get("/chat/dialogs");
}