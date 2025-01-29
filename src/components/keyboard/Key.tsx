// import './key.css';

import { PropsWithChildren, Children, CSSProperties } from 'react'

interface KeyProps {

    selected?: boolean
    width: number
    height: number
    oneU: number // Button size
    hoverZoom?: boolean
    /**
     * Button contents
     */
    header?: string
    /**
     * Optional click handler
     */
    onClick?: () => void
}

interface KeyDimension {
    width: number
    height: number
}

function makeSize(
    { width, height }: KeyDimension,
    oneU: number,
): CSSProperties {
    width *= oneU
    height *= oneU

    return {
        '--zmk-key-center-width': 'calc(' + width + 'px - 2px)',
        'width': 'calc(' + width + 'px - 2px)',
        '--zmk-key-center-height': 'calc(' + height + 'px - 2px)',
        'height': 'calc(' + height + 'px - 2px)',
    }
}

export const Key = ({
    selected = false,
    header,
    oneU,
    hoverZoom = true,
    ...props
}: PropsWithChildren<KeyProps>) => {
    const size = makeSize(props, oneU)

    const children = Children.map(props.children, (c) => (
        <div
            data-zoomer={hoverZoom}
            className="justify-self-center self-center row-start-2 row-end-3 col-start-2 col-end-3 font-keycap text-lg"
        >
            {c}
        </div>
    ))
    return (
        <div
            className="group inline-flex b-0 flex-col justify-items-center justify-content-center items-center transition-all duration-0 hover:scale-150 hover:border rounded-md"
            data-zoomer={hoverZoom}
            style={size}
            {...props}
        >
            <button
                aria-selected={selected}
                data-zoomer={hoverZoom}
                className={`rounded${
                    oneU > 20 ? '-md' : ''
                } transition-all duration-100 box-border text-base-content bg-base-100 aria-selected:bg-primary aria-selected:text-primary-content grow
                 flex-col flex items-center justify-evenly w-full h-full `}
            >
                {header && (
                    <span className="text-[0.35rem]">
                        {header}
                    </span>
                )}
                {children}
            </button>
        </div>
    )
}
