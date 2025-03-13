import { BehaviorBindingParametersSet } from '@zmkfirmware/zmk-studio-ts-client/behaviors'
import { ParameterValuePicker } from './ParameterValuePicker'
import { validateValue } from './parameters'

export interface BehaviorParametersPickerProps {
    param1?: number
    param2?: number
    metadata: BehaviorBindingParametersSet[]
    layers: { id: number; name: string }[]
    onParam1Changed: (value?: number) => void
    onParam2Changed: (value?: number) => void
}

export const BehaviorParametersPicker = ({
    param1,
    param2,
    metadata,
    layers,
    onParam1Changed,
    onParam2Changed,
}: BehaviorParametersPickerProps) => {
    // console.log(
    //     param1,
    //     param2,
    //     metadata,
    //     layers);
    if (param1 === undefined) {
        return (
            <div>
                <ParameterValuePicker
                    values={metadata.flatMap((m) => m.param1)}
                    onValueChanged={onParam1Changed}
                    layers={layers}
                />
            </div>
        )
    } else {
        const set = metadata.find((s) =>
            validateValue( layers.map((l) => l.id), param1, s.param1 )
        )
        return (
            <>
                <ParameterValuePicker
                    values={metadata.flatMap((m) => m.param1)}
                    value={param1}
                    layers={layers}
                    onValueChanged={onParam1Changed}
                />
                {(set?.param2?.length || 0) > 0 && (
                    <ParameterValuePicker
                        values={set!.param2}
                        value={param2}
                        layers={layers}
                        onValueChanged={onParam2Changed}
                    />
                )}
            </>
        )
    }
}
