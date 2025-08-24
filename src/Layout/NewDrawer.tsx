import React, { useCallback, useEffect, useState } from 'react'
import { useLayout } from '../helpers/useLayouts.ts'
import { PhysicalLayoutPicker } from '../components/keyboard/PhysicalLayoutPicker.tsx'
import { LayerPicker } from '../components/keyboard/LayerPicker.tsx'
import undoRedoStore from '../stores/UndoRedoStore.ts'
import { useConnectedDeviceData } from '../rpc/useConnectedDeviceData.ts'
import {
    Keymap,
    // , Layer, SetLayerPropsResponse
} from '@zmkfirmware/zmk-studio-ts-client/keymap'
import { callRemoteProcedureControl } from '../rpc/logging.ts'
import useConnectionStore from '../stores/ConnectionStore.ts'
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarFooter,
} from "@/components/ui/sidebar.tsx"
import { DeviceMenu } from '../components/DeviceMenu.tsx'

interface DrawerProps {
    children?: React.ReactNode
    connectedDeviceLabel?: string
}

export function NewDrawer({ children, connectedDeviceLabel }: DrawerProps) {
    const { connection } = useConnectionStore()
    const {
        layouts,
        selectedPhysicalLayoutIndex,
        setSelectedPhysicalLayoutIndex,
    } = useLayout()
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
        [doIt, selectedPhysicalLayoutIndex, setSelectedPhysicalLayoutIndex],
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
    }, [connection, layouts, selectedPhysicalLayoutIndex, setKeymap])

    useEffect(() => {
        if (!keymap?.layers) return

        const layers = keymap.layers.length - 1
        console.log(selectedLayerIndex, layers, selectedLayerIndex > layers, keymap.layers.length)

        if (selectedLayerIndex > layers) {
            setSelectedLayerIndex(layers)
        }
    }, [keymap, selectedLayerIndex])

    return (
        <>
            <Sidebar collapsible="icon">
                <SidebarHeader><img src="/zmk.svg" alt="ZMK Logo" className="h-8 rounded" />
                    {/*<span className="px-3">Studio</span>*/}
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <PhysicalLayoutPicker
                            layouts={layouts}
                            selectedPhysicalLayoutIndex={selectedPhysicalLayoutIndex}
                            onPhysicalLayoutClicked={doSelectPhysicalLayout}
                        />
                    </SidebarGroup>
                    <SidebarGroup>
                        <SidebarMenu>
                            {keymap && (
                                <div className="col-start-1 row-start-1 row-end-2">
                                    <LayerPicker
                                        layers={keymap.layers}
                                        keymap={keymap}
                                        setKeymap={setKeymap}
                                        selectedLayerIndex={selectedLayerIndex}
                                        onLayerClicked={setSelectedLayerIndex}
                                        canAdd={(keymap.availableLayers || 0) > 0}
                                        canRemove={(keymap.layers?.length || 0) > 1}
                                        setSelectedLayerIndex={setSelectedLayerIndex}
                                    />
                                </div>
                            )}
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter>
                    <DeviceMenu connectedDeviceLabel={connectedDeviceLabel} />
                </SidebarFooter>
            </Sidebar>
            <main>
                {children}
            </main>
        </>
    )
}
