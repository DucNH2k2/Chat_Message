import React from "react";
import FieldInput, { FieldInputProps } from "./FieldInput";

const PhoneNumberInput = (props: FieldInputProps) => {

    const handleKeyDown = (evt: React.KeyboardEvent<HTMLInputElement> & { returnValue: boolean }) => {
        const theEvent = evt || window.event;

        const accessKey = ["ArrowLeft", "ArrowDown", "ArrowRight", "ArrowUp", "Backspace", "Tab", "Enter"];
        const accessKeyCtrl = ["a", "A", "c", "C", "v", "V", "x", "X", "z", "Z"]

        if (accessKey.includes(theEvent.key) || (theEvent.ctrlKey && accessKeyCtrl.includes(theEvent.key))) {
            theEvent.returnValue = true;
            return;
        }

        if (!/^\d+$/.test(theEvent.key)) {
            theEvent.returnValue = false;
            if (theEvent.preventDefault) theEvent.preventDefault();
        }
    };

    return (
        <FieldInput {...props} type="string" onKeyDown={handleKeyDown} />
    )
}

export default PhoneNumberInput;