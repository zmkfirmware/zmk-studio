import { BehaviorParameterValueDescription } from '@zmkfirmware/zmk-studio-ts-client/behaviors';
import { KeysLayout } from '../components/keycodes/KeysLayout';
import { HidUsagePicker } from "./HidUsagePicker.tsx"

export interface ParameterValuePickerProps {
    value?: number;
    values: BehaviorParameterValueDescription[];
    layers: { id: number; name: string }[];
    onValueChanged: (value?: number) => void;
}

const ConstantValuePicker = ({ value, values, onValueChanged }: ParameterValuePickerProps) => (
    <div>
        <select
            value={value}
            className="h-8 rounded"
            onChange={(e) => onValueChanged(parseInt(e.target.value))}
        >
            {values.map((v) => (
                <option key={v.constant} value={v.constant}>{v.name}</option>
            ))}
        </select>
    </div>
);

const RangeValuePicker = ({ value, values, onValueChanged }: ParameterValuePickerProps) => (
    <div>
        <label>{values[0].name}: </label>
        <input
            type="number"
            min={values[0].range?.min}
            max={values[0].range?.max}
            value={value}
            onChange={(e) => onValueChanged(parseInt(e.target.value))}
        />
    </div>
);

const LayerValuePicker = ({ value, values, layers, onValueChanged }: ParameterValuePickerProps) => (
    <div>
        <label>{values[0].name}: </label>
        <select
            value={value}
            className="h-8 rounded"
            onChange={(e) => onValueChanged(parseInt(e.target.value))}
        >
            {layers.map(({ id, name }) => (
                <option key={id} value={id}>{name}</option>
            ))}
        </select>
    </div>
);

export const ParameterValuePicker = ({ value, values, layers, onValueChanged }: ParameterValuePickerProps) => {
    // console.log("ParameterValuePicker values:", { value, values });

    if (values.length === 0) {
        return null;
    }

    if (values.every(v => v.constant !== undefined)) {
        console.log("ConstantValuePicker", values);
        return <ConstantValuePicker value={value} values={values} onValueChanged={onValueChanged} layers={layers} />;
    }

    if (values.length === 1) {
        if (values[0].range) {
            console.log("range", values[0].range);
            return <RangeValuePicker value={value} values={values} onValueChanged={onValueChanged} layers={layers} />;
        }

        if (values[0].hidUsage) {
            console.log("KeysLayout with modifier support", values[0].hidUsage);
            return (
                <KeysLayout
                    onValueChanged={onValueChanged}
                    label={values[0].name}
                    value={value}
                />
            );
        }

        if (values[0].layerId) {
            console.log("LayerValuePicker", values[0].layerId);
            return <LayerValuePicker value={value} values={values} onValueChanged={onValueChanged} layers={layers} />;
        }
    }

    console.log("Unhandled value structure:", values);
    return <p>Unsupported parameter configuration.</p>;
};
