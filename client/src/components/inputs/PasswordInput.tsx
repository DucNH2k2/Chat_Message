import { useState } from "react";
import FieldInput, { FieldInputProps } from "./FieldInput";

const PasswordInput = (props: FieldInputProps) => {
    const [isVisible, setVisible] = useState(false);

    const toggle = () => {
        setVisible(!isVisible);
    };

    return (
        <FieldInput
            {...props}
            type={!isVisible ? "password" : "type"}
            className="pr-10"
            endIcon={
                <span onClick={toggle} className="cursor-pointer font-medium text-2xl text-gray-600 absolute p-2.5 px-3 w-11 -translate-x-10">
                    {
                        isVisible ? (
                            <svg viewBox="0 0 24 24" fill="none">
                                <g strokeWidth="0"></g>
                                <g strokeLinecap="round" strokeLinejoin="round"></g>
                                <g>
                                    <path d="M4 12C4 12 5.6 7 12 7M12 7C18.4 7 20 12 20 12M12 7V4M18 5L16 7.5M6 5L8 7.5M15 13C15 14.6569 13.6569 16 12 16C10.3431 16 9 14.6569 9 13C9 11.3431 10.3431 10 12 10C13.6569 10 15 11.3431 15 13Z" stroke="#464455" strokeLinecap="round" strokeLinejoin="round"></path>
                                </g>
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none">
                                <g strokeWidth="0"></g>
                                <g strokeLinecap="round" strokeLinejoin="round"></g>
                                <g>
                                    <path d="M4 10C4 10 5.6 15 12 15M12 15C18.4 15 20 10 20 10M12 15V18M18 17L16 14.5M6 17L8 14.5" stroke="#464455" strokeLinecap="round" strokeLinejoin="round"></path>
                                </g>
                            </svg>
                        )
                    }
                </span>
            }
        />
    )
}

export default PasswordInput;