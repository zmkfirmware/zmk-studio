import { FC, PropsWithChildren, useEffect, useRef } from "react";
import { useLocalStorageState } from "../misc/useLocalStorageState";
import { ExpandIcon, MaximizeIcon, ShrinkIcon } from "lucide-react";

type KeyboardViewportType = PropsWithChildren<{
  className?: string;
}>;

const KEYMAP_SCALE = "keymapScale";
const DEFAULT_SCALE = 1;

export const KeyboardViewport: FC<KeyboardViewportType> = ({
  children,
  className,
}) => {
  const targetRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useLocalStorageState(KEYMAP_SCALE, DEFAULT_SCALE);

  const resetScale = () => {
    if (!targetRef.current) return;
    targetRef.current.style.translate = "unset";
    targetRef.current.style.setProperty("transform", "scale(1)");
    setScale(DEFAULT_SCALE);
  };

  useEffect(() => {
    if (!targetRef.current) return;

    const target = targetRef.current;
    const offset = { x: 0, y: 0 };
    let isPanningActive = false;

    function keyDownPanStart(e: KeyboardEvent) {
      if (e.key !== " ") return;
      e.preventDefault();

      target.style.cursor = "grab";
      isPanningActive = true;
    }

    function pointerDownPanStart(e: PointerEvent) {
      if (e.button !== 0) return;
      e.preventDefault();

      target.style.cursor = "grab";
      isPanningActive = true;
    }

    function keyUpPanEnd(e: KeyboardEvent) {
      if (e.key !== " ") return;
      isPanningActive = false;
      target.style.cursor = "unset";
    }

    function panMove(e: PointerEvent) {
      if (!isPanningActive) return;
      offset.x += e.movementX;
      offset.y += e.movementY;
      target.style.translate = `${offset.x}px ${offset.y}px`;
    }

    function pointerUpPanEnd() {
      isPanningActive = false;
      target.style.cursor = "unset";
    }

    document.addEventListener("keydown", keyDownPanStart);
    document.addEventListener("keyup", keyUpPanEnd);

    target.addEventListener("pointermove", panMove);
    target.addEventListener("pointerdown", pointerDownPanStart);
    target.addEventListener("pointerup", pointerUpPanEnd);
    target.addEventListener("pointerleave", pointerUpPanEnd);

    return () => {
      document.removeEventListener("keydown", keyDownPanStart);
      document.removeEventListener("keyup", keyUpPanEnd);

      target.removeEventListener("pointermove", panMove);
      target.removeEventListener("pointerdown", pointerDownPanStart);
      target.removeEventListener("pointerup", pointerUpPanEnd);
      target.removeEventListener("pointerleave", pointerUpPanEnd);
    };
  }, []);

  return (
    <div
      className={[
        "relative size-full overflow-hidden p-0 touch-none",
        className,
      ].join(" ")}
    >
      <div
        ref={targetRef}
        style={{ transform: `scale(${scale})` }}
        className="flex size-full origin-center items-center justify-center transition-transform"
      >
        {children}
      </div>

      <div className="absolute bottom-8 left-0 flex justify-center items-center w-full gap-1 rounded-xl bg-muted py-1 select-none bg-base-300">
        <button
          className="block h-9 px-4 py-1.5 bg-base-100 rounded-l-lg disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={scale <= 0.25}
          onClick={() => setScale((prev: number) => prev - 0.05)}
        >
          <ShrinkIcon className="size-4" />
          <span className="sr-only">Decrease scale</span>
        </button>
        <div className="flex h-9 px-2 justify-center items-center bg-base-100">
          <input
            type="range"
            name="scale"
            min={0.25}
            max={2}
            step={0.01}
            className="mx-auto h-1 w-28 cursor-pointer appearance-none rounded-lg"
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
          />
        </div>
        <button
          className="block h-9 px-4 py-1.5 bg-base-100 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={scale >= 2}
          onClick={() => setScale((prev: number) => prev + 0.05)}
        >
          <ExpandIcon className="size-4" />
          <span className="sr-only">Increase scale</span>
        </button>
        <button
          className="block px-4 py-1.5 bg-base-100 rounded-r-lg h-9 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={resetScale}
        >
          <MaximizeIcon className="size-4" />
          <span className="sr-only">Reset scale</span>
        </button>
      </div>
    </div>
  );
};
