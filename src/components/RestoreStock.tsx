import { useState } from "react"
import { Modal, ModalProps } from "@/components/ui/Modal.tsx"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu.tsx"
import { RotateCcw } from "lucide-react"

interface RestoreStockSettings {
  onOk: () => void
}

export function RestoreStock(props: RestoreStockSettings) {
  const [showModal, setShowModal] = useState(false)

  const handleClick = () => {
    setShowModal(true)
  }

  const handleOk = () => {
    props.onOk()
    setShowModal(false)
  }

  return (
    <>
      <DropdownMenuItem onClick={handleClick}>
        <RotateCcw className="mr-2 h-4 w-4" />
        Restore Stock Settings
      </DropdownMenuItem>
      
      {showModal && (
        <Modal
          usedFor="restoreStockSettings"
          customModalBoxClass="w-11/12 max-w-5xl"
          onOk={handleOk}
          okButtonText="Restore Stock Settings"
          modalButton={null}
          hideCloseButton
          open={showModal}
          onOpenChange={setShowModal}
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
      )}
    </>
  )
}
