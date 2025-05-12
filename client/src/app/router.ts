import { createBrowserRouter, redirect } from "react-router-dom";
import authRouter from "~/features/auth/auth.routes";
import chatRouter from "~/features/chat/chat.routes";
import { ACCESS_TOKEN } from "~/utils/auth";

export const router = createBrowserRouter([
    ...authRouter,
    ...chatRouter,
    {
        path: "*",
        loader: () => {
            const token = localStorage.getItem(ACCESS_TOKEN);
            if (token) {
                return redirect("/chat");
            }

            return redirect("/auth/login");
        }
    },
]);
