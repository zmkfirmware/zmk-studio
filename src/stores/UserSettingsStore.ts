import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

// Define the store interface
interface UserSettingsState {
    theme: 'dark' | 'light'
    autosave: boolean
    setTheme: (theme: 'dark' | 'light') => void
    setAutosave: (enabled: boolean) => void
}

// Create Zustand store with persistence
const useUserSettingsStore = create<UserSettingsState>()(
    devtools(
        persist(
            (set) => ({
                theme: 'light',
                autosave: false,
                setTheme: (theme) => set({ theme }),
                setAutosave: (enabled) => set({ autosave: enabled }),
            }),
            {
                name: 'user-settings-store', // Storage key
                storage: createJSONStorage(() => localStorage), // Persist in localStorage
            },
        ),
    ),
)

export default useUserSettingsStore
