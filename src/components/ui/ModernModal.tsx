import React, { useState } from 'react'
import {
	Dialog,
	DialogOverlay,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription, DialogClose
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

// Create a forwardRef wrapper for span
const TextTrigger = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
	({ className, ...props }, ref) => (
		<span
			ref={ref}
			className={`underline-offset-4 cursor-pointer ${className || ''}`}
			{...props}
		/>
	)
)
TextTrigger.displayName = "TextTrigger"

export interface ModernModalProps {
	usedFor?: string
	opened?: boolean
	onClose?: () => void | Promise<void>
	onOk?: () => void | Promise<void>
	type?: 'button' | 'text'
	className?: string
	customModalBoxClass?: string
	text?: string | React.ReactNode
	xButton?: boolean
	close?: string | boolean
	success?: string | boolean
	title?: string
	description?: string
	children?: React.ReactNode
	isDismissable?: boolean,
	showFooter?: boolean
	widthClass?: string
	heightClass?: string
}

export function ModernModal({
	opened = false,
	onClose,
	onOk,
	type,
	text,
	className = '',
	customModalBoxClass = '',
	xButton = true,
	close = 'Cancel',
	success = 'OK',
	showFooter = true,
	title,
	description,
	children,
	isDismissable = false,
	widthClass,
	heightClass,
}: ModernModalProps) {
	const [isOpen, setIsOpen] = useState(opened)

	// Update internal state when opened prop changes
	React.useEffect(() => {
		setIsOpen(opened)
	}, [opened])

	const handleClose = () => {
		setIsOpen(false)
		onClose?.()
	}

	const handleOk = async () => {
		if (onOk) {
			await onOk()
		}
		handleClose()
	}

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open)
		if (!open) {
			onClose?.()
		}
	}

	const blockDismiss = (e) => e.preventDefault();

	return (
		<Dialog open={ isOpen } onOpenChange={setIsOpen}>

			{type== "button" && !opened && (
				<DialogTrigger asChild>
					<Button variant="default" className="cursor-pointer">{ text }</Button>
				</DialogTrigger>
			)}
			{type== "text" && !opened && (
				<DialogTrigger asChild>
					<TextTrigger>{ text }</TextTrigger>
				</DialogTrigger>
			)}
			<DialogOverlay>
				<DialogContent  className={`${customModalBoxClass}`} showCloseButton={xButton}
				                {...(isDismissable
					                ? {
						                onEscapeKeyDown: blockDismiss,
						                onPointerDownOutside: blockDismiss,
						                onInteractOutside: blockDismiss,
					                }
					                : {})}
				>
					<DialogHeader>
						<DialogTitle>{ title }</DialogTitle>
						<DialogDescription>{ description }</DialogDescription>
					</DialogHeader>{ children }
					{ showFooter && (
						<DialogFooter>
							{ close && (
								<DialogClose asChild>
									<Button variant="outline" onClick={handleClose}>{ close }</Button>
								</DialogClose>
							)}
							{ success && (
								<Button type="submit" onClick={handleOk}>{ success }</Button>
							)}
						</DialogFooter>
					)}
				</DialogContent>
			</DialogOverlay>
		</Dialog>

	)
} 