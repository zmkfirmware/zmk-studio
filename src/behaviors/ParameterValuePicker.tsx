import { useEffect, useState } from "react";
import { BehaviorParameterValueDescription } from "ts-zmk-rpc-core/behaviors";
import { hid_usage_from_page_and_id, hid_usage_page_and_id_from_usage, hid_usage_page_get_ids } from "../hid-usages";

export interface ParameterValuePickerProps {
    value?: number;
    values: BehaviorParameterValueDescription[];
    layerNames: string[];
    onValueChanged: (value?: number) => void 
}

export const ParameterValuePicker = ({value, values, layerNames, onValueChanged}: ParameterValuePickerProps) => {
    if (values.length == 0) {
        return (<></>);
    } else if (values.every((v) => v.constant !== undefined)) {
        console.log("Loading a constant list wtih", value, values);
        return (
            <div>
                <select value={value} onChange={(e) => onValueChanged(parseInt(e.target.value))}>
                    {values.map((v) => (<option value={v.constant}>{v.name}</option>))}
                </select>
            </div>
        );
    } else if (values.length == 1) {
        if (values[0].range) {
            return (
                <div>
                    <label>{values[0].name}</label>
                    <input type="number" min={values[0].range.min} max={values[0].range.max} value={value} onChange={(e) => onValueChanged(parseInt(e.target.value))} />
                </div>
            );
        } else if (values[0].hidUsage) {
            const [page, setPage] = useState<number | undefined>(undefined);
            const [id, setId] = useState<number | undefined>(undefined);

            useEffect(() => {
                if (!value) {
                    setPage(undefined);
                    setId(undefined);
                    return;
                }

                let [newPage, newId] = hid_usage_page_and_id_from_usage(value);

                // Support implicit mods
                newPage &= 0xFF;

                setPage(newPage);
                setId(newId);
            }, [value]);

            useEffect(() => {
                if (page && id) {
                    const usage = hid_usage_from_page_and_id(page, id);
                    if (value != usage) {
                        onValueChanged(usage);
                    }
                }
            }, [page, id]);

            return (
                <div>
                    <label>{values[0].name}</label>
                    <div>
                        <label>Page:</label>
                        <select value={page} onChange={(e) => setPage(e.target.value === "" ? undefined : parseInt(e.target.value))}>
                            <option value="7">Keyboard/Keypad</option>
                            <option value="12">Consumer</option>
                        </select>
                        { page && (
                            <div>
                                <label>ID:</label>
                                <select value={id} onChange={(e) => setId(e.target.value === "" ? undefined : parseInt(e.target.value))}>
                                    <option value=""></option>
                                    {hid_usage_page_get_ids(page).map((u) => <option value={u.Id}>{u.Name}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            );
        } else if (values[0].layerIndex) {
            return (
                <div>
                    <label>{values[0].name}</label>
                    <select value={value} onChange={(e) => onValueChanged(parseInt(e.target.value))}>
                        {layerNames.map((n, idx) => (<option value={idx}>{n}</option>))}
                    </select>
                </div>
            );
        }
    } else {
        console.log("Not sure how to handle", values);
        return (
            <><p>Some composite?</p></>
        );
    }

    return (<></>);
}