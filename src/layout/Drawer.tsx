import React, { Children, useCallback, useEffect, useState } from "react"
import { useLayouts } from "../helpers/useLayouts.ts"
import { PhysicalLayoutPicker } from "../components/keyboard/PhysicalLayoutPicker.tsx"
import { LayerPicker } from "../components/keyboard/LayerPicker.tsx"
import undoRedoStore from "../stores/UndoRedoStore.ts"
import { useConnectedDeviceData } from "../rpc/useConnectedDeviceData.ts"
import { Keymap, Layer, SetLayerPropsResponse } from "@zmkfirmware/zmk-studio-ts-client/keymap"
import { callRemoteProcedureControl } from "../rpc/logging.ts"
import { produce } from "immer"
import useConnectionStore from "../stores/ConnectionStore.ts"

export function Drawer({ children }: { children: React.ReactNode }) {
    const { connection } = useConnectionStore()
    const [ layouts, _setLayouts, selectedPhysicalLayoutIndex, setSelectedPhysicalLayoutIndex, ] = useLayouts()
    const { doIt } = undoRedoStore()
    const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(0)


    const [keymap, setKeymap] = useConnectedDeviceData<Keymap>(
        { keymap: { getKeymap: true } },
        (keymap) => {
            console.log('Got the keymap!')
            return keymap?.keymap?.getKeymap
        },
        true,
    )


    const doSelectPhysicalLayout = useCallback(
        (i: number) => {
            const oldLayout = selectedPhysicalLayoutIndex
            doIt?.(async () => {
                setSelectedPhysicalLayoutIndex(i)

                return async () => {
                    setSelectedPhysicalLayoutIndex(oldLayout)
                }
            })
        },
        [doIt, selectedPhysicalLayoutIndex],
    )

    const moveLayer = useCallback(
        (start: number, end: number) => {
            const doMove = async (startIndex: number, destIndex: number) => {
                if (!connection) {
                    return
                }

                const resp = await callRemoteProcedureControl(connection, {
                    keymap: { moveLayer: { startIndex, destIndex } },
                })

                if (resp.keymap?.moveLayer?.ok) {
                    setKeymap(resp.keymap?.moveLayer?.ok)
                    setSelectedLayerIndex(destIndex)
                } else {
                    console.error('Error moving', resp)
                }
            }

            doIt?.(async () => {
                await doMove(start, end)
                return () => doMove(end, start)
            })
        },
        [doIt],
    )


    const addLayer = useCallback(() => {
        async function doAdd(): Promise<number> {
            if (!connection || !keymap) {
                throw new Error('Not connected')
            }

            const resp = await callRemoteProcedureControl(connection, {
                keymap: { addLayer: {} },
            })
            console.log(resp)
            if (resp.keymap?.addLayer?.ok) {
                const newSelection = keymap.layers.length
                setKeymap(
                    produce((draft: any) => {
                        draft.layers.push(resp.keymap!.addLayer!.ok!.layer)
                        draft.availableLayers--
                    }),
                )

                setSelectedLayerIndex(newSelection)

                return resp.keymap.addLayer.ok.index
            } else {
                console.error('Add error', resp.keymap?.addLayer?.err)
                throw new Error(
                    'Failed to add layer:' + resp.keymap?.addLayer?.err,
                )
            }
        }

        async function doRemove(layerIndex: number) {
            if (!connection) throw new Error('Not connected')

            const resp = await callRemoteProcedureControl(connection, {
                keymap: { removeLayer: { layerIndex } },
            })

            console.log(resp)
            if (resp.keymap?.removeLayer?.ok) {
                setKeymap(
                    produce((draft: any) => {
                        draft.layers.splice(layerIndex, 1)
                        draft.availableLayers++
                    }),
                )
            } else {
                console.error('Remove error', resp.keymap?.removeLayer?.err)
                throw new Error(
                    'Failed to remove layer:' + resp.keymap?.removeLayer?.err,
                )
            }
        }

        doIt?.(async () => {
            const index = await doAdd()
            return () => doRemove(index)
        })
    }, [connection, doIt, keymap])

    const removeLayer = useCallback(() => {
        async function doRemove(layerIndex: number): Promise<void> {
            if (!connection || !keymap) {
                throw new Error('Not connected')
            }

            const resp = await callRemoteProcedureControl(connection, {
                keymap: { removeLayer: { layerIndex } },
            })

            if (resp.keymap?.removeLayer?.ok) {
                if (layerIndex == keymap.layers.length - 1) {
                    setSelectedLayerIndex(layerIndex - 1)
                }
                setKeymap(
                    produce((draft: any) => {
                        draft.layers.splice(layerIndex, 1)
                        draft.availableLayers++
                    }),
                )
            } else {
                console.error('Remove error', resp.keymap?.removeLayer?.err)
                throw new Error(
                    'Failed to remove layer:' + resp.keymap?.removeLayer?.err,
                )
            }
        }

        async function doRestore(layerId: number, atIndex: number) {
            if (!connection) throw new Error('Not connected')

            const resp = await callRemoteProcedureControl(connection, {
                keymap: { restoreLayer: { layerId, atIndex } },
            })

            console.log(resp)
            if (resp.keymap?.restoreLayer?.ok) {
                setKeymap(
                    produce((draft: any) => {
                        draft.layers.splice(
                            atIndex,
                            0,
                            resp!.keymap!.restoreLayer!.ok,
                        )
                        draft.availableLayers--
                    }),
                )
                setSelectedLayerIndex(atIndex)
            } else {
                console.error('Remove error', resp.keymap?.restoreLayer?.err)
                throw new Error(
                    'Failed to restore layer:' + resp.keymap?.restoreLayer?.err,
                )
            }
        }

        if (!keymap) {
            throw new Error('No keymap loaded')
        }

        const index = selectedLayerIndex
        const layerId = keymap.layers[index].id
        doIt?.(async () => {
            await doRemove(index)
            return () => doRestore(layerId, index)
        })
    }, [connection, doIt, selectedLayerIndex])

    const changeLayerName = useCallback(
        (id: number, oldName: string, newName: string) => {
            async function changeName(layerId: number, name: string) {
                if (!connection) {
                    throw new Error('Not connected')
                }

                const resp = await callRemoteProcedureControl(connection, {
                    keymap: { setLayerProps: { layerId, name } },
                })

                if (
                    resp.keymap?.setLayerProps ==
                    SetLayerPropsResponse.SET_LAYER_PROPS_RESP_OK
                ) {
                    setKeymap(
                        produce((draft: any) => {
                            const layer_index = draft.layers.findIndex(
                                (l: Layer) => l.id == layerId,
                            )
                            draft.layers[layer_index].name = name
                        }),
                    )
                } else {
                    throw new Error(
                        'Failed to change layer name:' +
                        resp.keymap?.setLayerProps,
                    )
                }
            }

            doIt?.(async () => {
                await changeName(id, newName)
                return async () => {
                    await changeName(id, oldName)
                }
            })
        },
        [connection, doIt, keymap],
    )


    useEffect(() => {
        setSelectedLayerIndex(0)
    }, [connection])

    useEffect(() => {
        async function performSetRequest() {
            if (!connection || !layouts) {
                return
            }
            console.log(connection, selectedPhysicalLayoutIndex)
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

    useEffect(() => {
        if (!keymap?.layers) return

        const layers = keymap.layers.length - 1

        if (selectedLayerIndex > layers) {
            setSelectedLayerIndex(layers)
        }
    }, [keymap, selectedLayerIndex])

    return (
        <>
            <div className="drawer drawer-open">
                <input
                    id="my-drawer-2"
                    type="checkbox"
                    className="drawer-toggle"
                />
                <div className="drawer-content flex flex-col items-center justify-center">
                    {/* Page content here */}
                    <label
                        htmlFor="my-drawer-2"
                        className="btn btn-primary drawer-button lg:hidden"
                    >
                        Open drawer
                    </label>
                </div>
                <div className="drawer-side">
                    {layouts && (
                        <div className="col-start-3 row-start-1 row-end-2">
                            <PhysicalLayoutPicker
                                layouts={layouts}
                                selectedPhysicalLayoutIndex={
                                    selectedPhysicalLayoutIndex
                                }
                                onPhysicalLayoutClicked={doSelectPhysicalLayout}
                            />
                        </div>
                    )}

                    {keymap && (
                        <div className="col-start-1 row-start-1 row-end-2">
                            <LayerPicker
                                layers={keymap.layers}
                                selectedLayerIndex={selectedLayerIndex}
                                onLayerClicked={setSelectedLayerIndex}
                                onLayerMoved={moveLayer}
                                canAdd={(keymap.availableLayers || 0) > 0}
                                canRemove={(keymap.layers?.length || 0) > 1}
                                onAddClicked={addLayer}
                                onRemoveClicked={removeLayer}
                                onLayerNameChanged={changeLayerName}
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
