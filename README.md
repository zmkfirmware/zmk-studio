# ZMK Studio

Initial work on the ZMK Studio UI.

## Key Legend Layout

ZMK Studio displays per-key legends (the glyphs shown on each keycap) using a
**legend layout** that maps HID usage codes to locale-appropriate symbols.

### Default behavior

The default legend layout is **US** (`us`), which matches standard ANSI key
legends (e.g. the `3` key shows `3` unshifted and `#` shifted).

### Selecting a legend layout

A compact drop-down labelled with the layout name (e.g. **US**, **UK**) is
displayed in the top-right corner of the keyboard view, next to the zoom
selector.  The selected layout is persisted in `localStorage` under the key
`keyboard.legendLayout` so it survives page reloads.

### Available layouts

| ID   | Description                            |
|------|----------------------------------------|
| `us` | US ANSI (default)                      |
| `uk` | UK ISO (e.g. `3`/`£`, `2`/`"`, `` ` ``/`¬`) |

### Adding a new locale

1. Open `src/keyboard/legendLayouts.ts`.
2. Add a new entry to the `LegendLayoutId` union type:
   ```ts
   export type LegendLayoutId = "us" | "uk" | "de";
   ```
3. Add a mapping object and register it in `LEGEND_LAYOUTS` and
   `LEGEND_LAYOUT_LABELS`:
   ```ts
   const DE_LEGEND_MAP: Record<number, LegendEntry> = {
     ...US_LEGEND_MAP,
     // override keys as needed
   };

   export const LEGEND_LAYOUTS = { us: ..., uk: ..., de: DE_LEGEND_MAP };
   export const LEGEND_LAYOUT_LABELS = { us: "US", uk: "UK", de: "DE" };
   ```
4. Add the new id to `ALL_LEGEND_LAYOUT_IDS`.

The new layout will automatically appear in the selector UI and in
`HidUsageLabel` stories.

