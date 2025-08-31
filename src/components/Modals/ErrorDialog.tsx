import React from 'react'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog.tsx"
import { Button } from "@/components/ui/button.tsx"
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
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<div className="flex items-center gap-2">
						<AlertCircle className="h-5 w-5 text-destructive" />
						<DialogTitle className="text-destructive">{title}</DialogTitle>
					</div>
				</DialogHeader>
				
				<div className="space-y-3">
					<p className="text-sm text-muted-foreground">{message}</p>
					{details && (
						<div className="rounded-md bg-muted p-3">
							<p className="text-xs font-mono text-muted-foreground">{details}</p>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button onClick={onClose} variant="outline">
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
