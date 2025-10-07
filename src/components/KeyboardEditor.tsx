import { useState } from "react"
import Keyboard from './keyboard/Keyboard.tsx'
import { KeyEditor } from './KeyEditor.tsx'
import { Keymap } from '@zmkfirmware/zmk-studio-ts-client/keymap'

import { useConnectedDeviceData } from "@/services/RpcConnectionService.ts"

/**
 * KeyboardEditor Component
 * 
 * A parent component that manages the shared state between Keyboard and KeyEditor components.
 * Handles the selection state and coordinates between the keyboard display and key editing interface.
 */
interface KeyboardEditorProps {
    // No props needed - using store directly
}

export function KeyboardEditor({}: KeyboardEditorProps) {
    // Shared state between Keyboard and KeyEditor
    const [selectedKey, setSelectedKey] = useState<boolean>(false)
    const [selectedKeyPosition, setSelectedKeyPosition] = useState<number | undefined>(undefined)

    const [ keymap, setKeymap ] = useConnectedDeviceData<Keymap>(
        { keymap: { getKeymap: true } },
        ( keymap ) => {
            console.log( "Got the keymap!" )
            return keymap?.keymap?.getKeymap
        },
        true
    )


    return (
        <div className="flex flex-col flex-1">
            <Keyboard 
                keymap={keymap}
                selectedKeyPosition={selectedKeyPosition}
                setSelectedKeyPosition={setSelectedKeyPosition}
            />
            <KeyEditor
                selectedKey={selectedKey}
                keymap={keymap}
                setKeymap={setKeymap}
                selectedKeyPosition={selectedKeyPosition}
                setSelectedKeyPosition={setSelectedKeyPosition}
                setSelectedKey={setSelectedKey}
            />
        </div>
    )
} 