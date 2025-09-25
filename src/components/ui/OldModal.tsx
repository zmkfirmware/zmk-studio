import React, { useEffect, useRef } from 'react'

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

export function OldModal({
    usedFor = 'default',
    opened = false,
    onClose,
    onOk,
    type,
    className = '',
    customModalBoxClass = '',
    modalButton,
    hideXButton = false,
    hideCloseButton = false,
    okButtonText = 'OK',
    children
}: ModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        const dialog = dialogRef.current

        if (!dialog) return

        opened ? dialog.showModal() : dialog.close()
    }, [opened])

    const handleClose = () => onClose?.()
    const handleOk = () => onOk?.()

    return (
        <>
            {modalButton && !opened && (
                <span
                    className={`cursor-pointer ${type || ''}`}
                    onClick={() => dialogRef.current?.showModal()}
                >
                    {modalButton}
                </span>
            )}
            <dialog
                ref={dialogRef}
                className={`modal ${className}`}
                onClose={handleClose}
            >
                <div className={`modal-box ${customModalBoxClass}`}>
                    {children}
                    <div className="modal-action">
                        <form method="dialog">
                            {!hideCloseButton && (
                                <button
                                    className="btn"
                                    onClick={handleClose}
                                >
                                    Close
                                </button>
                            )}
                            {onOk && (
                                <button
                                    onClick={handleOk}
                                    className="btn"
                                >
                                    {okButtonText}
                                </button>
                            )}
                            {!hideXButton && (
                                <button
                                    className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                                >
                                    ✕
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            </dialog>
        </>
    )
}
