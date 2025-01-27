import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type UndoCallback = () => Promise<void>
export type DoCallback = () => Promise<UndoCallback>

interface UndoRedoState {
    locked: boolean
    undoStack: Array<[DoCallback, UndoCallback]>
    redoStack: Array<DoCallback>
    canUndo: () => boolean
    canRedo: () => boolean
    doIt: (doCb: DoCallback, preserveRedo?: boolean) => Promise<void>
    undo: () => Promise<void>
    redo: () => Promise<void>
    reset: () => void
}

const useUndoRedoStore = create<UndoRedoState>()(
    devtools((set, get) => ({
        locked: false,
        undoStack: [],
        redoStack: [],

        canUndo: () => !get().locked && get().undoStack.length > 0,
        canRedo: () => !get().locked && get().redoStack.length > 0,

        doIt: async (doCb, preserveRedo = false) => {
            set({ locked: true })
            const undo = await doCb()

            set((state) => ({ undoStack: [[doCb, undo], ...state.undoStack] }))
            if (!preserveRedo) {
                set({ redoStack: [] })
            }
            set({ locked: false })
        },

        undo: async () => {
            const { locked, undoStack, redoStack } = get()
            if (locked || undoStack.length === 0)
                throw new Error(
                    'undo invoked when existing operation in progress or empty stack',
                )
            set({ locked: true })
            const [doCb, undoCb] = undoStack[0]
            set({
                undoStack: undoStack.slice(1),
                redoStack: [doCb, ...redoStack],
            })
            await undoCb()
            set({ locked: false })
        },

        redo: async () => {
            const { locked, redoStack } = get()
            if (locked || redoStack.length === 0)
                throw new Error(
                    'redo invoked when existing operation in progress or empty stack',
                )
            const doCb = redoStack[0]
            set({ redoStack: redoStack.slice(1) })
            await get().doIt(doCb, true)
        },

        reset: () => set({ redoStack: [], undoStack: [] }),
    })),
)

export default useUndoRedoStore
