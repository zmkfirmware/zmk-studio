import { useCallback, useEffect, useMemo, useState } from 'react'

import { callRemoteProcedureControl } from '../../rpc/logging.ts'
import {
    Keymap,
    BehaviorBinding,
    SetLayerBindingResponse,
} from '@zmkfirmware/zmk-studio-ts-client/keymap'

import { Keymap as KeymapComp } from './Keymap.tsx'
import { useConnectedDeviceData } from '../../rpc/useConnectedDeviceData.ts'

import { BehaviorBindingPicker } from '../../behaviors/BehaviorBindingPicker.tsx'
import { produce } from 'immer'
import { LayoutZoom } from './PhysicalLayout.tsx'
import { useLocalStorageState } from '../../misc/useLocalStorageState.ts'
import { KeysLayout } from '../keycodes/KeysLayout.tsx'
import { deserializeLayoutZoom } from '../../helpers/helpers.ts'
import { useLayout } from "../../helpers/useLayouts.ts";
import { X } from 'lucide-react'
import { Zoom } from '../Zoom.tsx'
import useConnectionStore from '../../stores/ConnectionStore.ts'
import undoRedoStore from '../../stores/UndoRedoStore.ts'
import { useBehaviors } from "../../helpers/Behaviors.ts";

export default function Keyboard() {
    const { layouts, selectedPhysicalLayoutIndex } = useLayout()

    const [keymap, setKeymap] = useConnectedDeviceData<Keymap>(
        { keymap: { getKeymap: true } },
        (keymap) => {
            console.log('Got the keymap!')
            return keymap?.keymap?.getKeymap
        },
        true,
    )

    const [keymapScale, setKeymapScale] = useLocalStorageState<LayoutZoom>(
        'keymapScale',
        'auto',
        { deserialize: deserializeLayoutZoom },
    )
    const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(0)
    const [selectedKeyPosition, setSelectedKeyPosition] = useState<
        number | undefined
    >(undefined)
    const behaviors = useBehaviors()
    // const undoRedo = useContext(UndoRedoContext);
    const { doIt } = undoRedoStore()
    const { connection } = useConnectionStore()
    const [selectedKey, setSelectedKey] = useState<boolean>(false)

    useEffect(() => {
        setSelectedLayerIndex(0)
        setSelectedKeyPosition(undefined)
    }, [connection])

    useEffect(() => {
        async function performSetRequest() {
            if (!connection || !layouts) {
                return
            }
            // console.log(connection, selectedPhysicalLayoutIndex)
            const resp = await callRemoteProcedureControl(connection, {
                keymap: {
                    setActivePhysicalLayout: selectedPhysicalLayoutIndex,
                },
            })

            const new_keymap = resp?.keymap?.setActivePhysicalLayout?.ok
            if (new_keymap) {
                setKeymap(new_keymap)
            } else {
                console.error(
                    'Failed to set the active physical layout err:',
                    resp?.keymap?.setActivePhysicalLayout?.err,
                )
            }
        }

        performSetRequest()
    }, [selectedPhysicalLayoutIndex])

    // const doSelectPhysicalLayout = useCallback(
    //     (i: number) => {
    //         const oldLayout = selectedPhysicalLayoutIndex
    //         doIt?.(async () => {
    //             setSelectedPhysicalLayoutIndex(i)
    //
    //             return async () => {
    //                 setSelectedPhysicalLayoutIndex(oldLayout)
    //             }
    //         })
    //     },
    //     [doIt, selectedPhysicalLayoutIndex],
    // )

    const doUpdateBinding = useCallback( (binding: BehaviorBinding) => {
            if (!keymap || selectedKeyPosition === undefined) {
                console.error(
                    "Can't update binding without a selected key position and loaded keymap",
                )
                return
            }
            const layer = selectedLayerIndex
            const layerId = keymap.layers[layer].id
            const keyPosition = selectedKeyPosition
            const oldBinding = keymap.layers[layer].bindings[keyPosition]

            doIt?.(async () => {
                if (!connection) throw new Error('Not connected')

                const resp = await callRemoteProcedureControl(connection, {
                    keymap: {
                        setLayerBinding: { layerId, keyPosition, binding },
                    },
                })
                // console.log(resp)
                if (
                    resp.keymap?.setLayerBinding ===
                    SetLayerBindingResponse.SET_LAYER_BINDING_RESP_OK
                ) {
                    setKeymap(
                        produce((draft: any) => {
                            draft.layers[layer].bindings[keyPosition] = binding;
                        }),
                    );
                } else {
                    console.error(
                        'Failed to set binding',
                        resp.keymap?.setLayerBinding,
                    );
                }

                return async () => {
                    if (!connection) {
                        return;
                    }

                    const resp = await callRemoteProcedureControl(connection, {
                        keymap: {
                            setLayerBinding: {
                                layerId,
                                keyPosition,
                                binding: oldBinding,
                            },
                        },
                    });
                    if (
                        resp.keymap?.setLayerBinding ===
                        SetLayerBindingResponse.SET_LAYER_BINDING_RESP_OK
                    ) {
                        setKeymap(
                            produce((draft: any) => {
                                draft.layers[layer].bindings[keyPosition] =
                                    oldBinding;
                            }),
                        );
                    } else {
                        console.error(
                            'Failed to set binding',
                            resp.keymap?.setLayerBinding,
                        );
                    }
                };
            })
        },
        [connection, keymap, doIt, selectedLayerIndex, selectedKeyPosition],
    )

    const selectedBinding = useMemo(() => {
        if (
            keymap == null ||
            selectedKeyPosition == null ||
            !keymap.layers[selectedLayerIndex]
        ) {
            return null
        }
        setSelectedKey(true)
        return keymap.layers[selectedLayerIndex].bindings[selectedKeyPosition]
    }, [keymap, selectedLayerIndex, selectedKeyPosition])

    useEffect(() => {
        if (!keymap?.layers) return

        const layers = keymap.layers.length - 1

        if (selectedLayerIndex > layers) {
            setSelectedLayerIndex(layers)
        }

    }, [keymap, selectedLayerIndex, setSelectedKey])

    return (
        <div className="grid grid-cols-[auto_1fr] grid-rows-[1fr_minmax(10em,auto)] bg-base-300 max-w-full min-w-0 min-h-0 h-full">
            {/*<div className="p-2 flex flex-col gap-2 bg-base-200 row-span-2">*/}
            {/*    {layouts && (*/}
            {/*        <div className="col-start-3 row-start-1 row-end-2">*/}
            {/*            <PhysicalLayoutPicker*/}
            {/*                layouts={layouts}*/}
            {/*                selectedPhysicalLayoutIndex={*/}
            {/*                    selectedPhysicalLayoutIndex*/}
            {/*                }*/}
            {/*                onPhysicalLayoutClicked={doSelectPhysicalLayout}*/}
            {/*            />*/}
            {/*        </div>*/}
            {/*    )}*/}

            {/*    {keymap && (*/}
            {/*        <div className="col-start-1 row-start-1 row-end-2">*/}
            {/*            <LayerPicker*/}
            {/*                layers={keymap.layers}*/}
            {/*                selectedLayerIndex={selectedLayerIndex}*/}
            {/*                onLayerClicked={setSelectedLayerIndex}*/}
            {/*                setKeymap={setKeymap}*/}
            {/*                setSelectedLayerIndex={setSelectedLayerIndex}*/}
            {/*                canAdd={(keymap.availableLayers || 0) > 0}*/}
            {/*                canRemove={(keymap.layers?.length || 0) > 1}*/}
            {/*                setSelectedKey={setSelectedKey}*/}
            {/*                keymap={keymap}*/}
            {/*            />*/}
            {/*        </div>*/}
            {/*    )}*/}
            {/*</div>*/}
            {layouts && keymap && behaviors && (
                <div className="p-2 col-start-2 row-start-1 grid items-center justify-center relative min-w-0">
                    <KeymapComp
                        keymap={keymap}
                        layout={layouts[selectedPhysicalLayoutIndex]}
                        behaviors={behaviors}
                        scale={keymapScale}
                        selectedLayerIndex={selectedLayerIndex}
                        selectedKeyPosition={selectedKeyPosition}
                        onKeyPositionClicked={setSelectedKeyPosition}
                    />
                    <Zoom
                        value={keymapScale}
                        onChange={(e) => {
                            const value = deserializeLayoutZoom(e.target.value)
                            setKeymapScale(value)
                        }}
                    />
                </div>
            )}
            {keymap && selectedKey && (
                <div className="p-2 col-start-2 row-start-2">
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body p-4">
                            <div className="card-actions w-full justify-between">
                                <BehaviorBindingPicker
                                    binding={selectedBinding}
                                    behaviors={Object.values(behaviors)}
                                    layers={keymap.layers.map(
                                        ({ id, name }, li) => ({
                                            id,
                                            name: name || li.toLocaleString(),
                                        }),
                                    )}
                                    onBindingChanged={doUpdateBinding}
                                />
                                <button className="btn btn-square btn-sm" onClick={()=> {
                                    setSelectedKey(false)
                                    setSelectedKeyPosition(undefined)
                                }}>
                                    <X />
                                </button>
                            </div>
                            <KeysLayout></KeysLayout>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
