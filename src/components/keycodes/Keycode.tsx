import { CSSProperties, useCallback, useState } from "react"
import { Key } from "react-aria-components"

/**
 * Keycode Component
 * 
 * Represents a single key in the keyboard layout.
 * Supports selection state for multiple key selection functionality.
 * Uses baseKeyValue as a hidden attribute for selection.
 */
interface KeycodeProps {
    value?: number;
    label: string;
    width?: number;
    height?: number;
    x: number;
    y: number;
    baseKeyValue?: number;
    onSelect: (keyCode: number) => void;
    isSelected?: boolean;
}

export default function Keycode({
    value,
    label,
    width = 50,
    height = 50,
    x,
    y,
    baseKeyValue,
    onSelect,
    isSelected = false
}: KeycodeProps) {
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
        onSelect(value);
    };

    return (
        <button
            className={`btn btn-square btn-outline absolute ${isSelected ? 'btn-active' : ''}`}
            style={style}
            dangerouslySetInnerHTML={{ __html: label }}
            value={value}
            data-base-key-value={baseKeyValue}
            onClick={handleClick}
        ></button>
    );
}
