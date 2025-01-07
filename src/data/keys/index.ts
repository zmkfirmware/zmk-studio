import { keyboard } from "./keyboard.ts";
import { consumer } from "./consumer.ts";
export const keyboards = [
    {
      Kind: "Defined",
      Id: 12,
      Name: "Consumer",
      UsageIds: consumer,
      UsageIdGenerator: null,
    },
    {
      Kind: "Defined",
      Id: 7,
      Name: "Keyboard/Keypad",
      UsageIds: keyboard,
      UsageIdGenerator: null,
    },
  ];
