export type LegendLayoutId = "us" | "uk";

export interface LegendEntry {
  unshifted?: string;
  shifted?: string;
}

// HID usage IDs for keyboard page (page 7). The id here corresponds to the
// low 16 bits of the full HID usage value (page << 16 | id).
// Number row: 0x1e=1, 0x1f=2, 0x20=3, 0x21=4, 0x22=5, 0x23=6, 0x24=7,
//             0x25=8, 0x26=9, 0x27=0
// Symbols: 0x2d=-/_, 0x2e=+/=, 0x2f=[/{, 0x30=]/}, 0x31=\/|,
//          0x33=;/:,  0x34='/"  0x35=`/~, 0x36=,/<, 0x37=./>

const US_LEGEND_MAP: Record<number, LegendEntry> = {
  0x1e: { unshifted: "1", shifted: "!" },
  0x1f: { unshifted: "2", shifted: "@" },
  0x20: { unshifted: "3", shifted: "#" },
  0x21: { unshifted: "4", shifted: "$" },
  0x22: { unshifted: "5", shifted: "%" },
  0x23: { unshifted: "6", shifted: "^" },
  0x24: { unshifted: "7", shifted: "&" },
  0x25: { unshifted: "8", shifted: "*" },
  0x26: { unshifted: "9", shifted: "(" },
  0x27: { unshifted: "0", shifted: ")" },
  0x2d: { unshifted: "-", shifted: "_" },
  0x2e: { unshifted: "=", shifted: "+" },
  0x2f: { unshifted: "[", shifted: "{" },
  0x30: { unshifted: "]", shifted: "}" },
  0x31: { unshifted: "\\", shifted: "|" },
  0x33: { unshifted: ";", shifted: ":" },
  0x34: { unshifted: "'", shifted: '"' },
  0x35: { unshifted: "`", shifted: "~" },
  0x36: { unshifted: ",", shifted: "<" },
  0x37: { unshifted: ".", shifted: ">" },
  0x38: { unshifted: "/", shifted: "?" },
};

// UK ISO layout differs from US ANSI on several symbol keys.
// Key differences documented here:
//   2 -> 2/"  (US: 2/@)
//   3 -> 3/£  (US: 3/#)
//   '  -> '/@  (US: '/" )
//   # -> #/~  (additional key, not present on US layout)
//   ` -> `/¬  (US: `/~)
const UK_LEGEND_MAP: Record<number, LegendEntry> = {
  ...US_LEGEND_MAP,
  // 2 key: unshifted 2, shifted " (not @)
  0x1f: { unshifted: "2", shifted: '"' },
  // 3 key: unshifted 3, shifted £
  0x20: { unshifted: "3", shifted: "£" },
  // apostrophe key: unshifted ', shifted @
  0x34: { unshifted: "'", shifted: "@" },
  // grave key: unshifted `, shifted ¬
  0x35: { unshifted: "`", shifted: "¬" },
};

export const LEGEND_LAYOUTS: Record<LegendLayoutId, Record<number, LegendEntry>> = {
  us: US_LEGEND_MAP,
  uk: UK_LEGEND_MAP,
};

export const LEGEND_LAYOUT_LABELS: Record<LegendLayoutId, string> = {
  us: "US",
  uk: "UK",
};

export const ALL_LEGEND_LAYOUT_IDS: LegendLayoutId[] = ["us", "uk"];

export function resolveLegend(
  layout: LegendLayoutId,
  hidUsageId: number,
  shifted: boolean
): string | undefined {
  const entry = LEGEND_LAYOUTS[layout]?.[hidUsageId];
  if (!entry) return undefined;
  return shifted ? (entry.shifted ?? entry.unshifted) : entry.unshifted;
}
