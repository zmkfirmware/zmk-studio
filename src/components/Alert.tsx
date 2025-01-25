import { useState, useEffect } from "react";

interface AlertProps {
    message: string;
    duration: number; // Duration in seconds
}

export default function Alert({ message, duration }: AlertProps) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), duration * 1000);
        return () => clearTimeout(timer);
    }, [duration]);

    if (!visible) return null;

    return (
        <div className="toast toast-top toast-end">
            <div className="alert alert-info">
                <span>{message}</span>
            </div>
        </div>
    );
}
