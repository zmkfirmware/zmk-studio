import { useEffect, useMemo, useState } from "react";

import {
  GetBehaviorDetailsResponse,
  BehaviorBindingParametersSet,
  BehaviorParameterValueDescription,
} from "zmk-studio-ts-client/behaviors";
import { BehaviorBinding } from "zmk-studio-ts-client/keymap";
import { BehaviorParametersPicker } from "./BehaviorParametersPicker";
import { hid_usage_page_and_id_from_usage } from "../hid-usages";

export interface BehaviorBindingPickerProps {
  binding: BehaviorBinding;
  behaviors: GetBehaviorDetailsResponse[];
  layerNames: string[];
  onBindingChanged: (binding: BehaviorBinding) => void;
}

function validateValue(
  layerCount: number,
  value?: number,
  values?: BehaviorParameterValueDescription[],
): boolean {
  if (value === undefined) {
    return values === undefined || values?.length === 0 || !!values[0].nil;
  }

  const matchingValue = values?.find((v) => {
    if (v.constant !== undefined) {
      return v.constant == value;
    } else if (v.range) {
      return value >= v.range.min && value <= v.range.max;
    } else if (v.hidUsage) {
      const [page, id] = hid_usage_page_and_id_from_usage(value);
      return page !== 0 && id !== 0;
    } else if (v.layerIndex) {
      return value >= 0 && value < layerCount;
    } else if (v.nil) {
      return value === 0;
    } else {
      console.error("Unknown check type!");
      return false;
    }
  });

  return !!matchingValue || (value === 0 && (!values || values.length === 0));
}

function validateBinding(
  metadata: BehaviorBindingParametersSet[],
  layerCount: number,
  param1?: number,
  param2?: number,
): boolean {
  if (param1 === undefined) {
    return metadata.every((s) => !s.param1);
  }

  let matchingSet = metadata.find((s) =>
    validateValue(layerCount, param1, s.param1),
  );

  if (!matchingSet) {
    return false;
  }

  return validateValue(layerCount, param2, matchingSet.param2);
}

export const BehaviorBindingPicker = ({
  binding,
  layerNames,
  behaviors,
  onBindingChanged,
}: BehaviorBindingPickerProps) => {
  console.log("Binding", binding);
  const [behaviorId, setBehaviorId] = useState(binding.behaviorId);
  const [param1, setParam1] = useState<number | undefined>(binding.param1);
  const [param2, setParam2] = useState<number | undefined>(binding.param2);

  const metadata = useMemo(
    () => behaviors.find((b) => b.id == behaviorId)?.metadata,
    [behaviorId, behaviors],
  );

  useEffect(() => {
    if (
      binding.behaviorId === behaviorId &&
      binding.param1 === param1 &&
      binding.param2 == param2
    ) {
      return;
    }

    if (!metadata) {
      console.error(
        "Can't find metadata for the selected behaviorId",
        behaviorId,
      );
      return;
    }

    if (validateBinding(metadata, layerNames.length, param1, param2)) {
      onBindingChanged({
        behaviorId,
        param1: param1 || 0,
        param2: param2 || 0,
      });
    }
  }, [behaviorId, param1, param2]);

  useEffect(() => {
    console.log("Loading from a changed binding", binding);
    setBehaviorId(binding.behaviorId);
    setParam1(binding.param1);
    setParam2(binding.param2);
  }, [binding]);

  console.log("Rendering with", behaviorId, param1, param2);

  return (
    <div>
      <label>Behavior:</label>
      <select
        value={behaviorId}
        onChange={(e) => {
          setBehaviorId(parseInt(e.target.value));
          setParam1(0);
          setParam2(0);
        }}
      >
        {behaviors.map((b) => (
          <option value={b.id}>{b.displayName}</option>
        ))}
      </select>
      {metadata && (
        <BehaviorParametersPicker
          metadata={metadata}
          param1={param1}
          param2={param2}
          layerNames={layerNames}
          onParam1Changed={setParam1}
          onParam2Changed={setParam2}
        />
      )}
    </div>
  );
};
