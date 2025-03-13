import { CSSProperties, useState } from 'react';

interface KeycodeProps {
    id?: number;
    label: string;
    width?: number;
    height?: number;
    x: number;
    y: number;
    keyCode: string;
    onSelect: (keyCode: string) => void;
}

export default function Keycode({
    label,
    width = 50,
    height = 50,
    x,
    y,
    keyCode,
    onSelect
}: KeycodeProps) {
    const [isSelected, setIsSelected] = useState(false);
    const keySize = 50;

    const style: CSSProperties = {
        position: 'absolute',
        top: `${y * keySize}px`,
        left: `${x * keySize}px`,
        width: `${width - 2}px`,
        height: `${height - 2}px`,
        overflow: 'hidden',
        border: isSelected ? '2px solid blue' : '1px solid gray'
    };

    const handleClick = () => {
        setIsSelected(true);
        onSelect(keyCode);
    };

    return (
        <button
            className={`btn btn-square btn-outline absolute ${isSelected ? 'btn-active' : ''}`}
            style={style}
            dangerouslySetInnerHTML={{ __html: label }}
            value={keyCode}
            onClick={handleClick}
        ></button>
    );
}
