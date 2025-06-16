import {
  Keymap,
  BehaviorBinding,
} from "@zmkfirmware/zmk-studio-ts-client/keymap";
import { GetBehaviorDetailsResponse } from "@zmkfirmware/zmk-studio-ts-client/behaviors";

type BehaviorMap = Record<number, GetBehaviorDetailsResponse>;

function bindingToString(
  binding: BehaviorBinding,
  behaviors: BehaviorMap,
): string {
  const behavior = behaviors[binding.behaviorId];
  if (!behavior) {
    return "&none";
  }

  // Get the behavior reference (e.g., &kp, &lt, etc.)
  const behaviorRef = `&${behavior.displayName.toLowerCase().replace(/\s+/g, "_")}`;

  if (binding.param1 === 0 && binding.param2 === 0) {
    return behaviorRef;
  } else if (binding.param2 === 0) {
    return `${behaviorRef} ${binding.param1}`;
  } else {
    return `${behaviorRef} ${binding.param1} ${binding.param2}`;
  }
}

export function exportKeymap(keymap: Keymap, behaviors: BehaviorMap): string {
  const timestamp = new Date().toISOString();

  let keymapFile = `/*
 * Copyright (c) ${new Date().getFullYear()} The ZMK Contributors
 *
 * SPDX-License-Identifier: MIT
 *
 * This keymap was exported from ZMK Studio on ${timestamp}
 */

#include <behaviors.dtsi>
#include <dt-bindings/zmk/keys.h>

/ {
    keymap {
        compatible = "zmk,keymap";

`;

  keymap.layers.forEach((layer, index) => {
    const layerName = layer.name || `layer_${index}`;
    keymapFile += `        ${layerName.toLowerCase().replace(/\s+/g, "_")} {
            display-name = "${layerName}";
            bindings =
`;

    const bindingsPerRow = 12; // This value does not matter, just for readability in .keymap
    for (let i = 0; i < layer.bindings.length; i++) {
      if (i > 0 && i % bindingsPerRow === 0) {
        keymapFile += "\n";
      }
      keymapFile += `                ${bindingToString(layer.bindings[i], behaviors)}`;
      if (i < layer.bindings.length - 1) {
        keymapFile += " ";
      }
    }

    keymapFile += `
            >;
        };

`;
  });

  keymapFile += `    };
};`;

  return keymapFile;
}
