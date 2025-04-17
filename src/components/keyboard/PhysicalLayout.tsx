import { PropsWithChildren, useLayoutEffect, useRef, useState } from 'react'
import { Key } from './Key.tsx'
import { scalePosition } from '../../helpers/scalePosition.ts'

export type KeyPosition = PropsWithChildren<{
    id?: string;
    header?: string
    width: number
    height: number
    x: number
    y: number
    r?: number
    rx?: number
    ry?: number
}>

export type LayoutZoom = number | 'auto'

interface PhysicalLayoutProps {
    positions: Array<KeyPosition>
    selectedPosition?: number
    oneU?: number
    hoverZoom?: boolean
    zoom?: LayoutZoom
    onPositionClicked?: (position: number) => void
}

export interface PhysicalLayoutPositionLocation {
    x: number
    y: number
    r?: number
    rx?: number
    ry?: number
}

export const PhysicalLayout = ({
    positions,
    selectedPosition,
    oneU = 48,
    hoverZoom = true,
    onPositionClicked,
    ...props
}: PhysicalLayoutProps) => {
    const ref = useRef<HTMLDivElement>(null)
    const [scale, setScale] = useState(1)

    useLayoutEffect(() => {
        const { zoom } = props;
        const element = ref.current;
        if (!element) return;

        const parent = element.parentElement;
        if (!parent) return;

        const calculateScale = () => {
            if (zoom === 'auto') {
                const padding = Math.min(window.innerWidth, window.innerHeight) * 0.05;
                const newScale = Math.min(
                    parent.clientWidth / (element.clientWidth + padding * 2),
                    parent.clientHeight / (element.clientHeight + padding * 2)
                );
                setScale(newScale);
            } else {
                setScale(zoom || 1);
            }
        };

        // Perform initial scale calculation
        calculateScale();

        // Create a ResizeObserver that recalculates the scale when dimensions change
        const resizeObserver = new ResizeObserver(calculateScale);
        resizeObserver.observe(element);
        resizeObserver.observe(parent);

        return () => resizeObserver.disconnect();
    }, [props.zoom, ref, setScale]);

    // TODO: Add a bit of padding for rotation when supported
    const { rightMost, bottomMost } = positions.reduce(
        (acc, { x, y, width, height }) => ({
            rightMost: Math.max(acc.rightMost, x + width),
            bottomMost: Math.max(acc.bottomMost, y + height),
        }),
        { rightMost: 0, bottomMost: 0 }
    );
    console.log(positions)
    const positionItems = positions.map((p, idx) => (

        <div
            key={p.id}
            onClick={() => onPositionClicked?.(idx)}
            className="absolute data-[zoomer=true]:hover:z-[1000] leading-[0]"
            data-zoomer={hoverZoom}
            style={scalePosition(p, oneU)}>
            <Key hoverZoom={hoverZoom} oneU={oneU} selected={idx === selectedPosition}{...p} />
        </div>
    ))
    // console.log( positions, oneU);
    return (
        <div
            className="relative"
            style={{
                height: bottomMost * oneU + 'px',
                width: rightMost * oneU + 'px',
                transform: `scale(${scale})`,
            }}
            ref={ref}
            {...props}>
            {positionItems}
        </div>
    )
}
