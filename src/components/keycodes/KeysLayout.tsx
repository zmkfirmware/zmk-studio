import { useState, useEffect, useRef } from "react";
import { keyboards } from "../../data/keys";
import Keycode from "./Keycode.tsx";

export function KeysLayout() {
    const [activeTab, setActiveTab] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (containerRef.current) {
            const maxX = Math.max(...keyboards[activeTab].UsageIds.map(key => key.x + (key.w || 50)));
            const maxY = Math.max(...keyboards[activeTab].UsageIds.map(key => key.y + (key.h || 50)));
            setDimensions({ width: maxX + 50, height: maxY + 50 });
        }
    }, [activeTab]);

    function handleTabClick(index: number) {
        setActiveTab(index);
    }

    return (
        <div className="p-2 col-start-2 row-start-2 bg-base-200">
            {/* Tab Navigation */}
            <div className="">
                <nav className="-mb-px flex gap-6">
                    {keyboards.map((tab, index) => (
                        <button
                            key={index}
                            onClick={() => handleTabClick(index)}
                            className={`shrink-0 border-b-2 p-3 text-sm font-medium ${
                                activeTab === index ? "border-sky-600 text-sky-600" : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            {tab.Name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div
                ref={containerRef}
                className="p-4 relative overflow-hidden"
                // style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px`, position: 'relative' }}
                style={{ height: `300px` }}
            >
                {keyboards[activeTab].UsageIds.map((key, index) => (
                    <Keycode
                        key={index}
                        id={key.UsageId}
                        label={key.Label}
                        width={key.w /2|| 50}
                        height={key.h/2 || 50}
                        x={key.x / 100}
                        y={key.y / 100}
                    />
                ))}
            </div>
        </div>
    );
}
