// import './key.css';

import { PropsWithChildren, Children, CSSProperties, useRef, useState, useLayoutEffect } from 'react'

interface KeyProps {

    selected?: boolean
    pressed?: boolean
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

const FitText = ({ 
    children, 
    maxFontSize, 
    minFontSize = 4,
    className = '',
    hoverZoom
}: { 
    children: React.ReactNode; 
    maxFontSize: number; 
    minFontSize?: number;
    className?: string;
    hoverZoom?: boolean;
}) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const textRef = useRef<HTMLDivElement>(null)
    const [fontSize, setFontSize] = useState(minFontSize)
    const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    useLayoutEffect(() => {
        let isSubscribed = true
        
        const resizeText = () => {
            if (!isSubscribed) return
            
            const container = containerRef.current
            const text = textRef.current
            
            if (!container || !text) {
                // Retry if refs aren't ready yet
                if (isSubscribed) {
                    resizeTimeoutRef.current = setTimeout(resizeText, 20)
                }
                return
            }

            const containerWidth = container.clientWidth
            const containerHeight = container.clientHeight
            
            // If container has no size yet, keep retrying
            if (containerWidth === 0 || containerHeight === 0) {
                if (isSubscribed) {
                    resizeTimeoutRef.current = setTimeout(resizeText, 50)
                }
                return
            }

            let low = minFontSize
            let high = maxFontSize
            let bestSize = minFontSize

            // Binary search for optimal font size
            while (low <= high) {
                const mid = Math.floor((low + high) / 2)
                text.style.fontSize = `${mid}px`
                
                // Force reflow to get accurate measurements
                void text.offsetHeight
                
                const fitsWidth = text.scrollWidth <= containerWidth
                const fitsHeight = text.scrollHeight <= containerHeight
                
                if (fitsWidth && fitsHeight) {
                    bestSize = mid
                    low = mid + 1
                } else {
                    high = mid - 1
                }
            }

            if (isSubscribed) {
                setFontSize(bestSize)
            }
        }

        // Initial resize with multiple attempts for reliability
        const initialTimeouts: NodeJS.Timeout[] = []
        initialTimeouts.push(setTimeout(resizeText, 0))
        initialTimeouts.push(setTimeout(resizeText, 50))
        initialTimeouts.push(setTimeout(resizeText, 100))
        initialTimeouts.push(setTimeout(resizeText, 200))
        
        // Set up ResizeObserver
        let resizeObserver: ResizeObserver | null = null
        
        const setupObserver = () => {
            if (containerRef.current && isSubscribed) {
                resizeObserver = new ResizeObserver(() => {
                    if (resizeTimeoutRef.current) {
                        clearTimeout(resizeTimeoutRef.current)
                    }
                    resizeTimeoutRef.current = setTimeout(resizeText, 10)
                })
                resizeObserver.observe(containerRef.current)
            }
        }
        
        // Try to set up observer immediately and with delays
        setupObserver()
        const observerTimeout = setTimeout(setupObserver, 50)
        
        return () => {
            isSubscribed = false
            initialTimeouts.forEach(clearTimeout)
            clearTimeout(observerTimeout)
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current)
            }
            resizeObserver?.disconnect()
        }
    }, [children, maxFontSize, minFontSize])

    return (
        <div
            ref={containerRef}
            data-zoomer={hoverZoom}
            className={`flex items-center justify-center w-full overflow-hidden p-[2px] ${className}`}
        >
            <div
                ref={textRef}
                className="text-center"
                style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: '1.15',
                    whiteSpace: 'normal',
                    wordBreak: 'keep-all',
                    overflowWrap: 'normal',
                    hyphens: 'none',
                    width: '100%',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    textRendering: 'optimizeLegibility',
                } as React.CSSProperties}
            >
                {children}
            </div>
        </div>
    )
}

export const Key = ({
    selected = false,
    pressed = false,
    header,
    oneU,
    hoverZoom = true,
    ...props
}: PropsWithChildren<KeyProps>) => {
    const size = makeSize(props, oneU)
    const maxChildFontSize = Math.max(10, oneU / 2.5)
    const maxHeaderFontSize = Math.max(6, oneU / 6)

    const children = Children.map(props.children, (c) => (
        <FitText
            maxFontSize={maxChildFontSize}
            minFontSize={4}
            className="font-keycap flex-1"
            hoverZoom={hoverZoom}
        >
            {c}
        </FitText>
    ))

    return (
        <div
            className="group inline-flex b-0 flex-col justify-items-center justify-content-center items-center transition-all duration-0 hover:scale-150 hover:border rounded-md"
            data-zoomer={hoverZoom}
            style={{
                ...size,
                backfaceVisibility: 'hidden',
                transform: 'translateZ(0)',
            } as React.CSSProperties}
            {...props}
        >
            <button
                aria-selected={selected}
                data-zoomer={hoverZoom}
                className={`rounded${
                    oneU > 20 ? '-md' : ''
                } transition-all duration-100 box-border text-base-content bg-cyan-950  aria-selected:bg-primary aria-selected:text-primary-content grow
                 flex-col flex items-center justify-evenly w-full h-full overflow-hidden ${
                    pressed ? 'bg-green-600 text-white shadow-lg scale-95' : ''
                }`}
                style={{
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                } as React.CSSProperties}
            >
                {header && (
                    <FitText
                        maxFontSize={maxHeaderFontSize}
                        minFontSize={4}
                        hoverZoom={hoverZoom}
                        className={'flex-none'}
                    >
                        {header}
                    </FitText>
                )}
                {children}
            </button>
        </div>
    )
}
