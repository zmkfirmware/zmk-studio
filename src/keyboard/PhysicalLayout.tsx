import { PropsWithChildren } from "react";
import { Key } from "./Key";

export type KeyPosition = PropsWithChildren<{
  header?: string;
  width: number;
  height: number;
  x: number;
  y: number;
}>;

interface PhysicalLayoutProps {
  positions: Array<KeyPosition>;
  selectedPosition?: number;
  oneU?: number;
  hoverZoom?: boolean;
  onPositionClicked?: (position: number) => void;
}

interface PhysicalLayoutPositionLocation {
  x: number;
  y: number;
}

function scalePosition(
  { x, y }: PhysicalLayoutPositionLocation,
  oneU: number
): {
  top: number;
  left: number;
} {
  let left = x * oneU;
  let top = y * oneU;

  return {
    top,
    left,
  };
}

export const PhysicalLayout = ({
  positions,
  selectedPosition,
  oneU = 48,
  hoverZoom = true,
  onPositionClicked,
  ...props
}: PhysicalLayoutProps) => {
  console.log("Physical Layout", oneU, hoverZoom);
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
      className="absolute data-[zoomer=true]:hover:z-[1000] leading-[0]"
      data-zoomer={hoverZoom}
      style={scalePosition(p, oneU)}
    >
      <Key
        hoverZoom={hoverZoom}
        oneU={oneU}
        selected={idx === selectedPosition}
        {...p}
      />
    </div>
  ));

  return (
    <div
      className="relative"
      style={{
        height: bottomMost * oneU + "px",
        width: rightMost * oneU + "px",
      }}
      {...props}
    >
      {positionItems}
    </div>
  );
};
