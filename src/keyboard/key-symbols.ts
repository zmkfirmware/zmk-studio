import {
  ArrowLeftRight,
  Bluetooth,
  CaseUpper,
  HardDriveDownload,
  Lightbulb,
  LockOpen,
  LucideIcon,
  Mouse,
  Pause,
  Play,
  Power,
  Repeat,
  RotateCcw,
  SkipBack,
  SkipForward,
  Square,
  Sun,
  SunDim,
  SunMedium,
  Usb,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";

import {
  hid_usage_get_labels,
  hid_usage_page_and_id_from_usage,
} from "../hid-usages";

const KEYBOARD_PAGE = 0x07;
const CONSUMER_PAGE = 0x0c;

/** A label is either plain text or an icon, plus a long name for tooltips. */
export interface DisplayLabel {
  text?: string;
  icon?: LucideIcon;
  title?: string;
}

// Implicit modifiers live in the top byte of the usage (see ZMK's APPLY_MODS).
const MOD_LCTL = 0x01;
const MOD_LSFT = 0x02;
const MOD_LALT = 0x04;
const MOD_LGUI = 0x08;
const MOD_RCTL = 0x10;
const MOD_RSFT = 0x20;
const MOD_RALT = 0x40;
const MOD_RGUI = 0x80;

const MOD_SYMBOLS: [number, string][] = [
  [MOD_LCTL | MOD_RCTL, "⌃"],
  [MOD_LALT | MOD_RALT, "⌥"],
  [MOD_LSFT | MOD_RSFT, "⇧"],
  [MOD_LGUI | MOD_RGUI, "⌘"],
];

/** Keycap symbols for keyboard page usages, used in place of names. */
const KEYBOARD_SYMBOLS: Record<number, string> = {
  0x28: "↵", // Enter
  0x2a: "⌫", // Backspace
  0x2b: "⇥", // Tab
  0x2c: "␣", // Space
  0x2f: "[",
  0x30: "]",
  0x39: "⇪", // Caps Lock
  0x4a: "⇱", // Home
  0x4b: "⇞", // Page Up
  0x4c: "⌦", // Delete Forward
  0x4d: "⇲", // End
  0x4e: "⇟", // Page Down
  0x4f: "→",
  0x50: "←",
  0x51: "↓",
  0x52: "↑",
  0x58: "↵", // Keypad Enter
  0x65: "☰", // Application / Menu
  0xe0: "⌃",
  0xe1: "⇧",
  0xe2: "⌥",
  0xe3: "⌘",
  0xe4: "R⌃",
  0xe5: "R⇧",
  0xe6: "R⌥",
  0xe7: "R⌘",
};

/** What a keyboard page usage produces with shift held (US layout). */
const SHIFTED_SYMBOLS: Record<number, string> = {
  0x1e: "!",
  0x1f: "@",
  0x20: "#",
  0x21: "$",
  0x22: "%",
  0x23: "^",
  0x24: "&",
  0x25: "*",
  0x26: "(",
  0x27: ")",
  0x2d: "_",
  0x2e: "+",
  0x2f: "{",
  0x30: "}",
  0x31: "|",
  0x33: ":",
  0x34: '"',
  0x35: "~",
  0x36: "<",
  0x37: ">",
  0x38: "?",
};

const CONSUMER_ICONS: Record<number, LucideIcon> = {
  0x6f: SunMedium, // Display Brightness Increment
  0x70: SunDim, // Display Brightness Decrement
  0xb0: Play,
  0xb1: Pause,
  0xb5: SkipForward, // Scan Next Track
  0xb6: SkipBack, // Scan Previous Track
  0xb7: Square, // Stop
  0xcd: Play, // Play/Pause
  0xe2: VolumeX, // Mute
  0xe9: Volume2, // Volume Increment
  0xea: Volume1, // Volume Decrement
};

const removePrefix = (s?: string) => s?.replace(/^Keyboard /, "");

/**
 * Compute what to draw on a key for a HID usage, preferring keycap symbols,
 * and folding implicit modifiers into the label (e.g. LS(N2) shows "@").
 */
export const hidUsageDisplay = (usage: number): DisplayLabel => {
  const mods = (usage >>> 24) & 0xff;
  const [rawPage, id] = hid_usage_page_and_id_from_usage(usage);
  const page = rawPage & 0xff;

  const labels = hid_usage_get_labels(page, id);
  const title = removePrefix(labels.long || labels.med || labels.short);

  if (page === CONSUMER_PAGE && CONSUMER_ICONS[id]) {
    return { icon: CONSUMER_ICONS[id], title };
  }

  let text =
    (page === KEYBOARD_PAGE ? KEYBOARD_SYMBOLS[id] : undefined) ??
    removePrefix(labels.short) ??
    `0x${id.toString(16)}`;
  let remainingMods = mods;

  const shiftOnly = mods !== 0 && (mods & ~(MOD_LSFT | MOD_RSFT)) === 0;
  if (page === KEYBOARD_PAGE && shiftOnly && SHIFTED_SYMBOLS[id]) {
    text = SHIFTED_SYMBOLS[id];
    remainingMods = 0;
  }

  const prefix = MOD_SYMBOLS.filter(([bits]) => remainingMods & bits)
    .map(([, s]) => s)
    .join("");

  return {
    text: prefix + text,
    title: mods ? `${prefix}${title ?? text}` : title,
  };
};

/** Small icons shown in the key header in place of the behavior name. */
const BEHAVIOR_ICONS: Record<string, LucideIcon> = {
  Backlight: Sun,
  Bluetooth: Bluetooth,
  Bootloader: HardDriveDownload,
  "Caps Word": CaseUpper,
  "External Power": Power,
  "Key Repeat": Repeat,
  "Mouse Key Press": Mouse,
  Reset: RotateCcw,
  "Studio Unlock": LockOpen,
  Underglow: Lightbulb,
};

export const behaviorIcon = (displayName?: string): LucideIcon | undefined =>
  displayName ? BEHAVIOR_ICONS[displayName] : undefined;

/** Main labels for behaviors that take no parameters. */
const NO_PARAM_SYMBOLS: Record<string, string> = {
  Transparent: "▽",
  None: "✕",
};

export const noParamSymbol = (displayName?: string): string | undefined =>
  displayName ? NO_PARAM_SYMBOLS[displayName] : undefined;

/**
 * Compact labels for named parameter values reported by the firmware. An
 * empty string hides the name, leaving only the following value (so
 * "Select Profile" + 1 shows just "1" under the Bluetooth icon).
 */
const VALUE_LABELS: Record<string, string | LucideIcon> = {
  // Bluetooth
  "Select Profile": "",
  "Disconnect Profile": "Disc",
  "Next Profile": "Next",
  "Previous Profile": "Prev",
  "Clear All Profiles": "Clr All",
  "Clear Selected Profile": "Clear",
  // Output selection
  "USB Output": Usb,
  "BLE Output": Bluetooth,
  "Toggle Outputs": ArrowLeftRight,
  // Mouse buttons
  MB1: "Left",
  MB2: "Right",
  MB3: "Mid",
  MB4: "Back",
  MB5: "Fwd",
  // Lighting
  "Toggle On/Off": "On/Off",
  "Turn On": "On",
  "Turn OFF": "Off",
  "Hue Up": "Hue+",
  "Hue Down": "Hue−",
  "Saturation Up": "Sat+",
  "Saturation Down": "Sat−",
  "Brightness Up": "Bri+",
  "Brightness Down": "Bri−",
  "Increase Brightness": "Bri+",
  "Decrease Brightness": "Bri−",
  "Cycle Brightness": "Bri↻",
  "Set Brightness": "Bri",
  "Speed Up": "Spd+",
  "Speed Down": "Spd−",
  "Next Effect": "Eff+",
  "Previous Effect": "Eff−",
  "Set Color": "Color",
};

export const valueLabel = (name: string): string | LucideIcon =>
  VALUE_LABELS[name] ?? name;

/** Short category labels for ZMK's built-in behaviors, shown in the corner. */
const CATEGORY_ABBREVIATIONS: Record<string, string> = {
  "Key Press": "",
  Transparent: "",
  None: "",
  "Mod-Tap": "MT",
  "Layer-Tap": "LT",
  "Momentary Layer": "MO",
  "Toggle Layer": "TOG",
  "To Layer": "TO",
  "Sticky Layer": "SL",
  "Sticky Key": "SK",
  "Key Toggle": "KT",
  "Grave/Escape": "GE",
  "Output Selection": "OUT",
};

const splitWords = (name: string) =>
  name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(/[\s_\-/]+/)
    .filter(Boolean);

/**
 * Abbreviate a behavior's display name for the key's corner label. Custom
 * behaviors report their devicetree node name (e.g. `homerow_mod_left`) when
 * no display-name is set, so common naming patterns are recognised too.
 */
export const categoryAbbreviation = (
  displayName: string,
  isHoldTap: boolean
): string => {
  const known = CATEGORY_ABBREVIATIONS[displayName];
  if (known !== undefined) {
    return known;
  }

  const n = displayName.toLowerCase();
  if (/home.?row|\bhrm/.test(n)) return "HRM";
  if (/macro/.test(n)) return "MAC";
  if (/tap.?dance|^td\b/.test(n)) return "TD";
  if (/mod.?morph/.test(n)) return "MM";
  if (/combo/.test(n)) return "CMB";
  if (isHoldTap || /hold/.test(n)) return "HT";

  const words = splitWords(displayName);
  return (
    words.length > 1
      ? words.map((w) => w[0]).join("").slice(0, 3)
      : displayName.slice(0, 3)
  ).toUpperCase();
};

/**
 * A readable main label for a parameterless custom behavior, dropping the
 * part already conveyed by the category (e.g. `macro_wes` shows "wes").
 */
export const friendlyBehaviorName = (displayName: string): string => {
  const words = splitWords(displayName);
  const rest = words.filter((w) => !/^(macro|m)$/i.test(w));
  return (rest.length ? rest : words).join(" ");
};
