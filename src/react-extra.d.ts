import "react";

// Needed for setting CSS *variables* to `style` properties in TSX.
declare module "react" {
  interface CSSProperties {
    [key: `--${string}`]: string | number;
  }
}
