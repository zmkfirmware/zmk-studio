import { CSSProperties } from "react";

interface KeycodeProps {
  id?: number;
  label: string;
  width?: number;
  height?: number;
  x: number;
  y: number;
}

export default function Keycode({
  label,
  width = 50,
  height = 50,
  x,
  y,
}: KeycodeProps) {
  const keySize = 50
  const style: CSSProperties = {
    position: "absolute",
    top: `${y * keySize}px`,
    left: `${x * keySize}px`,
    width: `${width - 2}px`,
    height: `${height - 2}px`,
    overflow: "hidden",
  };

  return (
    <button
      className="btn btn-square btn-outline absolute"
      style={style}
      dangerouslySetInnerHTML={{ __html: label }}
    ></button>
  );
}
