import { CSSProperties } from 'react'
import { PhysicalLayoutPositionLocation } from '../components/keyboard/PhysicalLayout.tsx'

export function scalePosition(
    { x, y, r, rx, ry }: PhysicalLayoutPositionLocation,
    oneU: number,
): CSSProperties {
    const left = x * oneU
    const top = y * oneU
    let transformOrigin = undefined
    let transform = undefined

    if (r) {
        const transformX = ((rx || x) - x) * oneU
        const transformY = ((ry || y) - y) * oneU
        transformOrigin = `${transformX}px ${transformY}px`
        transform = `rotate(${r}deg)`
    }

    return {
        top,
        left,
        transformOrigin,
        transform,
        willChange: 'transform',
    }
}
