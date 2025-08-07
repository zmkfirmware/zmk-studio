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
  oneU: number
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
    <span
      data-zoomer={hoverZoom}
      className="bg-gray-700 rounded-sm place-content-around text-base-content"
    >
      {c}
    </span>
  ));

  return (
    <div
      className="group inline-flex b-0 justify-content-center items-center transition-all duration-100 data-[zoomer=true]:hover:translate-y-[calc(-1em-7px)] data-[zoomer=true]:hover:translate-x-[calc(-1em)]"
      data-zoomer={hoverZoom}
      style={size}
      {...props}
    >
      <button
        aria-selected={selected}
        data-zoomer={hoverZoom}
        className={`rounded${
          oneU > 20 ? "-md" : ""
        } transition-all duration-100 m-auto p-0 b-0 box-border grid grid-rows-[0_var(--zmk-key-center-height)_0] grid-cols-[0_var(--zmk-key-center-width)_0] data-[zoomer=true]:hover:grid-rows-[1em_var(--zmk-key-center-height)_1em] data-[zoomer=true]:hover:grid-cols-[1em_var(--zmk-key-center-width)_1em] shadow-[0_0_0_1px_inset] shadow-base-content data-[zoomer=true]:shadow-base-200 data-[zoomer=true]:hover:shadow-base-content data-[zoomer=true]:hover:z-50 text-base-content bg-base-100 aria-selected:bg-primary aria-selected:text-primary-content grow @container`}
      >
        {header && (
          <span className="p-0 b-0 m-0 text-xs w-full h-full text-nowrap justify-self-start row-start-1 row-end-2 col-start-1 col-end-4 hidden group-hover:inline-block group-hover:truncate @md:underline">
            {header}
          </span>
        )}
        <div className="row-start-2 row-span-1 col-start-2 w-full h-full p-1 pt-0.5">
         <div className="h-full overflow-hidden rounded-md grid grid-cols-1 gap-y-0.5">
          {children}
         </div>
        </div>
      </button>
    </div>
  );
};
