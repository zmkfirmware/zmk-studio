// import useUserSettingsStore from "../../stores/UserSettingsStore.ts";

import { Modal, ModalProps } from "../UI/Modal.tsx";
import { Settings as SettingsIcon } from "lucide-react";

interface SettingsProps extends ModalProps{}

export function Settings(props: SettingsProps) {

    // const userSettingsStore = useUserSettingsStore()
    return <>
        <Modal usedFor="settings" modalButton={<button className="btn btn-ghost btn-circle tooltip tooltip-bottom mx-1" data-tip="Settings"><SettingsIcon /></button>}>
            <span></span>
        </Modal>
    </>
}
