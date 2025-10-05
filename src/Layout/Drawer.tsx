import React, { useCallback, useEffect, useState } from 'react'
import { useLayout } from '../helpers/useLayouts.ts'
import { PhysicalLayoutPicker } from '../components/keyboard/PhysicalLayoutPicker.tsx'
import { LayerPicker } from '../components/keyboard/LayerPicker.tsx'
import undoRedoStore from '../stores/UndoRedoStore.ts'
import {
    Keymap,
    // , Layer, SetLayerPropsResponse
} from '@zmkfirmware/zmk-studio-ts-client/keymap'
import useConnectionStore from '../stores/ConnectionStore.ts'
import useLayerSelectionStore from '../stores/LayerSelectionStore.ts'
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarFooter,
} from "@/components/ui/sidebar.tsx"
import { DeviceMenu } from '../components/DeviceMenu.tsx'
import {  useConnectedDeviceData } from "@/services/RpcConnectionService.ts"
import { setKeymapRequest } from "@/services/RpcEventsService.ts"

interface DrawerProps {
    children?: React.ReactNode
}

export function Drawer({}: DrawerProps) {
    const { connection } = useConnectionStore()
    const { selectedLayerIndex, setSelectedLayerIndex } = useLayerSelectionStore()
    const {
        layouts,
        selectedPhysicalLayoutIndex,
        setSelectedPhysicalLayoutIndex,
    } = useLayout()
    const { doIt } = undoRedoStore()

    const [keymap, setKeymap] = useConnectedDeviceData<Keymap>(
        { keymap: { getKeymap: true } },
        (keymap) => {
            console.log('Got the keymap!')
            return keymap?.keymap?.getKeymap
        },
        true,
    )

	useEffect(() => {
		setSelectedLayerIndex(0)
	}, [connection])

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
	    (async ()=> {
		    console.log(123123)
		    setKeymap(await setKeymapRequest(layouts,selectedPhysicalLayoutIndex))
	    })()

    }, [connection, layouts, selectedPhysicalLayoutIndex, setKeymap])

    useEffect(() => {
        if (!keymap?.layers) return

        const layer = keymap.layers.find(layer => layer.id === selectedLayerIndex)

        if (!layer) setSelectedLayerIndex(keymap.layers[0].id)

        console.log(selectedLayerIndex, layer, keymap.layers.length, keymap.layers)

    }, [keymap, selectedLayerIndex])

    return (
            <Sidebar collapsible="icon" variant='inset'>
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
                        {keymap && (
                            <LayerPicker
                                layers={keymap.layers}
                                keymap={keymap}
                                setKeymap={setKeymap}
                                canAdd={(keymap.availableLayers || 0) > 0}
                                canRemove={(keymap.layers?.length || 0) > 1}
                            />
                        )}
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter>
                    <DeviceMenu />
                </SidebarFooter>
            </Sidebar>
    )
}
