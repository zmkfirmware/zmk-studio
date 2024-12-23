// import './key.css';

import { PropsWithChildren, Children, CSSProperties } from "react";

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
    "--zmk-key-center-width": "calc(" + width + "px - 2px)",
    "--zmk-key-center-height": "calc(" + height + "px - 2px)",
  };
}

export const Key = ({
  selected = false,
  header,
  oneU,
  hoverZoom = true,
  ...props
}: PropsWithChildren<KeyProps>) => {
  const size = makeSize(props, oneU);

  const children = Children.map(props.children, (c) => (
    <div
      data-zoomer={hoverZoom}
      className="col-start-2 col-end-3 row-start-2 row-end-3 self-center justify-self-center font-keycap text-lg data-[zoomer=true]:group-hover:text-2xl"
    >
      {c}
    </div>
  ));

  return (
    <div
      className="group inline-flex items-center justify-center transition-all duration-100 data-[zoomer=true]:hover:translate-x-[calc(-1em)] data-[zoomer=true]:hover:translate-y-[calc(-1em-7px)]"
      data-zoomer={hoverZoom}
      style={size}
      {...props}
    >
      <button
        aria-selected={selected}
        data-zoomer={hoverZoom}
        className={[
          oneU > 20 ? "rounded-md" : "rounded",
          "m-auto box-border grid grow grid-cols-[0_var(--zmk-key-center-width)_0] grid-rows-[0_var(--zmk-key-center-height)_0] bg-base-100 p-0 text-base-content shadow-[0_0_0_1px_inset] shadow-base-content transition-all duration-100 @container aria-selected:bg-primary aria-selected:text-primary-content data-[zoomer=true]:shadow-base-200 data-[zoomer=true]:hover:z-50 data-[zoomer=true]:hover:grid-cols-[1em_var(--zmk-key-center-width)_1em] data-[zoomer=true]:hover:grid-rows-[1em_var(--zmk-key-center-height)_1em] data-[zoomer=true]:hover:shadow-base-content",
        ].join(" ")}
      >
        {header && (
          <span className="col-start-1 col-end-4 row-start-1 row-end-2 m-0 hidden size-full justify-self-start text-nowrap p-0 text-xs group-hover:inline-block group-hover:truncate @md:underline">
            {header}
          </span>
        )}
        {children}
      </button>
    </div>
  );
};
