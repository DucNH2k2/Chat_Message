import LoginWithGoogle from "../components/LoginWithGoogle";
import LoginWithPhoneNumber from "../components/LoginWithPhoneNumber";

const Login = () => {

    return (
        <section className="bg-white sm:bg-gray-200 min-h-screen w-screen flex flex-col justify-center items-center">
            <div className="bg-white shadow-none sm:shadow-lg px-8 sm:px-12 w-full xs:w-full sm:w-8/12 md:w-7/12 lg:w-7/12 xl:w-2/6 h-screen sm:h-auto py-8">
                <div className="text-center w-full font-bold text-3xl text-gray-600 p-4">
                    LOGIN
                </div>
                <div className="w-full bg-gray-200 my-3" style={{ height: '1px' }}></div>

                <div className="flex flex-col gap-4 px-0 py-4">
                    <LoginWithPhoneNumber />

                    <div className="my-2 flex flex-row justify-center">
                        <span className="absolute bg-white px-4">or</span>
                        <div className="w-full bg-gray-200 mt-3" style={{ height: '1px' }}></div>
                    </div>

                    <div className="w-full flex flex-col gap-2">
                        <LoginWithGoogle />
                    </div>

                    {/* <div className="w-full flex flex-row justify-end">
                            <a href="#">Forgot password</a>
                        </div> */}
                </div>
            </div>
            <div className="p-4">© DucNH 2025</div>
        </section>
    );
}


export default Login;