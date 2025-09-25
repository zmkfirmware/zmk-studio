import {
    PhysicalLayout,
    Keymap as KeymapMsg,
} from '@zmkfirmware/zmk-studio-ts-client/keymap'
import type { GetBehaviorDetailsResponse } from '@zmkfirmware/zmk-studio-ts-client/behaviors'

import { PhysicalLayout as PhysicalLayoutComp, } from './PhysicalLayout.tsx'
import { HidUsageLabel } from './HidUsageLabel.tsx'
import { LayoutZoom } from "@/helpers/helpers.ts"

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
        const children = i >= keymap.layers[selectedLayerIndex].bindings.length
            ? (<span></span>)
            : (<HidUsageLabel
                    hid_usage={ keymap.layers[selectedLayerIndex].bindings[i].param1 }
                    header={behaviors[keymap.layers[selectedLayerIndex].bindings[i].behaviorId]?.displayName || 'Unknown'}
                />)
            const header = i >= keymap.layers[selectedLayerIndex].bindings.length
                ? 'Unknown'
                : (behaviors[keymap.layers[selectedLayerIndex].bindings[i].behaviorId]?.displayName || 'Unknown')

        return {
            id: `${keymap.layers[selectedLayerIndex].id}-${i}`,
            header: header,
            x: k.x / 100.0,
            y: k.y / 100.0,
            width: k.width / 100,
            height: k.height / 100.0,
            r: (k.r || 0) / 100.0,
            rx: (k.rx || 0) / 100.0,
            ry: (k.ry || 0) / 100.0,
            children: children,
        }
    })
    // console.log(positions,behaviors)

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
