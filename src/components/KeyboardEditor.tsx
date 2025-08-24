import { useState } from 'react'
import Keyboard from './keyboard/Keyboard.tsx'
import { KeyEditor } from './KeyEditor.tsx'
import { Keymap } from '@zmkfirmware/zmk-studio-ts-client/keymap'

/**
 * KeyboardEditor Component
 * 
 * A parent component that manages the shared state between Keyboard and KeyEditor components.
 * Handles the selection state and coordinates between the keyboard display and key editing interface.
 */
interface KeyboardEditorProps {
    keymap: Keymap | undefined
    setKeymap: (keymap: Keymap | ((prev: Keymap) => Keymap)) => void
}

export function KeyboardEditor({ 
    keymap, 
    setKeymap 
}: KeyboardEditorProps) {
    // Shared state between Keyboard and KeyEditor
    const [selectedKey, setSelectedKey] = useState<boolean>(false)
    const [selectedKeyPosition, setSelectedKeyPosition] = useState<number | undefined>(undefined)
    const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(0)

    return (
        <div className="flex flex-col h-full">
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