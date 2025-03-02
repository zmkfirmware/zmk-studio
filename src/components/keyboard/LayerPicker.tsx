import { Pencil, Minus, Plus } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from "react"
import {
    DropIndicator,
    Label,
    ListBox,
    ListBoxItem,
    Selection,
    useDragAndDrop,
} from 'react-aria-components'
import { useModalRef } from '../../misc/useModalRef.ts'
import { GenericModal } from '../GenericModal.tsx'
import { callRemoteProcedureControl } from "../../rpc/logging.ts"
import undoRedoStore from "../../stores/UndoRedoStore.ts"
import useConnectionStore from "../../stores/ConnectionStore.ts"
import { produce } from "immer"
import { SetLayerPropsResponse } from "@zmkfirmware/zmk-studio-ts-client/keymap"
// import EditLabelModal from '../EditLabelModal.tsx'

interface Layer {
    id: number
    name?: string
}

export type LayerClickCallback = (index: number) => void
export type LayerMovedCallback = (index: number, destination: number) => void

interface LayerPickerProps {
    layers: Array<Layer>
    selectedLayerIndex: number
    canAdd?: boolean
    canRemove?: boolean

    onLayerClicked?: LayerClickCallback
    setKeymap?: any
    setSelectedLayerIndex?: any
    keymap?: any
    setSelectedKey?: any
}

interface EditLabelData {
    id: number
    name: string
}

const EditLabelModal = ({
    open,
    onClose,
    editLabelData,
    handleSaveNewLabel,
}: {
    open: boolean
    onClose: () => void
    editLabelData: EditLabelData
    handleSaveNewLabel: (
        id: number,
        oldName: string,
        newName: string | null,
    ) => void
}) => {
    const ref = useModalRef(open)
    const [newLabelName, setNewLabelName] = useState(editLabelData.name)

    const handleSave = () => {
        handleSaveNewLabel(editLabelData.id, editLabelData.name, newLabelName)
        onClose()
    }

    return (
        <GenericModal
            ref={ref}
            onClose={onClose}
            className="min-w-min w-[30vw] flex flex-col"
        >
            <span className="mb-3 text-lg">New Layer Name</span>
            <input
                className="p-1 border rounded border-base-content border-solid"
                type="text"
                defaultValue={editLabelData.name}
                autoFocus
                onChange={(e) => setNewLabelName(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault()
                        handleSave()
                    }
                }}
            />
            <div className="mt-4 flex justify-end">
                <button className="py-1.5 px-2" type="button" onClick={onClose}>
                    Cancel
                </button>
                <button
                    className="py-1.5 px-2 ml-4 rounded-md bg-gray-100 text-black hover:bg-gray-300"
                    type="button"
                    onClick={() => {
                        handleSave()
                    }}
                >
                    Save
                </button>
            </div>
        </GenericModal>
    )
}

export const LayerPicker = ({
    layers,
    selectedLayerIndex,
    canAdd,
    canRemove,
    onLayerClicked,
    setSelectedKey,
    setKeymap,
    keymap,
    setSelectedLayerIndex,
    ...props
}: LayerPickerProps) => {
    const [editLabelData, setEditLabelData] = useState<EditLabelData | null>( null )
    const { doIt } = undoRedoStore()
    const { connection } = useConnectionStore()

    const layer_items = useMemo(() => {
        return layers.map((l, i) => ({
            name: l.name || i.toLocaleString(),
            id: l.id,
            index: i,
            selected: i === selectedLayerIndex,
        }))
    }, [layers, selectedLayerIndex])

    const selectionChanged = useCallback( (s: Selection) => {
            if (s === 'all') {
                return
            }
            onLayerClicked?.(layer_items.findIndex((l) => s.has(l.id)))
        },
        [onLayerClicked, layer_items],
    )

    const { dragAndDropHooks } = useDragAndDrop({ renderDropIndicator(target) {
            return (
                <DropIndicator
                    target={target}
                    className={
                        'data-[drop-target]:outline outline-1 outline-accent'
                    }
                />
            )
        },
        getItems: (keys) =>
            [...keys].map((key) => ({ 'text/plain': key.toLocaleString() })),
        onReorder(e) {
            const startIndex = layer_items.findIndex((l) => e.keys.has(l.id))
            const endIndex = layer_items.findIndex((l) => l.id === e.target.key)
            moveLayer?.(startIndex, endIndex)
        },
    })



    const moveLayer = useCallback( (start: number, end: number) => {
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
        }, [doIt],
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

    const handleSaveNewLabel = useCallback(
        (id: number, oldName: string, newName: string | null) => {
            if (newName !== null) {
                changeLayerName?.(id, oldName, newName)
            }
        },
        [changeLayerName],
    )
    useEffect(() => {
        if (!keymap?.layers) return

        const layers = keymap.layers.length - 1

        if (selectedLayerIndex > layers) {
            setSelectedLayerIndex(layers)
        }

    }, [keymap, selectedLayerIndex, setSelectedKey])

    return (
        <>
        <div className="flex flex-col min-w-40">
            <div className="grid grid-cols-[1fr_auto_auto] items-center">
                <Label className="after:content-[':'] text-sm">Layers</Label>
                            {removeLayer && (
                                <button
                                    type="button"
                                    className="hover:text-primary-content hover:bg-primary rounded-sm"
                                    disabled={!canRemove}
                                    onClick={removeLayer}
                                >
                                    <Minus className="size-4" />
                                </button>
                            )}
                            {addLayer && (
                                <button
                                    type="button"
                                    disabled={!canAdd}
                                    className="hover:text-primary-content ml-1 hover:bg-primary rounded-sm disabled:text-gray-500 disabled:hover:bg-base-300 disabled:cursor-not-allowed"
                                    onClick={addLayer}
                                >
                                    <Plus className="size-4" />
                                </button>
                            )}
                {/*<ul className="menu bg-base-200 rounded-box p-0">*/}
                {/*    <li>*/}
                {/*        <h2 className="menu-title text-gray-300">Layers*/}
                {/*            {removeLayer && (*/}
                {/*                <button*/}
                {/*                    type="button"*/}
                {/*                    className="hover:text-primary-content hover:bg-primary rounded-sm"*/}
                {/*                    disabled={!canRemove}*/}
                {/*                    onClick={removeLayer}*/}
                {/*                >*/}
                {/*                    <Minus className="size-4" />*/}
                {/*                </button>*/}
                {/*            )}*/}
                {/*            {addLayer && (*/}
                {/*                <button*/}
                {/*                    type="button"*/}
                {/*                    disabled={!canAdd}*/}
                {/*                    className="hover:text-primary-content ml-1 hover:bg-primary rounded-sm disabled:text-gray-500 disabled:hover:bg-base-300 disabled:cursor-not-allowed"*/}
                {/*                    onClick={addLayer}*/}
                {/*                >*/}
                {/*                    <Plus className="size-4" />*/}
                {/*                </button>*/}
                {/*            )}*/}
                {/*        </h2>*/}
                {/*        <ul>*/}
                {/*            <li><a>Item 1</a></li>*/}
                {/*            <li><a>Item 2</a></li>*/}
                {/*            <li><a>Item 3</a></li>*/}
                {/*        </ul>*/}
                {/*    </li>*/}
                {/*</ul>*/}

            </div>
            <ListBox
                aria-label="Keymap Layer"
                selectionMode="single"
                items={layer_items}
                disallowEmptySelection={true}
                selectedKeys={
                    layer_items[selectedLayerIndex]
                        ? [layer_items[selectedLayerIndex].id]
                        : []
                }
                className="ml-2 items-center justify-center cursor-pointer"
                onSelectionChange={selectionChanged}
                dragAndDropHooks={dragAndDropHooks}
                {...props}
            >
                {(layer_item) => (
                    <ListBoxItem
                        textValue={layer_item.name}
                        className="p-1 b-1 my-1 group grid grid-cols-[1fr_auto] items-center aria-selected:bg-primary aria-selected:text-primary-content border rounded border-transparent border-solid hover:bg-base-300"
                    >
                        <span>{layer_item.name}</span>
                        <Pencil
                            className="h-4 w-4 mx-1 invisible group-hover:visible"
                            onClick={() =>
                                setEditLabelData({
                                    id: layer_item.id,
                                    name: layer_item.name,
                                })
                            }
                        />
                    </ListBoxItem>
                )}
            </ListBox>
            {editLabelData !== null && (
                <>
                    {/*<EditLabelModal*/}
                    {/*    opened={!!editLabelData}*/}
                    {/*    onClose={() => setEditLabelData(null)}*/}
                    {/*    editLabelData={editLabelData}*/}
                    {/*/>*/}
                    <EditLabelModal
                        open={editLabelData !== null}
                        onClose={() => setEditLabelData(null)}
                        editLabelData={editLabelData}
                        handleSaveNewLabel={handleSaveNewLabel}
                    />
                </>
            )}
        </div>
        </>
    )
}
