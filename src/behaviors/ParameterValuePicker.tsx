import { BehaviorParameterValueDescription } from "zmk-studio-ts-client/behaviors";
import { HidUsagePicker } from "./HidUsagePicker";

export interface ParameterValuePickerProps {
  value?: number;
  values: BehaviorParameterValueDescription[];
  layerNames: string[];
  onValueChanged: (value?: number) => void;
}

export const ParameterValuePicker = ({
  value,
  values,
  layerNames,
  onValueChanged,
}: ParameterValuePickerProps) => {
  if (values.length == 0) {
    return <></>;
  } else if (values.every((v) => v.constant !== undefined)) {
    console.log("Loading a constant list wtih", value, values);
    return (
      <div>
        <select
          value={value}
          onChange={(e) => onValueChanged(parseInt(e.target.value))}
        >
          {values.map((v) => (
            <option value={v.constant}>{v.name}</option>
          ))}
        </select>
      </div>
    );
  } else if (values.length == 1) {
    if (values[0].range) {
      return (
        <div>
          <label>{values[0].name}</label>
          <input
            type="number"
            min={values[0].range.min}
            max={values[0].range.max}
            value={value}
            onChange={(e) => onValueChanged(parseInt(e.target.value))}
          />
        </div>
      );
    } else if (values[0].hidUsage) {
      return (
        <HidUsagePicker
          onValueChanged={onValueChanged}
          value={value}
          usagePages={[7, 12]}
        />
      );
    } else if (values[0].layerIndex) {
      return (
        <div>
          <label>{values[0].name}</label>
          <select
            value={value}
            onChange={(e) => onValueChanged(parseInt(e.target.value))}
          >
            {layerNames.map((n, idx) => (
              <option value={idx}>{n}</option>
            ))}
          </select>
        </div>
      );
    }
  } else {
    console.log("Not sure how to handle", values);
    return (
      <>
        <p>Some composite?</p>
      </>
    );
  }

  return <></>;
};
