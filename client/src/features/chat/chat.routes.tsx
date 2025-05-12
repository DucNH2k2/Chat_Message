import { redirect, RouteObject } from "react-router-dom";
import Index from "./Index";
import { ACCESS_TOKEN } from "~/utils/auth";

const chatRouter: RouteObject[] = [
    {
        path: "chat",
        Component: Index,
        loader: () => {
            const token = localStorage.getItem(ACCESS_TOKEN);
            if (!token) {
                return redirect("/auth/login");
            }

            return null;
        },
        children: [

        ]
    }
];

export default chatRouter;