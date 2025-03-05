import { Modal, ModalProps } from "./UI/Modal.tsx";

interface RestoreStockSettings extends ModalProps {}

export function RestoreStock(props: RestoreStockSettings) {
    return (
        <>
            <Modal
                usedFor="restoreStockSettings"
                customModalBoxClass="w-11/12 max-w-5xl"
                onOk={props.onOk}
                okButtonText="Restore Stock Settings"
                modalButton={
                    <li>
                        <a>Restore Stock Settings</a>
                    </li>
                }
                hideCloseButton
            >
                <h2 className="my-2 text-lg">Restore Stock Settings</h2>
                <div>
                    <p>
                        Settings reset will remove any customizations previously
                        made in ZMK Studio and restore the stock keymap
                    </p>
                    <p>Continue?</p>
                </div>
            </Modal>
        </>
    )
}
