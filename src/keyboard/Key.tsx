// import './key.css';

import { PropsWithChildren, Children, CSSProperties, FC } from "react";

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
      className="justify-content-center group origin-center select-none items-center transition-transform data-[zoomer=true]:hover:z-20 data-[zoomer=true]:hover:scale-[2]"
      data-zoomer={hoverZoom}
      style={size}
      {...props}
    >
      <button
        aria-selected={selected}
        data-zoomer={hoverZoom}
        className={[
          oneU > 20 ? "rounded-md" : "rounded",
          "relative w-[var(--zmk-key-center-width)] h-[var(--zmk-key-center-height)] bg-base-100 border border-transparent",
          "group-hover:border-base-content aria-selected:bg-primary aria-selected:text-primary-content @container",
        ].join(" ")}
      >
        {header && (
          <span className="absolute	inset-x-1 top-1 hidden h-4 w-9/12 truncate whitespace-nowrap text-center text-micro uppercase leading-none group-hover:block">
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
