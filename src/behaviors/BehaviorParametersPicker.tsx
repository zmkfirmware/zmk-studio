import { BehaviorBindingParametersSet } from "zmk-studio-ts-client/behaviors";
import { ParameterValuePicker } from "./ParameterValuePicker";

export interface BehaviorParametersPickerProps {
  param1?: number;
  param2?: number;
  metadata: BehaviorBindingParametersSet[];
  layerNames: string[];
  onParam1Changed: (value?: number) => void;
  onParam2Changed: (value?: number) => void;
}

export const BehaviorParametersPicker = ({
  param1,
  param2,
  metadata,
  layerNames,
  onParam1Changed,
  onParam2Changed,
}: BehaviorParametersPickerProps) => {
  if (param1 === undefined) {
    return (
      <div>
        <ParameterValuePicker
          values={metadata.flatMap((m) => m.param1)}
          onValueChanged={onParam1Changed}
          layerNames={layerNames}
        />
      </div>
    );
  } else {
    const set = metadata.find((s) =>
      s.param1.find((v) => v.constant == param1)
    );
    return (
      <div>
        <ParameterValuePicker
          values={metadata.flatMap((m) => m.param1)}
          value={param1}
          layerNames={layerNames}
          onValueChanged={onParam1Changed}
        />
        {set?.param2 && set.param2.length > 0 && (
          <ParameterValuePicker
            values={set.param2}
            value={param2}
            layerNames={layerNames}
            onValueChanged={onParam2Changed}
          />
        )}
      </div>
    );
  }
};
