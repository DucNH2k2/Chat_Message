import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "~/app/store.ts";
import { RouterProvider } from "react-router-dom";
import { router } from "~/app/router.ts"
import "~/main.css";

createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
        <RouterProvider router={router} />
    </Provider>
)
