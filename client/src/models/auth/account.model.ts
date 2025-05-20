class Account {
    _id: string = "";
    name: string = "";
    email?: string = "";
    phoneNumber?: string;
    password?: string;
    confirmPassword?: string;
}

export class RegisterAccount {
    phoneNumber: string = "";
    otp: string = "";
    password: string = "";
    confirmPassword: string = "";
    name: string = ""
}

export default Account;