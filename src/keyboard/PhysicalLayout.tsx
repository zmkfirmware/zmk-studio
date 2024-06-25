import { PropsWithChildren } from "react";
import { Key } from "./Key";
import { scale } from "./geometry";

type KeyPosition = PropsWithChildren<{
  header: string;
  width: number;
  height: number;
  x: number;
  y: number;
}>;

interface PhysicalLayoutProps {
  positions: Array<KeyPosition>;
  selectedPosition?: number;
  onPositionClicked?: (position: number) => void;
}

interface PhysicalLayoutPositionLocation {
  x: number;
  y: number;
}

function scalePosition({ x, y }: PhysicalLayoutPositionLocation): {
  top: number;
  left: number;
} {
  x = scale(x);
  y = scale(y);

  return {
    top: y,
    left: x,
  };
}

export const PhysicalLayout = ({
  positions,
  selectedPosition,
  onPositionClicked,
  ...props
}: PhysicalLayoutProps) => {
  // TODO: Add a bit of padding for rotation when supported
  let rightMost = positions
    .map((k) => k.x + k.width)
    .reduce((a, b) => Math.max(a, b), 0);
  let bottomMost = positions
    .map((k) => k.y + k.height)
    .reduce((a, b) => Math.max(a, b), 0);

  const positionItems = positions.map((p, idx) => (
    <div
      key={idx}
      onClick={() => onPositionClicked?.(idx)}
      className="absolute hover:z-[1000]"
      style={scalePosition(p)}
    >
      <Key selected={idx == selectedPosition} {...p} />
    </div>
  ));

  return (
    <div
      className="relative"
      style={{
        height: scale(bottomMost) + "px",
        width: scale(rightMost) + "px",
      }}
      {...props}
    >
      {positionItems}
    </div>
  );
};
