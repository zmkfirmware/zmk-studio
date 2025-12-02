import {
  CSSProperties,
  PropsWithChildren,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Key } from "./Key";

export type KeyPosition = PropsWithChildren<{
  id: string;
  header?: string;
  width: number;
  height: number;
  x: number;
  y: number;
  r?: number;
  rx?: number;
  ry?: number;
}>;

export type LayoutZoom = number | "auto";

export function deserializeLayoutZoom(value: string): LayoutZoom {
  if (value === "auto") {
    return "auto";
  }
  return parseFloat(value) || "auto";
}

interface PhysicalLayoutProps {
  positions: Array<KeyPosition>;
  selectedPosition?: number;
  oneU?: number;
  hoverZoom?: boolean;
  zoom?: LayoutZoom;
  onPositionClicked?: (position: number) => void;
}

interface PhysicalLayoutPositionLocation {
  x: number;
  y: number;
  r?: number;
  rx?: number;
  ry?: number;
}

function scalePosition(
  { x, y, r, rx, ry }: PhysicalLayoutPositionLocation,
  oneU: number,
): CSSProperties {
  let left = x * oneU;
  let top = y * oneU;
  let transformOrigin = undefined;
  let transform = undefined;
  const transformStyle = "preserve-3d";

  if (r) {
    let transformX = ((rx || x) - x) * oneU;
    let transformY = ((ry || y) - y) * oneU;
    transformOrigin = `${transformX}px ${transformY}px`;
    transform = `rotate(${r}deg)`;
  }

  return {
    top,
    left,
    transformOrigin,
    transform,
    transformStyle,
  };
}

export const PhysicalLayout = ({
  positions,
  selectedPosition,
  oneU = 48,
  onPositionClicked,
  ...props
}: PhysicalLayoutProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const parent = element.parentElement;
    if (!parent) return;

    const calculateScale = () => {
      if (props.zoom === "auto") {
        const padding = Math.min(window.innerWidth, window.innerHeight) * 0.05; // Padding when in auto mode
        const newScale = Math.min(
          parent.clientWidth / (element.clientWidth + 2 * padding),
          parent.clientHeight / (element.clientHeight + 2 * padding),
        );
        setScale(newScale);
      } else {
        setScale(props.zoom || 1);
      }
    };

    calculateScale(); // Initial calculation

    const resizeObserver = new ResizeObserver(() => {
      calculateScale();
    });

    resizeObserver.observe(element);
    resizeObserver.observe(parent);

    return () => {
      resizeObserver.disconnect();
    };
  }, [props.zoom]);

  // TODO: Add a bit of padding for rotation when supported
  let rightMost = positions
    .map((k) => k.x + k.width)
    .reduce((a, b) => Math.max(a, b), 0);
  let bottomMost = positions
    .map((k) => k.y + k.height)
    .reduce((a, b) => Math.max(a, b), 0);

  const positionItems = positions.map((p, idx) => (
    <div className="absolute" style={scalePosition(p, oneU)}>
      <div
        key={p.id}
        onClick={() => onPositionClicked?.(idx)}
        className="hover:[transform:translateZ(100px)] transition-transform duration-200"
      >
        <Key
          oneU={oneU}
          selected={idx === selectedPosition}
          {...p}
        />
      </div>
    </div>
  ));

  return (
    <div
      className="relative"
      style={{
        height: bottomMost * oneU + "px",
        width: rightMost * oneU + "px",
        transform: `scale(${scale})`,
        transformStyle: "preserve-3d",
      }}
      ref={ref}
      {...props}
    >
      {positionItems}
    </div>
  );
};
