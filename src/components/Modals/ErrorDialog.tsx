import React from 'react'
import { Modal } from "@/components/ui/Modal.tsx"
import { AlertCircle } from 'lucide-react'

interface ErrorDialogProps {
	open: boolean
	onClose: () => void
	title?: string
	message: string
	details?: string
}

export function ErrorDialog({
	open,
	onClose,
	title = "Error",
	message,
	details
}: ErrorDialogProps) {
	return (
		<Modal
			opened={open}
			onClose={onClose}
			title={title}
			description={message}
			close="Close"
			success={false}
			showFooter={true}
			customModalBoxClass="max-w-md"
		>
			{details && (
				<div className="bg-gray-100 rounded p-3 mt-3">
					<p className="text-xs font-mono text-gray-500">{details}</p>
				</div>
			)}
		</Modal>
	)
}
