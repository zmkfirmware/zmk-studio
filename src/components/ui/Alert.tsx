import { useState, useEffect } from "react";
import {  } from 'react-dom';

interface AlertProps {
    message: string;
    duration: number;
    container: HTMLElement;
}

export default function Alert({ message, duration, container }: AlertProps) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
        }, duration * 1000);

        return () => clearTimeout(timer);
    }, [duration]);

    useEffect(() => {
        if (!visible) {
            document.body.removeChild(container);
        }
    }, [visible, container]);

    if (!visible) return null;

    return (
        <div className="toast toast-top toast-end z-[99999]">
            <div className="alert alert-error">
                <span className="text-white">{message}</span>
            </div>
        </div>
    );
}