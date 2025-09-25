import { useEffect, useState } from "react"
import Keyboard from './keyboard/Keyboard.tsx'
import { KeyEditor } from './KeyEditor.tsx'
import { Keymap } from '@zmkfirmware/zmk-studio-ts-client/keymap'
import useConnectionStore from "../stores/ConnectionStore.ts"

import { useConnectedDeviceData } from "@/services/RpcConnectionService.ts"

/**
 * KeyboardEditor Component
 * 
 * A parent component that manages the shared state between Keyboard and KeyEditor components.
 * Handles the selection state and coordinates between the keyboard display and key editing interface.
 */
interface KeyboardEditorProps {
    selectedLayerIndex: number
    setSelectedLayerIndex: (index: number) => void
}

export function KeyboardEditor({ 
    selectedLayerIndex,
    setSelectedLayerIndex
}: KeyboardEditorProps) {
    // Shared state between Keyboard and KeyEditor
    const [selectedKey, setSelectedKey] = useState<boolean>(false)
    const [selectedKeyPosition, setSelectedKeyPosition] = useState<number | undefined>(undefined)
    const { connection } = useConnectionStore()

    const [ keymap, setKeymap ] = useConnectedDeviceData<Keymap>(
        { keymap: { getKeymap: true } },
        ( keymap ) => {
            console.log( "Got the keymap!" )
            return keymap?.keymap?.getKeymap
        },
        true
    )

    // Reset layer selection when connection changes
    useEffect(() => {
        console.log('Connection changed, resetting layer selection to 0')
        setSelectedLayerIndex(0)
        setSelectedKeyPosition(undefined)
    }, [connection])

    // Ensure selectedLayerIndex is valid when keymap changes
    useEffect(() => {
        if (!keymap?.layers) return

        const maxLayerIndex = keymap.layers.length - 1
        console.log('Keymap changed, current selectedLayerIndex:', selectedLayerIndex, 'maxLayerIndex:', maxLayerIndex)
        if (selectedLayerIndex > maxLayerIndex) {
            console.log('Adjusting selectedLayerIndex from', selectedLayerIndex, 'to', maxLayerIndex)
            setSelectedLayerIndex(maxLayerIndex)
        }
    }, [keymap, selectedLayerIndex, setSelectedLayerIndex])

    return (
        <div className="flex flex-col flex-1">
            <Keyboard 
                keymap={keymap}
                selectedLayerIndex={selectedLayerIndex}
                setSelectedLayerIndex={setSelectedLayerIndex}
                selectedKeyPosition={selectedKeyPosition}
                setSelectedKeyPosition={setSelectedKeyPosition}
                selectedKey={selectedKey}
                setSelectedKey={setSelectedKey}
            />
            <KeyEditor
                selectedKey={selectedKey}
                keymap={keymap}
                setKeymap={setKeymap}
                selectedLayerIndex={selectedLayerIndex}
                selectedKeyPosition={selectedKeyPosition}
                setSelectedKeyPosition={setSelectedKeyPosition}
                setSelectedKey={setSelectedKey}
            />
        </div>
    )
} 