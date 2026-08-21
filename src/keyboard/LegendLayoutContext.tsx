import { createContext, useContext } from "react";
import { LEGEND_LAYOUTS, LegendLayout } from "./legendLayouts";

/**
 * React context that provides the currently selected keyboard legend layout.
 *
 * Wrap the application (or any subtree) with `LegendLayoutContext.Provider`
 * supplying the active `LegendLayout` value.  Components that render key
 * legends (e.g. `HidUsageLabel`) consume this context to display locale-
 * appropriate characters.
 *
 * Defaults to the US layout (no overrides applied).
 */
export const LegendLayoutContext = createContext<LegendLayout>(
  LEGEND_LAYOUTS.us,
);

/** Convenience hook to read the active legend layout. */
export function useLegendLayout(): LegendLayout {
  return useContext(LegendLayoutContext);
}
