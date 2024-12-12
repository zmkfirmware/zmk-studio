// import './key.css';

import { PropsWithChildren, Children, CSSProperties, FC } from "react";
import { cn } from "../utils";

interface KeyProps {
  /**
   * Is this the principal call to action on the page?
   */
  selected?: boolean;
  /**
   * How large should the button be?
   */
  width: number;
  height: number;

  oneU: number;

  hoverZoom?: boolean;
  /**
   * Button contents
   */
  header?: string;
  /**
   * Optional click handler
   */
  onClick?: () => void;
}

interface KeyDimension {
  width: number;
  height: number;
}

function makeSize(
  { width, height }: KeyDimension,
  oneU: number,
): CSSProperties {
  width *= oneU;
  height *= oneU;

  return {
    "--zmk-key-center-width": `calc(${width}px - 2px)`,
    "--zmk-key-center-height": `calc(${height}px - 2px)`,
  };
}

const ChildItem: FC<PropsWithChildren<{ hoverZoom: boolean }>> = ({
  children,
  hoverZoom,
}) => {
  return (
    <div
      data-zoomer={hoverZoom}
      className="col-start-2 col-end-3 row-start-2 row-end-3 self-center justify-self-center font-keycap text-lg"
    >
      {children}
    </div>
  );
};

export const Key = ({
  selected = false,
  header,
  oneU,
  hoverZoom = true,
  ...props
}: PropsWithChildren<KeyProps>) => {
  const size = makeSize(props, oneU);

  return (
    <div
      className={cn(
        "group justify-content-center group items-center select-none",
        "transition-transform origin-center data-[zoomer=true]:hover:scale-[2] data-[zoomer=true]:hover:z-20",
      )}
      data-zoomer={hoverZoom}
      style={size}
      {...props}
    >
      <button
        aria-selected={selected}
        data-zoomer={hoverZoom}
        className={cn(
          oneU > 20 ? "rounded-md" : "rounded",
          "relative w-[var(--zmk-key-center-width)] h-[var(--zmk-key-center-height)] bg-base-100 border border-transparent",
          "group-hover:border-[#a6adbb] aria-selected:bg-primary aria-selected:text-primary-content @container",
        )}
      >
        {header && (
          <span className="opacity-80 truncate hidden group-hover:block text-[6px] text-center uppercase absolute top-1 left-[4px] right-[4px] max-w-[90%] h-4 leading-none">
            {header}
          </span>
        )}

        {props.children &&
          Children.map(props.children, (child, index) => (
            <ChildItem key={index} hoverZoom={hoverZoom}>
              {child}
            </ChildItem>
          ))}
      </button>
    </div>
  );
};
