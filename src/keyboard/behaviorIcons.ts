import {
  Keyboard,
  Hand,
  Layers,
  Pin,
  Repeat,
  ToggleLeft,
  Minus,
  Download,
  Power,
  Bluetooth,
  Unlock,
  LucideIcon,
} from "lucide-react";

// Maps behavior displayNames to lucide-react icons.
// CUSTOMIZATION POINT: Add or change icon mappings here.
const behaviorIconMap: Record<string, LucideIcon> = {
  "Key Press": Keyboard,
  "Hold Tap": Hand,
  "Momentary Layer": Layers,
  "Toggle Layer": Layers,
  "Sticky Key": Pin,
  "Key Repeat": Repeat,
  "Key Toggle": ToggleLeft,
  Transparent: Minus,
  Bootloader: Download,
  "External Power": Power,
  "Output Selection": Bluetooth,
  "Studio Unlock": Unlock,
};

export function getBehaviorIcon(displayName: string): LucideIcon | undefined {
  return behaviorIconMap[displayName];
}
