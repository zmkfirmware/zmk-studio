import { useCallback, useState } from 'react'
import { useEmitter } from '../helpers/usePubSub.ts'
import { LockState } from '@zmkfirmware/zmk-studio-ts-client/core'
import { RestoreStock } from './RestoreStock.tsx'
import useConnectionStore from '../stores/ConnectionStore.ts'
import undoRedoStore from '../stores/UndoRedoStore.ts'
import { Button } from '@/components/ui/button.tsx'
import { Settings, Power, Sun, Moon } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar.tsx'
import { useConnectedDeviceData } from '@/services/RpcConnectionService.ts'
import { toast } from 'sonner'
import { callRemoteProcedureControl } from '@/services/CallRemoteProcedureControl.ts'

export const DeviceMenu = () => {
    const {
        connection,
        setConnection,
        deviceName,
        lockState,
    } = useConnectionStore()
    const { reset } = undoRedoStore()
    const [connectionAbort, setConnectionAbort] = useState(
        new AbortController(),
    )

    //todo fix disconnect not working
    const disconnect2 = useCallback(async () => {
        if (!connection) {
            return
        }

        await connection.request_writable.close()
        connectionAbort.abort('User disconnected')
        setConnectionAbort(new AbortController())
    }, [connection])

    const resetSettings = useCallback(async () => {
        let resp = await callRemoteProcedureControl({
            core: { resetSettings: true },
        })

        if (!resp.core?.resetSettings) {
            console.error('Failed to settings reset', resp)
            toast.error('Failed to settings reset')
            return
        }

        reset()

        const currentConnection = connection
        setConnection(null)

        setTimeout(() => {
            setConnection(currentConnection)
        }, 0)
    }, [connection, reset, setConnection])

    const isDisabled =
        !deviceName ||
        lockState !== LockState.ZMK_STUDIO_CORE_LOCK_STATE_UNLOCKED

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger className="w-full">
                        <Button
                            variant="outline"
                            className="w-full justify-between"
                            disabled={isDisabled}
                        >
                            <span className="truncate">
                                {deviceName || 'No Device Connected'}
                            </span>
                            <Settings className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent>
                        <DropdownMenuItem
                            onClick={disconnect2}
                            className="text-destructive focus:text-destructive"
                        >
                            <Power className="mr-2 h-4 w-4" />
                            Disconnect
                        </DropdownMenuItem>
                        <RestoreStock onOk={() => resetSettings()} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
