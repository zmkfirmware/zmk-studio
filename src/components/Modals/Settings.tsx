// import useUserSettingsStore from "../../stores/UserSettingsStore.ts";

import { OldModal, ModalProps } from "@/components/ui/OldModal.tsx";
import { Settings as SettingsIcon } from "lucide-react";
import { DarkModeToggle } from "@/components/DarkModeToggle.tsx"
import { Modal } from "@/components/ui/Modal.tsx"

interface SettingsProps extends ModalProps{}

export function Settings(props: SettingsProps) {

    // const userSettingsStore = useUserSettingsStore()
    return (
        <Modal
            customModalBoxClass="w-11/14 max-w-4xl"
            type='icon'
            icon={ <SettingsIcon /> }
            variant='ghost'
        >
           <span>

            </span>
        </Modal>
    )

}
