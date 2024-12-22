import { FC, PropsWithChildren, useEffect, useRef } from "react";

type KeyboardViewportType = PropsWithChildren<{
  className?: string;
}>;

const KEYMAP_SCALE = "keymap:scale";
const DEFAULT_SCALE = window.localStorage.getItem(KEYMAP_SCALE) ?? "1";

export const KeyboardViewport: FC<KeyboardViewportType> = ({
  children,
  className,
}) => {
  const targetRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef<HTMLInputElement>(null);

  const setScale = (param: "increase" | "decrease") => {
    if (!targetRef.current || !scaleRef.current) return;

    const current = scaleRef.current.value;

    if (param === "increase" && Number(current) < 2) {
      scaleRef.current.value = String(Number(scaleRef.current.value) + 0.2);
    }

    if (param === "decrease" && Number(current) > 0.2) {
      scaleRef.current.value = String(Number(scaleRef.current.value) - 0.2);
    }

    localStorage.setItem(KEYMAP_SCALE, scaleRef.current.value);
    targetRef.current.style.setProperty(
      "transform",
      `scale(${scaleRef.current.value})`,
    );
  };

  const resetScale = () => {
    if (!targetRef.current || !scaleRef.current) return;
    targetRef.current.style.translate = "unset";
    targetRef.current.style.setProperty("transform", "scale(1)");
    scaleRef.current.value = "1";
    localStorage.setItem(KEYMAP_SCALE, "1");
  };

  useEffect(() => {
    if (!targetRef.current) return;

    const target = targetRef.current;
    const offset = { x: 0, y: 0 };
    let isPanningActive = false;

    function panStart(e: KeyboardEvent) {
      if (e.key !== " ") return;
      e.preventDefault();

      target.style.cursor = "grab";
      isPanningActive = true;
    }

    function panEnd(e: KeyboardEvent) {
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

    document.addEventListener("keydown", panStart);
    document.addEventListener("keyup", panEnd);
    target.addEventListener("pointermove", panMove);

    return () => {
      document.removeEventListener("keydown", panStart);
      document.removeEventListener("keyup", panEnd);
      target.removeEventListener("pointermove", panMove);
    };
  }, []);

  useEffect(() => {
    if (!scaleRef.current || !targetRef.current) return;

    const input = scaleRef.current;
    const target = targetRef.current;

    input.value = DEFAULT_SCALE;
    target.style.setProperty("transform", `scale(${DEFAULT_SCALE})`);

    function onInputChange(e: Event) {
      const value = (e.currentTarget as HTMLInputElement).value;
      target.style.setProperty("transform", `scale(${value})`);
      localStorage.setItem(KEYMAP_SCALE, value);
    }

    input.addEventListener("change", onInputChange);
    return () => {
      input.removeEventListener("change", onInputChange);
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
        className="flex size-full origin-center items-center justify-center transition-transform"
      >
        {children}
      </div>

      <div className="absolute bottom-[10px] left-1/2 ml-[-170px] flex justify-center items-center w-[298px] gap-1 rounded-xl bg-muted py-1 select-none bg-base-300">
        <button
          className="block px-4 py-1.5 bg-base-100 rounded-l-lg"
          onClick={() => setScale("decrease")}
        >
          -
        </button>
        <div className="flex h-9 px-2 justify-center items-center bg-base-100">
          <input
            type="range"
            name="scale"
            min={0.25}
            max={2}
            step={0.01}
            ref={scaleRef}
            defaultValue={DEFAULT_SCALE}
            className="mx-auto h-1 w-28 cursor-pointer appearance-none rounded-lg"
          />
        </div>
        <button
          className="block px-4 py-1.5 bg-base-100"
          onClick={() => setScale("increase")}
        >
          +
        </button>
        <button
          className="block px-4 py-1.5 bg-base-100 rounded-r-lg"
          onClick={resetScale}
        >
          Auto
        </button>
      </div>
    </div>
  );
};
