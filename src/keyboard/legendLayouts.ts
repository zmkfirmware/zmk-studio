/**
 * Keyboard legend layout localization.
 *
 * Each layout contains only the keys whose displayed legends differ from the
 * US ANSI default.  The US layout entry has an empty `keys` map so that the
 * default HID-table / SHIFTED_CHAR_MAP values are used unchanged.
 *
 * HID keyboard usage IDs used as map keys (all decimal here for clarity):
 *   30=1  31=2  32=3  33=4  34=5  35=6  36=7  37=8  38=9  39=0
 *   45=-  46==  47=[  48=]  49=\  50=Non-US#  51=;  52='  53=`
 *   54=,  55=.  56=/  100=Non-US\
 *
 * To add a new layout:
 *  1. Create a new `LegendLayout` object with only the differing keys.
 *  2. Add it to `LEGEND_LAYOUTS` with a short locale key (e.g. "es").
 *  3. The layout selector in App.tsx will pick it up automatically.
 */

export type KeyLegendOverride = {
  /** Override for the unshifted label; omit to keep HID-table default */
  unshifted?: string;
  /** Override for the Shift-modified label; omit to keep SHIFTED_CHAR_MAP default */
  shifted?: string;
};

/** Map of HID keyboard usage ID → per-layout legend overrides */
export type LegendLayoutMap = Record<number, KeyLegendOverride>;

export type LegendLayout = {
  /** Human-readable display name shown in the UI */
  name: string;
  /**
   * Per-key overrides.  Only keys that differ from the US ANSI default need
   * entries here.  Omitted keys fall through to the existing HID-table and
   * SHIFTED_CHAR_MAP values.
   */
  keys: LegendLayoutMap;
};

// ---------------------------------------------------------------------------
// Layout definitions
// ---------------------------------------------------------------------------

/**
 * UK ISO layout.
 *
 * Differences from US ANSI:
 *  - Number row: 2→" (not @), 3→£ (not #)
 *  - Quote key (52): shifted → @ (not ")
 *  - Backtick (53): shifted → ¬ (not ~)
 *  - Backslash key (49): on ISO UK gives # / ~ (not \ / |)
 *  - Non-US # key (50): on ISO UK gives \ / | (not # / ~)
 */
export const UK_LAYOUT: LegendLayout = {
  name: "UK",
  keys: {
    // Number row shifted symbols
    31: { shifted: '"' }, // 2 → "
    32: { shifted: "£" }, // 3 → £
    // ISO key positions
    49: { unshifted: "\\", shifted: "|" }, // Non-US# position → \ / |
    50: { unshifted: "#", shifted: "~" }, // backslash position → # / ~
    100: { unshifted: "\\", shifted: "|" }, // Non-US \ → \ / |
    // Quote / backtick row
    52: { shifted: "@" }, // ' → @
    53: { shifted: "¬" }, // ` → ¬
  },
};

/**
 * German QWERTZ layout.
 *
 * Differences from US ANSI (non-letter keys only):
 *  - Number row shifted symbols differ for several keys.
 *  - Punctuation keys carry umlauts and special characters.
 */
export const DE_LAYOUT: LegendLayout = {
  name: "DE",
  keys: {
    // Number row
    31: { shifted: '"' }, // 2 → "
    32: { shifted: "§" }, // 3 → §
    35: { shifted: "&" }, // 6 → &
    36: { shifted: "/" }, // 7 → /
    37: { shifted: "(" }, // 8 → (
    38: { shifted: ")" }, // 9 → )
    39: { shifted: "=" }, // 0 → =
    // Punctuation row
    45: { unshifted: "ß", shifted: "?" }, // - → ß
    46: { unshifted: "´", shifted: "`" }, // = → ´
    47: { unshifted: "ü", shifted: "Ü" }, // [ → ü
    48: { unshifted: "+", shifted: "*" }, // ] → +
    49: { unshifted: "#", shifted: "'" }, // \ → #
    50: { unshifted: "<", shifted: ">" }, // Non-US# → <
    51: { unshifted: "ö", shifted: "Ö" }, // ; → ö
    52: { unshifted: "ä", shifted: "Ä" }, // ' → ä
    53: { unshifted: "^", shifted: "°" }, // ` → ^
    54: { unshifted: ",", shifted: ";" }, // , → ,
    55: { unshifted: ".", shifted: ":" }, // . → .
    56: { unshifted: "-", shifted: "_" }, // / → -
  },
};

/**
 * French AZERTY layout.
 *
 * Differences from US ANSI (non-letter keys only):
 *  - Number row: unshifted gives symbols, shifted gives digits.
 *  - Punctuation keys differ throughout.
 */
export const FR_LAYOUT: LegendLayout = {
  name: "FR",
  keys: {
    // Number row (unshifted symbols; shifted gives the digit)
    30: { unshifted: "&", shifted: "1" }, // 1 → &
    31: { unshifted: "é", shifted: "2" }, // 2 → é
    32: { unshifted: '"', shifted: "3" }, // 3 → "
    33: { unshifted: "'", shifted: "4" }, // 4 → '
    34: { unshifted: "(", shifted: "5" }, // 5 → (
    35: { unshifted: "§", shifted: "6" }, // 6 → §
    36: { unshifted: "è", shifted: "7" }, // 7 → è
    37: { unshifted: "!", shifted: "8" }, // 8 → !
    38: { unshifted: "ç", shifted: "9" }, // 9 → ç
    39: { unshifted: "à", shifted: "0" }, // 0 → à
    45: { unshifted: ")", shifted: "°" }, // - → )
    46: { unshifted: "=", shifted: "+" }, // = → =
    // Punctuation
    47: { unshifted: "^", shifted: "¨" }, // [ → ^
    48: { unshifted: "$", shifted: "£" }, // ] → $
    49: { unshifted: "*", shifted: "µ" }, // \ → *
    50: { unshifted: "<", shifted: ">" }, // Non-US# → <
    52: { unshifted: "ù", shifted: "%" }, // ' → ù
    53: { unshifted: "²" }, // ` → ² (shifted is a dead key; no override)
    54: { unshifted: ",", shifted: "?" }, // , → ,/?
    55: { unshifted: ";", shifted: "." }, // . → ;/.
    56: { unshifted: ":", shifted: "/" }, // / → :/
    100: { unshifted: "<", shifted: ">" }, // Non-US \ → < (extra ISO key)
  },
};

/**
 * Swiss German layout (de-CH).
 *
 * Similar to DE but uses ä/ö/ü differently and has Swiss-specific symbols.
 */
export const DE_CH_LAYOUT: LegendLayout = {
  name: "DE-CH",
  keys: {
    // Number row
    31: { shifted: '"' }, // 2 → "
    32: { shifted: "*" }, // 3 → *
    33: { shifted: "ç" }, // 4 → ç
    34: { shifted: "%" }, // 5 → %
    35: { shifted: "&" }, // 6 → &
    36: { shifted: "/" }, // 7 → /
    37: { shifted: "(" }, // 8 → (
    38: { shifted: ")" }, // 9 → )
    39: { shifted: "=" }, // 0 → =
    45: { unshifted: "'", shifted: "?" }, // - → '
    46: { unshifted: "^", shifted: "`" }, // = → ^
    47: { unshifted: "è", shifted: "é" }, // [ → è
    48: { unshifted: "¨", shifted: "!" }, // ] → ¨
    49: { unshifted: "$", shifted: "£" }, // \ → $
    50: { unshifted: "<", shifted: ">" }, // Non-US# → <
    51: { unshifted: "ü", shifted: "Ü" }, // ; → ü
    52: { unshifted: "à", shifted: "À" }, // ' → à
    53: { unshifted: "§", shifted: "°" }, // ` → §
    54: { unshifted: ",", shifted: ";" }, // , → ,
    55: { unshifted: ".", shifted: ":" }, // . → .
    56: { unshifted: "-", shifted: "_" }, // / → -
  },
};

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export const LEGEND_LAYOUTS: Record<string, LegendLayout> = {
  us: { name: "US", keys: {} },
  uk: UK_LAYOUT,
  de: DE_LAYOUT,
  fr: FR_LAYOUT,
  "de-ch": DE_CH_LAYOUT,
};

export type LegendLayoutId = keyof typeof LEGEND_LAYOUTS;

export const ALL_LEGEND_LAYOUT_IDS: LegendLayoutId[] = Object.keys(LEGEND_LAYOUTS);

/** Maps each layout ID to its human-readable display name. */
export const LEGEND_LAYOUT_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(LEGEND_LAYOUTS).map(([id, layout]) => [id, layout.name]),
);

// ---------------------------------------------------------------------------
// Resolution helpers
// ---------------------------------------------------------------------------

/**
 * Returns a layout-specific legend override for a key, or `null` if the
 * layout has no override for that key/state combination (caller should fall
 * back to the HID-table / SHIFTED_CHAR_MAP defaults).
 *
 * @param hidId   - HID keyboard usage ID (low 16 bits of the full HID usage)
 * @param isShifted - Whether the Left Shift modifier flag is set
 * @param layout  - Active legend layout (undefined or US → always returns null)
 */
export function resolveLayoutLegend(
  hidId: number,
  isShifted: boolean,
  layout: LegendLayout | undefined,
): string | null {
  if (!layout || Object.keys(layout.keys).length === 0) return null;
  const entry = layout.keys[hidId];
  if (!entry) return null;
  if (isShifted) return entry.shifted ?? null;
  return entry.unshifted ?? null;
}

/**
 * Convenience wrapper that looks up a layout by ID and resolves the legend.
 * Returns `undefined` if no override exists for the given key/state.
 *
 * @param layoutId  - Layout identifier string (e.g. "us", "uk", "de")
 * @param hidUsageId - HID keyboard usage ID (low 16 bits)
 * @param shifted   - Whether the Shift modifier is active
 */
export function resolveLegend(
  layoutId: LegendLayoutId,
  hidUsageId: number,
  shifted: boolean,
): string | undefined {
  const layout = LEGEND_LAYOUTS[layoutId];
  const result = resolveLayoutLegend(hidUsageId, shifted, layout);
  return result ?? undefined;
}
