import { Keymap } from "@zmkfirmware/zmk-studio-ts-client/keymap";
import { BehaviorMap } from "./Behaviors.ts";

export interface ZMKConfigOptions {
    keyboardName: string;
    keymapName: string;
    includeBehaviors?: boolean;
    includeLayers?: boolean;
}

export function generateZMKKeymapFile(
    keymap: Keymap,
    behaviors: BehaviorMap,
    options: ZMKConfigOptions
): string {
    let config = `// Generated ZMK keymap for ${options.keyboardName}\n`;
    config += `// Keymap: ${options.keymapName}\n\n`;

    // Generate layer definitions
    if (keymap.layers && options.includeLayers) {
        config += `// Layer definitions\n`;
        keymap.layers.forEach((layer, index) => {
            config += `#define L${index} ${layer.id}\n`;
        });
        config += `\n`;
    }

    // Generate keymap bindings
    config += `// Keymap bindings\n`;
    config += `keymap {\n`;
    config += `    compatible = "zmk,keymap";\n\n`;

    keymap.layers.forEach((layer, layerIndex) => {
        config += `    layer_${layerIndex} {\n`;
        config += `        label = "Layer ${layerIndex}";\n`;
        config += `        bindings = <\n`;

        layer.bindings.forEach((binding, keyIndex) => {
            const behavior = behaviors[binding.behaviorId];
            if (behavior) {
                const keyCode = generateKeyCode(binding, behavior);
                config += `            ${keyCode}`;
                if (keyIndex < layer.bindings.length - 1) {
                    config += `,`;
                }
                config += `\n`;
            }
        });

        config += `        >;\n`;
        config += `    };\n\n`;
    });

    config += `};\n`;

    return config;
}

export function generateZMKConfigFile(options: ZMKConfigOptions): string {
    let config = `// Generated ZMK configuration for ${options.keyboardName}\n`;
    config += `// Configuration: ${options.keymapName}\n\n`;

    // Basic configuration
    config += `// Enable USB logging\n`;
    config += `CONFIG_ZMK_USB_LOGGING=y\n\n`;

    config += `// Enable Bluetooth\n`;
    config += `CONFIG_BT=y\n`;
    config += `CONFIG_BT_PERIPHERAL=y\n`;
    config += `CONFIG_BT_DEVICE_NAME="${options.keyboardName}"\n\n`;

    config += `// Enable battery reporting\n`;
    config += `CONFIG_ZMK_BATTERY_REPORTING=y\n`;
    config += `CONFIG_ZMK_BATTERY_REPORT_INTERVAL=60000\n\n`;

    config += `// Enable RGB underglow (if supported)\n`;
    config += `CONFIG_ZMK_RGB_UNDERGLOW=y\n`;
    config += `CONFIG_WS2812_STRIP=y\n\n`;

    config += `// Enable combos\n`;
    config += `CONFIG_ZMK_COMBO_MAX_COMBOS_PER_KEY=6\n`;
    config += `CONFIG_ZMK_COMBO_MAX_KEYS_PER_COMBO=4\n\n`;

    return config;
}

function generateKeyCode(binding: any, behavior: any): string {
    // Map behavior types to ZMK key codes
    switch (behavior.displayName) {
        case "Key Press":
            return `&kp ${getHIDUsageName(binding.param1)}`;
        case "Modifier":
            return `&kp ${getModifierName(binding.param1)}`;
        case "Layer":
            return `&mo ${binding.param1}`;
        case "Transparent":
            return `&trans`;
        case "None":
            return `&none`;
        default:
            return `&kp ${getHIDUsageName(binding.param1)}`;
    }
}

function getHIDUsageName(hidUsage: number): string {
    // Map HID usage codes to ZMK key names
    const hidMap: Record<number, string> = {
        0x04: "A", 0x05: "B", 0x06: "C", 0x07: "D", 0x08: "E", 0x09: "F",
        0x0A: "G", 0x0B: "H", 0x0C: "I", 0x0D: "J", 0x0E: "K", 0x0F: "L",
        0x10: "M", 0x11: "N", 0x12: "O", 0x13: "P", 0x14: "Q", 0x15: "R",
        0x16: "S", 0x17: "T", 0x18: "U", 0x19: "V", 0x1A: "W", 0x1B: "X",
        0x1C: "Y", 0x1D: "Z",
        0x1E: "N1", 0x1F: "N2", 0x20: "N3", 0x21: "N4", 0x22: "N5",
        0x23: "N6", 0x24: "N7", 0x25: "N8", 0x26: "N9", 0x27: "N0",
        0x28: "ENTER", 0x29: "ESCAPE", 0x2A: "BACKSPACE", 0x2B: "TAB",
        0x2C: "SPACE", 0x2D: "MINUS", 0x2E: "EQUAL", 0x2F: "LEFTBRACE",
        0x30: "RIGHTBRACE", 0x31: "BACKSLASH", 0x32: "HASH", 0x33: "SEMICOLON",
        0x34: "APOSTROPHE", 0x35: "GRAVE", 0x36: "COMMA", 0x37: "DOT",
        0x38: "SLASH", 0x39: "CAPSLOCK",
        0x3A: "F1", 0x3B: "F2", 0x3C: "F3", 0x3D: "F4", 0x3E: "F5", 0x3F: "F6",
        0x40: "F7", 0x41: "F8", 0x42: "F9", 0x43: "F10", 0x44: "F11", 0x45: "F12",
        0x46: "PRINT", 0x47: "SCROLLLOCK", 0x48: "PAUSE", 0x49: "INSERT",
        0x4A: "HOME", 0x4B: "PAGEUP", 0x4C: "DELETE", 0x4D: "END",
        0x4E: "PAGEDOWN", 0x4F: "RIGHT", 0x50: "LEFT", 0x51: "DOWN", 0x52: "UP",
        0x53: "NUMLOCK", 0x54: "KPSLASH", 0x55: "KPASTERISK", 0x56: "KPMINUS",
        0x57: "KPPLUS", 0x58: "KPENTER", 0x59: "KP1", 0x5A: "KP2", 0x5B: "KP3",
        0x5C: "KP4", 0x5D: "KP5", 0x5E: "KP6", 0x5F: "KP7", 0x60: "KP8",
        0x61: "KP9", 0x62: "KP0", 0x63: "KPDOT",
        0x64: "NONUSBACKSLASH", 0x65: "COMPOSE", 0x66: "POWER", 0x67: "KPEQUAL",
        0x68: "F13", 0x69: "F14", 0x6A: "F15", 0x6B: "F16", 0x6C: "F17",
        0x6D: "F18", 0x6E: "F19", 0x6F: "F20", 0x70: "F21", 0x71: "F22",
        0x72: "F23", 0x73: "F24",
        0x74: "OPEN", 0x75: "HELP", 0x76: "PROPS", 0x77: "FRONT", 0x78: "STOP",
        0x79: "AGAIN", 0x7A: "UNDO", 0x7B: "CUT", 0x7C: "COPY", 0x7D: "PASTE",
        0x7E: "FIND", 0x7F: "MUTE", 0x80: "VOLUMEUP", 0x81: "VOLUMEDOWN",
        0x82: "LOCKINGCAPSLOCK", 0x83: "LOCKINGNUMLOCK", 0x84: "LOCKINGSCROLLLOCK",
        0x85: "KPCOMMA", 0x86: "EQUAL", 0x87: "RO", 0x88: "KATAKANAHIRAGANA",
        0x89: "YEN", 0x8A: "HENKAN", 0x8B: "MUHENKAN", 0x8C: "KPJPCOMMA",
        0x8D: "HANGEUL", 0x8E: "HANJA", 0x8F: "KATAKANA", 0x90: "HIRAGANA",
        0x91: "ZENKAKUHANKAKU", 0x92: "KPLEFTPAREN", 0x93: "KPRIGHTPAREN",
        0x94: "LEFTCTRL", 0x95: "LEFTSHIFT", 0x96: "LEFTALT", 0x97: "LEFTMETA",
        0x98: "RIGHTCTRL", 0x99: "RIGHTSHIFT", 0x9A: "RIGHTALT", 0x9B: "RIGHTMETA",
        0x9C: "MEDIAPLAYPAUSE", 0x9D: "MEDIASTOPCD", 0x9E: "MEDIAPREVIOUSSONG",
        0x9F: "MEDIANEXTSONG", 0xA0: "MEDIAEJECTCD", 0xA1: "VOLUMEUP",
        0xA2: "VOLUMEDOWN", 0xA3: "MUTE", 0xA4: "WWW", 0xA5: "BACK",
        0xA6: "FORWARD", 0xA7: "STOP", 0xA8: "FIND", 0xA9: "SCROLLUP",
        0xAA: "SCROLLDOWN", 0xAB: "EDIT", 0xAC: "SLEEP", 0xAD: "COFFEE",
        0xAE: "REFRESH", 0xAF: "CALC"
    };

    return hidMap[hidUsage] || `UNKNOWN_${hidUsage.toString(16)}`;
}

function getModifierName(modifier: number): string {
    const modifierMap: Record<number, string> = {
        0x01: "LEFTCTRL", 0x02: "LEFTSHIFT", 0x04: "LEFTALT", 0x08: "LEFTMETA",
        0x10: "RIGHTCTRL", 0x20: "RIGHTSHIFT", 0x40: "RIGHTALT", 0x80: "RIGHTMETA"
    };

    return modifierMap[modifier] || `MOD_${modifier.toString(16)}`;
}

export function downloadConfigFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function downloadConfigZip(keymapContent: string, configContent: string, keyboardName: string): void {
    // For now, we'll download the files separately
    // In a full implementation, you'd use a library like JSZip to create a zip file
    downloadConfigFile(keymapContent, `${keyboardName}.keymap`);
    setTimeout(() => {
        downloadConfigFile(configContent, `${keyboardName}.conf`);
    }, 100);
}
