import { useCallback, useEffect, useState } from 'react'
import { useEmitter } from '../helpers/usePubSub.ts'
import { LockState } from '@zmkfirmware/zmk-studio-ts-client/core'
import { Redo2, Save, Trash2, Undo2 } from 'lucide-react'
import useConnectionStore from '../stores/ConnectionStore.ts'
import undoRedoStore from '../stores/UndoRedoStore.ts'
import { Settings } from '../components/Modals/Settings.tsx'
import { SidebarTrigger } from '@/components/ui/sidebar.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Separator } from '@/components/ui/separator.tsx'
import { DarkModeToggle } from '@/components/DarkModeToggle.tsx'
import { useConnectedDeviceData } from '@/services/RpcConnectionService.ts'
import { toast } from 'sonner'
import { callRemoteProcedureControl } from '@/services/CallRemoteProcedureControl.ts'

export interface AppHeaderProps {}

export function Header({}: AppHeaderProps) {
    const { connection, lockState, setConnection } = useConnectionStore()
    const { undo, redo, canUndo, canRedo, reset } = undoRedoStore()
    const [showSettingsReset, setShowSettingsReset] = useState(false)
    const { subscribe } = useEmitter()

    const [unsaved, setUnsaved] = useConnectedDeviceData<boolean>(
        { keymap: { checkUnsavedChanges: true } },
        (request) => request.keymap?.checkUnsavedChanges,
    )

    useEffect(() => {
        console.log(unsaved)
        return subscribe(
            'rpc_notification.keymap.unsavedChangesStatusChanged',
            (ls) => {
                console.log(ls)
                setUnsaved(ls)
            },
        )
    }, [setUnsaved, subscribe, unsaved])

    useEffect(() => {
        if (
            (!connection ||
                lockState !== LockState.ZMK_STUDIO_CORE_LOCK_STATE_UNLOCKED) &&
            showSettingsReset
        ) {
            setShowSettingsReset(false)
        }
    }, [connection, lockState, showSettingsReset])

    const save = useCallback(async () => {
        let resp = await callRemoteProcedureControl({
            keymap: { saveChanges: true },
        })

        if (!resp.keymap?.saveChanges || resp.keymap?.saveChanges.err) {
            console.error('Failed to save changes', resp.keymap?.saveChanges)
            toast.error(`Failed to save changes`)
        }
    }, [connection])

    const discard = useCallback(async () => {
        let resp = await callRemoteProcedureControl({
            keymap: { discardChanges: true },
        })

        if (!resp.keymap?.discardChanges) {
            console.error('Failed to discard changes', resp)
            toast.error(`Failed to discard changes`)
        }

        reset()
        setConnection(connection)
    }, [connection])

    return (
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mx-2 data-[orientation=vertical]:h-4"
                />
                <img
                    src="/zmk.svg"
                    alt="ZMK Logo"
                    className="h-8 rounded ps-3"
                />{' '}
                <span className="px-3">Studio</span>
                <div className="ml-auto flex items-center gap-2">
                    <DarkModeToggle></DarkModeToggle>
                    <Settings />
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={!canUndo()}
                        onClick={undo}
                        data-tip="Undo"
                    >
                        <Undo2 aria-label="Undo" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={!canRedo()}
                        onClick={redo}
                        data-tip="Undo"
                    >
                        <Redo2 aria-label="Undo" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={
                            !unsaved ||
                            !connection ||
                            lockState !==
                                LockState.ZMK_STUDIO_CORE_LOCK_STATE_UNLOCKED
                        }
                        data-tip="Save"
                        onClick={save}
                    >
                        <Save aria-label="Save" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={!unsaved}
                        data-tip="Discard"
                        onClick={discard}
                    >
                        <Trash2 aria-label="Discard" />
                    </Button>
                </div>
            </div>
        </header>
    )
}
