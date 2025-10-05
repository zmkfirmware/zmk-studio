import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

// Define the store interface
interface LayerSelectionState {
    selectedLayerIndex: number
    setSelectedLayerIndex: (index: number) => void
}

// Create Zustand store with persistence
const useLayerSelectionStore = create<LayerSelectionState>()(
    devtools(
        persist(
            (set) => ({
                selectedLayerIndex: 0,
                setSelectedLayerIndex: (index) => set({ selectedLayerIndex: index }),
            }),
            {
                name: 'layer-selection-store', // Storage key
                storage: createJSONStorage(() => localStorage), // Persist in localStorage
            },
        ),
    ),
)

export default useLayerSelectionStore
