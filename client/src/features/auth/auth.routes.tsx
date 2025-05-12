import { redirect, RouteObject } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Index from "./Index";
import { ACCESS_TOKEN } from "~/utils/auth";

const authRouter: RouteObject[] = [
    {
        path: "auth",
        Component: Index,
        loader: () => {
            const token = localStorage.getItem(ACCESS_TOKEN);
            if (token) {
                return redirect("/chat");
            }
            
            return null;
        },
        children: [
            {
                path: "login",
                Component: Login,
            },
            {
                path: 'register',
                Component: Register
            }
        ]
    }
];

export default authRouter;