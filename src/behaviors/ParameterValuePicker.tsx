import { BehaviorParameterValueDescription } from '@zmkfirmware/zmk-studio-ts-client/behaviors';
import { KeysLayout } from '../components/keycodes/KeysLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx"
import { Label } from "@/components/ui/label.tsx"
import { Input } from "@/components/ui/input.tsx"

export interface ParameterValuePickerProps {
    value?: number;
    values: BehaviorParameterValueDescription[];
    layers: { id: number; name: string }[];
    onValueChanged: (value?: number) => void;
    onKeysLayoutActive?: (isActive: boolean) => void;
    onKeySelected?: (key: number | undefined) => void;
    onModifiersChanged?: (modifiers: any[]) => void;
}

const ConstantValuePicker = ({ value, values, onValueChanged }: ParameterValuePickerProps) => (
    <>
        {/*<Label htmlFor="constantValuePicker">Select value</Label>*/}
        <Select onValueChange={(e) => {
            console.log(e)
            onValueChanged( parseInt( e ) )
        }} value={value?.toString()}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Constant Value Picker" />
            </SelectTrigger>
            <SelectContent>
                {values.map((v) => (
                    // <option key={v.constant} value={v.constant}>{v.name}</option>
                    <SelectItem key={v.constant} value={v.constant.toString()}>{v.name}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    </>
);

const RangeValuePicker = ({ value, values, onValueChanged }: ParameterValuePickerProps) => (
    <>
        <Label htmlFor='rangeValuePicker'>{values[0].name}: </Label>
        <Input
            id='rangeValuePicker'
            type="number"
            min={values[0].range?.min}
            max={values[0].range?.max}
            value={value}
            onChange={(e) => onValueChanged(parseInt(e.target.value))}
        />
    </>
);

const LayerValuePicker = ({ value, values, layers, onValueChanged }: ParameterValuePickerProps) => (
    <>
        <Label htmlFor="layerValuePicker">{values[0].name}:</Label>
        <Select onValueChange={(e) => onValueChanged( parseInt( e ) )} value={value?.toString()}>
            <SelectTrigger id='layerValuePicker' className="w-[180px]">
                <SelectValue placeholder="Constant Value Picker" />
            </SelectTrigger>
            <SelectContent>
                {layers.map(({ id, name }) => (
                    <SelectItem key={id} value={id.toString()}>{name}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    </>
);

export const ParameterValuePicker = ({ value, values, layers, onValueChanged, onKeysLayoutActive, onKeySelected, onModifiersChanged }: ParameterValuePickerProps) => {
    // console.log("ParameterValuePicker values:", { value, values });

    if (values.length === 0) {
        onKeysLayoutActive?.(false);
        return null;
    }

    if (values.every(v => v.constant !== undefined)) {
        console.log("ConstantValuePicker", values);
        onKeysLayoutActive?.(false);
        return <ConstantValuePicker value={value} values={values} onValueChanged={onValueChanged} layers={layers} />;
    }

    if (values.length === 1) {
        if (values[0].range) {
            console.log("range", values[0].range);
            onKeysLayoutActive?.(false);
            return <RangeValuePicker value={value} values={values} onValueChanged={onValueChanged} layers={layers} />;
        }

        if (values[0].hidUsage) {
            console.log("KeysLayout with modifier support", values[0].hidUsage);
            onKeysLayoutActive?.(true);
            return (
                <KeysLayout
                    onValueChanged={onValueChanged}
                    label={values[0].name}
                    value={value}
                    onKeySelected={onKeySelected}
                    onModifiersChanged={onModifiersChanged}
                />
            );
        }

        if (values[0].layerId) {
            console.log("LayerValuePicker", values[0].layerId);
            onKeysLayoutActive?.(false);
            return <LayerValuePicker value={value} values={values} onValueChanged={onValueChanged} layers={layers} />;
        }
    }

    console.log("Unhandled value structure:", values);
    onKeysLayoutActive?.(false);
    return <p>Unsupported parameter configuration.</p>;
};
