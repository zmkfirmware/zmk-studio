import React, { useEffect } from 'react'

export interface ModalProps {
    usedFor?: string
    opened?: boolean
    onClose?: () => void | Promise<void>
    onOk?: () => void | Promise<void>
    type?: 'btn'
    className?: string
    customModalBoxClass?: string
    modalButton?: string | React.ReactNode
    hideXButton?: boolean
    hideCloseButton?: boolean
    okButtonText?: string
    children?: React.ReactNode
}

export function Modal(props: ModalProps) {
    useEffect(() => {
        if (props.opened) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            document.getElementById(`modal_${props.usedFor}`)?.showModal()
        }
        return () => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            document.getElementById(`modal_${props.usedFor}`)?.close()
        }
    }, [])
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function closeModal() {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        document.getElementById(`modal_${usedFor}`)?.close()
    }
    return (
        <>
            <span
                hidden={props.opened || !props.modalButton}
                className={`cursor-pointer ${props.type}`}
                onClick={() =>
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    document.getElementById(`modal_${props.usedFor}`)?.showModal()
                }
            >
                {props.modalButton}
            </span>
            <dialog
                id={`modal_${props.usedFor}`}
                className={`modal ${props.className}`}
                onClose={props.onClose}
            >
                <div className={`modal-box ${props.customModalBoxClass}`}>
                    {props.children}
                    <div className="modal-action">
                        <form method="dialog">
                            {/* if there is a button in form, it will close the modal */}
                            <button
                                className={`btn ${props.hideCloseButton ? 'hidden' : ''}`}
                                onClick={props.onClose}
                            >
                                Close
                            </button>
                            <button
                                onClick={props.onOk}
                                className={`btn ${!props.onOk ? 'hidden' : ''}`}
                            >
                                {props.okButtonText}
                            </button>
                            <button
                                className={`btn btn-sm btn-circle btn-ghost absolute right-2 top-2 ${props.hideXButton ? 'hidden' : ''}`}
                            >
                                ✕
                            </button>
                        </form>
                    </div>
                </div>
            </dialog>
        </>
    )
}
