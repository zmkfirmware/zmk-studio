import {
    PhysicalLayout,
    Keymap as KeymapMsg,
} from '@zmkfirmware/zmk-studio-ts-client/keymap'
import type { GetBehaviorDetailsResponse } from '@zmkfirmware/zmk-studio-ts-client/behaviors'

import {
    LayoutZoom,
    PhysicalLayout as PhysicalLayoutComp,
} from './PhysicalLayout.tsx'
import { HidUsageLabel } from './HidUsageLabel.tsx'

type BehaviorMap = Record<number, GetBehaviorDetailsResponse>

export interface KeymapProps {
    layout: PhysicalLayout
    keymap: KeymapMsg
    behaviors: BehaviorMap
    scale: LayoutZoom
    selectedLayerIndex: number
    selectedKeyPosition: number | undefined
    onKeyPositionClicked: (keyPosition: number) => void
}

export const KeyboardLayout = ({
    layout,
    keymap,
    behaviors,
    scale,
    selectedLayerIndex,
    selectedKeyPosition,
    onKeyPositionClicked,
}: KeymapProps) => {
    if (!keymap.layers[selectedLayerIndex]) {
        return <></>
    }

    const positions = layout.keys.map((k, i) => {
        if (i >= keymap.layers[selectedLayerIndex].bindings.length) {
            return {
                header: 'Unknown',
                x: k.x / 100.0,
                y: k.y / 100.0,
                width: k.width / 100,
                height: k.height / 100.0,
                children: <span></span>,
            }
        }

        return {
            header:
                behaviors[keymap.layers[selectedLayerIndex].bindings[i].behaviorId]?.displayName || 'Unknown',
            x: k.x / 100.0,
            y: k.y / 100.0,
            width: k.width / 100,
            height: k.height / 100.0,
            r: (k.r || 0) / 100.0,
            rx: (k.rx || 0) / 100.0,
            ry: (k.ry || 0) / 100.0,
            children: (
                <>
                    <HidUsageLabel
                        hid_usage={ keymap.layers[selectedLayerIndex].bindings[i].param1 }
                        header={behaviors[keymap.layers[selectedLayerIndex].bindings[i].behaviorId]?.displayName || 'Unknown'}
                    />
                </>
            ),
        }
    })
    console.log(positions,behaviors)

    return (
        <PhysicalLayoutComp
            positions={positions}
            oneU={48}
            hoverZoom={true}
            zoom={scale}
            selectedPosition={selectedKeyPosition}
            onPositionClicked={onKeyPositionClicked}
        />
    )
}
