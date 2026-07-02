import { UsagePages } from "./keyboard-and-consumer-usage-tables.json";
import HidOverrides from "./hid-usage-name-overrides.json";

interface HidLabels {
  short?: string;
  med?: string;
  long?: string;
}

const overrides: Record<string, Record<string, HidLabels>> = HidOverrides;

export interface ParsedBinding {
  behavior: string;
  params: number[];
}

export interface ParsedLayer {
  name: string;
  bindings: ParsedBinding[];
}

function buildZmkKeycodeLookup(): Map<string, number> {
  const lookup = new Map<string, number>();

  // ZMK keycode name -> HID usage name mapping
  // https://zmk.dev/docs/codes/
  const zmkAliases: Record<string, string[]> = {
    A: ["a"],
    B: ["b"],
    C: ["c"],
    D: ["d"],
    E: ["e"],
    F: ["f"],
    G: ["g"],
    H: ["h"],
    I: ["i"],
    J: ["j"],
    K: ["k"],
    L: ["l"],
    M: ["m"],
    N: ["n"],
    O: ["o"],
    P: ["p"],
    Q: ["q"],
    R: ["r"],
    S: ["s"],
    T: ["t"],
    U: ["u"],
    V: ["v"],
    W: ["w"],
    X: ["x"],
    Y: ["y"],
    Z: ["z"],
    N1: ["1", "!", "exclamation mark"],
    N2: ["2", "@"],
    N3: ["3", "#", "hash"],
    N4: ["4", "$", "dollar"],
    N5: ["5", "%", "percent"],
    N6: ["6", "^", "circumflex"],
    N7: ["7", "&", "ampersand"],
    N8: ["8", "*", "asterisk"],
    N9: ["9", "(", "left parenthesis"],
    N0: ["0", ")", "right parenthesis"],
    RET: ["return", "enter"],
    ESC: ["escape"],
    BSPC: ["backspace"],
    TAB: ["tab"],
    SPACE: ["space"],
    MINUS: ["-", "dash", "minus"],
    EQUAL: ["=", "equals"],
    LBKT: ["[", "left bracket", "open bracket"],
    RBKT: ["]", "right bracket", "close bracket"],
    BSLH: ["\\", "backslash", "non-us #"],
    SEMI: [";", "semicolon"],
    SQT: ["'", "quote", "apostrophe"],
    GRAVE: ["`", "grave"],
    COMMA: [",", "comma"],
    DOT: [".", "period"],
    FSLH: ["/", "slash"],
    CAPS: ["caps lock", "capslock"],
    F1: ["f1"],
    F2: ["f2"],
    F3: ["f3"],
    F4: ["f4"],
    F5: ["f5"],
    F6: ["f6"],
    F7: ["f7"],
    F8: ["f8"],
    F9: ["f9"],
    F10: ["f10"],
    F11: ["f11"],
    F12: ["f12"],
    PRSC: ["print screen", "sysrq", "printscr"],
    SLCK: ["scroll lock", "scrolllock"],
    PAUSE: ["pause", "break"],
    INS: ["insert"],
    HOME: ["home"],
    PGUP: ["page up", "pageup"],
    DEL: ["delete"],
    END: ["end"],
    PGDN: ["page down", "pagedown"],
    RGUI: ["right gui", "r gui"],
    LGUI: ["left gui", "l gui"],
    RALT: ["right alt", "altgr", "alt gr"],
    LALT: ["left alt", "l alt"],
    RSHFT: ["r shift", "right shift", "r shft"],
    LSHFT: ["l shift", "left shift", "l shft"],
    RCTL: ["r ctrl", "right ctrl", "r ctrl"],
    LCTL: ["l ctrl", "left ctrl", "l ctrl"],
    UP: ["up arrow", "up"],
    DOWN: ["down arrow", "down"],
    RIGHT: ["right arrow", "right"],
    LEFT: ["left arrow", "left"],
    KP_NUM: ["num lock", "numlock"],
    C_PP: ["play/pause"],
    C_NEXT: ["scan next track"],
    C_PREV: ["scan previous track"],
    C_STOP: ["stop"],
    C_VOL_UP: ["volume increment"],
    C_VOL_DN: ["volume decrement"],
    C_MUTE: ["mute"],
    C_BRI_UP: ["brightness increment"],
    C_BRI_DN: ["brightness decrement"],
  };

  // Build HID usage name -> code lookup from the tables
  const hidNameToCode = new Map<string, number>();
  for (const page of UsagePages) {
    for (const usage of page.UsageIds) {
      const code = (page.Id << 16) + usage.Id;
      const nameLower = usage.Name.toLowerCase();
      hidNameToCode.set(nameLower, code);

      // Also add the override short/med/long names
      const pageOverrides = overrides[page.Id.toString()]?.[usage.Id.toString()];
      if (pageOverrides) {
        if (pageOverrides.short) hidNameToCode.set(pageOverrides.short.toLowerCase(), code);
        if (pageOverrides.med) hidNameToCode.set(pageOverrides.med.toLowerCase(), code);
        if (pageOverrides.long) hidNameToCode.set(pageOverrides.long.toLowerCase(), code);
      }
    }
  }

  for (const [zmkName, aliases] of Object.entries(zmkAliases)) {
    for (const alias of aliases) {
      const code = hidNameToCode.get(alias.toLowerCase());
      if (code !== undefined) {
        lookup.set(zmkName, code);
        break;
      }
    }
  }

  // Also register by ZMK name directly for simple single-letter keycodes
  // (HID keyboard page 0x07 usage IDs: A=4, B=5, ..., Z=29)
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(65 + i); // A-Z
    if (!lookup.has(letter)) {
      lookup.set(letter, (0x07 << 16) + (4 + i));
    }
  }

  // Number keys: HID usage IDs 30-39 for 1-0
  const numKeycodes: [string, number][] = [
    ["N1", 30], ["N2", 31], ["N3", 32], ["N4", 33], ["N5", 34],
    ["N6", 35], ["N7", 36], ["N8", 37], ["N9", 38], ["N0", 39],
  ];
  for (const [name, usageId] of numKeycodes) {
    if (!lookup.has(name)) {
      lookup.set(name, (0x07 << 16) + usageId);
    }
  }

  // Function keys: F1-F12 = usage IDs 58-69
  for (let i = 1; i <= 12; i++) {
    const name = `F${i}`;
    if (!lookup.has(name)) {
      lookup.set(name, (0x07 << 16) + (58 + i - 1));
    }
  }

  // Modifier keys
  const modKeycodes: [string, number][] = [
    ["LCTL", 224], ["LSHFT", 225], ["LALT", 226], ["LGUI", 227],
    ["RCTL", 228], ["RSHFT", 229], ["RALT", 230], ["RGUI", 231],
  ];
  for (const [name, usageId] of modKeycodes) {
    if (!lookup.has(name)) {
      lookup.set(name, (0x07 << 16) + usageId);
    }
  }

  // Other common keys
  const otherKeycodes: [string, number][] = [
    ["RET", 40], ["ESC", 41], ["BSPC", 42], ["TAB", 43], ["SPACE", 44],
    ["MINUS", 45], ["EQUAL", 46], ["LBKT", 47], ["RBKT", 48],
    ["BSLH", 49], ["SEMI", 51], ["SQT", 52], ["GRAVE", 53],
    ["COMMA", 54], ["DOT", 55], ["FSLH", 56], ["CAPS", 57],
    ["PRSC", 70], ["SLCK", 71], ["PAUSE", 72], ["INS", 73],
    ["HOME", 74], ["PGUP", 75], ["DEL", 76], ["END", 77], ["PGDN", 78],
    ["RIGHT", 79], ["LEFT", 80], ["DOWN", 81], ["UP", 82],
  ];
  for (const [name, usageId] of otherKeycodes) {
    if (!lookup.has(name)) {
      lookup.set(name, (0x07 << 16) + usageId);
    }
  }

  // Consumer page (0x0C) keycodes
  const consumerKeycodes: [string, number][] = [
    ["C_MUTE", 226], ["C_VOL_UP", 233], ["C_VOL_DN", 234],
    ["C_PP", 205], ["C_NEXT", 181], ["C_PREV", 182],
    ["C_STOP", 183], ["C_BRI_UP", 111], ["C_BRI_DN", 112],
  ];
  for (const [name, usageId] of consumerKeycodes) {
    if (!lookup.has(name)) {
      lookup.set(name, (0x0c << 16) + usageId);
    }
  }

  return lookup;
}

const keycodeLookup = buildZmkKeycodeLookup();

// Common ZMK behavior reference names -> standardized names
const behaviorAliases: Record<string, string> = {
  kp: "Key Press",
  mo: "Momentary Layer",
  mt: "Mod-Tap",
  lt: "Layer-Tap",
  to: "To Layer",
  tog: "Toggle Layer",
  trans: "Transparent",
  none: "None",
  sk: "Sticky Key",
  sl: "Sticky Layer",
  hl: "Hold-Tap Layer",
};

export function parseKeymapFile(content: string): ParsedLayer[] {
  const layers: ParsedLayer[] = [];

  // Remove C preprocessor lines and comments
  const keymapBlock = content.replace(/#include.*/g, "").replace(/\/\/.*$/gm, "");

  let match;
  // We need a simpler approach: find each layer definition
  const layerBlockRegex = /(\w+)\s*\{[\s\S]*?bindings\s*=\s*<([^>]*)>\s*;/g;

  while ((match = layerBlockRegex.exec(keymapBlock)) !== null) {
    const layerName = match[1];
    const bindingsStr = match[2];

    // Skip non-layer nodes (compatible, keymap, etc.)
    if (["compatible", "keymap", "behaviors"].includes(layerName)) continue;

    // Parse display-name if present
    const displayNameMatch = keymapBlock.substring(
      match.index,
      match.index + match[0].length
    ).match(/display-name\s*=\s*"([^"]*)"/);
    const displayName = displayNameMatch ? displayNameMatch[1] : layerName;

    // Parse individual bindings
    const bindings: ParsedBinding[] = [];
    const bindingRegex = /&(\w+)(?:\s+(\S+))?(?:\s+(\S+))?(?:\s+(\S+))?/g;

    let bMatch;
    while ((bMatch = bindingRegex.exec(bindingsStr)) !== null) {
      const behavior = bMatch[1];
      const params: number[] = [];

      for (let i = 2; i < bMatch.length && bMatch[i]; i++) {
        const val = bMatch[i];
        const num = parseInt(val, 10);
        if (!isNaN(num)) {
          params.push(num);
        } else {
          // Try to resolve as a ZMK keycode
          const code = keycodeLookup.get(val.toUpperCase());
          if (code !== undefined) {
            params.push(code);
          } else {
            // Try as-is (might be a layer name or other reference)
            params.push(num || 0);
          }
        }
      }

      bindings.push({ behavior, params });
    }

    if (bindings.length > 0) {
      layers.push({ name: displayName, bindings });
    }
  }

  return layers;
}

export { keycodeLookup, behaviorAliases };