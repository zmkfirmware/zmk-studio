// import './key.css';

import { PropsWithChildren, Children, CSSProperties } from "react";
import { scale } from "./geometry";

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
  /**
   * Button contents
   */
  header: string;
  /**
   * Optional click handler
   */
  onClick?: () => void;
}

interface KeyDimension {
  width: number;
  height: number;
}

function makeSize({ width, height }: KeyDimension): CSSProperties {
  width = scale(width);
  height = scale(height);

  return {
    "--zmk-key-center-width": "calc(" + width + "px - 2px)",
    "--zmk-key-center-height": "calc(" + height + "px - 2px)",
  };
}

export const Key = ({
  selected = false,
  header,
  ...props
}: PropsWithChildren<KeyProps>) => {
  const size = makeSize(props);
  const children = Children.map(props.children, (c) => (
    <div className="justify-self-center self-center row-start-2 row-end-3 col-start-2 col-end-3 font-keycap text-lg group-hover:text-3xl">
      {c}
    </div>
  ));

  return (
    <div
      className="group inline-flex b-0 justify-content-center items-center hover:translate-y-[calc(-1em-7px)] hover:translate-x-[calc(-1em)]"
      style={size}
      {...props}
    >
      <button
        aria-selected={selected}
        className={
          "rounded-md m-auto p-0 b-0 box-border grid grid-rows-[0_var(--zmk-key-center-height)_0] grid-cols-[0_var(--zmk-key-center-width)_0] hover:grid-rows-[1em_var(--zmk-key-center-height)_1em] hover:grid-cols-[1em_var(--zmk-key-center-width)_1em] shadow-[0_0_0_1px_inset] shadow-text-base hover:z-50 text-text-base bg-bg-base aria-selected:bg-secondary"
        }
      >
        <span className="p-0 b-0 m-0 text-xs w-full h-full text-nowrap justify-self-start row-start-1 row-end-2 col-start-1 col-end-4 hidden group-hover:inline-block group-hover:truncate">
          {header}
        </span>
        {children}
      </button>
    </div>
  );
};
