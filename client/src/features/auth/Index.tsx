import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import { RootState } from "~/app/store";

const Index = () => {
    const { loading } = useSelector((state: RootState) => state.auth);

    return (
        <>
            {loading && (
                <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/16">
                    <div className="loader-full_screen"></div>
                </div>
            )}

            <Outlet />
        </>
    )
}

export default Index;