import { useRef, useState } from "react";

export const useCountdown = (initialTime: number): [number, (time: number) => void] => {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

    const start = (time: number) => {
        setTimeLeft(time);
        clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    return 0;
                }

                return prev - 1;
            });
        }, 1000);
    };

    return [timeLeft, start];
};