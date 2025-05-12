import { ErrorMessage, Field } from "formik"
import React from "react"

export interface FieldInputProps extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    label?: string;
    placeholder?: string
    classNameContainer?: string;
    endIcon?: React.ReactNode
}

const FieldInput = ({ label, endIcon, name, ...props }: FieldInputProps) => {

    return (
        <div>
            {label && (
                <label htmlFor={name} className="text-gray-700">{label}</label>
            )}

            <Field
                {...props}
                name={name}
                component="input"
                className={`py-2 px-1 border border-gray-200 w-full placeholder-gray-400 ${props.className}`}
            />

            {endIcon}
            <ErrorMessage component="small" name="phoneNumber" className="text-center text-red-800" />
        </div>
    )
}

export default FieldInput;