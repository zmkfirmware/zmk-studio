import { useCallback } from "react"
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover"
import { PhysicalLayout, type KeyPosition } from "./PhysicalLayout.tsx"
import { SidebarGroupContent, SidebarGroupLabel, SidebarGroupAction, SidebarMenuButton } from "../ui/sidebar"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button.tsx"
import { OverlayArrow, Pressable } from "react-aria-components"

export interface PhysicalLayoutItem {
	name: string
	keys: Array<KeyPosition>
}

export type PhysicalLayoutClickCallback = ( index: number ) => void

export interface PhysicalLayoutPickerProps {
	layouts: Array<PhysicalLayoutItem>
	selectedPhysicalLayoutIndex: number
	onPhysicalLayoutClicked?: PhysicalLayoutClickCallback
}

export const PhysicalLayoutPicker = ( {
	layouts,
	selectedPhysicalLayoutIndex,
	onPhysicalLayoutClicked
}: PhysicalLayoutPickerProps ) => {
	const handleLayoutSelect = useCallback(
		( index: number ) => {
			onPhysicalLayoutClicked?.( index )
		},
		[ onPhysicalLayoutClicked ]
	)
	console.log( layouts )
	return (
		<SidebarGroupContent>
			<SidebarGroupLabel>Layouts</SidebarGroupLabel>
			<SidebarGroupAction title="Add Layout">
				<Plus /> <span className="sr-only">Add Layout</span>
			</SidebarGroupAction>
			{ layouts && (
				<div className="space-y-2">
					{ layouts.map( ( layout, index ) => (
						<div key={ layout.name } className="w-full">

							<Popover>
								<PopoverTrigger className="w-full">
									<SidebarMenuButton>
										<h3 className="font-medium">{ layout.name }</h3>
										<p className="text-sm text-muted-foreground">
											{ layout.keys.length } keys
										</p>
									</SidebarMenuButton>
								</PopoverTrigger>
								<PopoverContent>
									<div className="space-y-4 ">
										<div className="flex justify-center">
											<PhysicalLayout
												oneU={ 20 }
												hoverZoom={ false }
												positions={ layout.keys.map( ( {
													x,
													y,
													width,
													height,
													r,
													rx,
													ry
												}, i ) => ({
													id: `${ layout.name }-${ i }`,
													x: x / 100.0,
													y: y / 100.0,
													width: width / 100.0,
													height: height / 100.0,
													r: (r || 0) / 100.0,
													rx: (rx || 0) / 100.0,
													ry: (ry || 0) / 100.0
												}) ) }
											/>
										</div>
										<Button
											variant={ index === selectedPhysicalLayoutIndex ? "default" : "outline" }
											className="w-full"
											onClick={ () => handleLayoutSelect( index ) }
										>
											{ index === selectedPhysicalLayoutIndex ? "Selected" : "Select Layout" }
										</Button>
									</div>
								</PopoverContent>
							</Popover>
							{/*	<Popover>*/ }
							{/*<PopoverTrigger>*/ }
							{/*</PopoverTrigger>*/ }
							{/*		<PopoverDialog className="w-80 p-4">*/ }
							{/*			<div className="space-y-4">*/ }
							{/*				<div>*/ }
							{/*					<h3 className="font-medium">{ layout.name }</h3>*/ }
							{/*					<p className="text-sm text-muted-foreground">*/ }
							{/*						{ layout.keys.length } keys*/ }
							{/*					</p>*/ }
							{/*				</div>*/ }
							{/*				<div className="flex justify-center">*/ }
							{/*					<PhysicalLayout*/ }
							{/*						oneU={ 20 }*/ }
							{/*						hoverZoom={ false }*/ }
							{/*						positions={ layout.keys.map( ( {*/ }
							{/*							x,*/ }
							{/*							y,*/ }
							{/*							width,*/ }
							{/*							height,*/ }
							{/*							r,*/ }
							{/*							rx,*/ }
							{/*							ry*/ }
							{/*						}, i ) => ({*/ }
							{/*							id: `${ layout.name }-${ i }`,*/ }
							{/*							x: x / 100.0,*/ }
							{/*							y: y / 100.0,*/ }
							{/*							width: width / 100.0,*/ }
							{/*							height: height / 100.0,*/ }
							{/*							r: (r || 0) / 100.0,*/ }
							{/*							rx: (rx || 0) / 100.0,*/ }
							{/*							ry: (ry || 0) / 100.0*/ }
							{/*						}) ) }*/ }
							{/*					/>*/ }
							{/*				</div>*/ }
							{/*				<Button*/ }
							{/*					variant={ index === selectedPhysicalLayoutIndex ? "default" : "outline" }*/ }
							{/*					className="w-full"*/ }
							{/*					onClick={ () => handleLayoutSelect( index ) }*/ }
							{/*				>*/ }
							{/*					{ index === selectedPhysicalLayoutIndex ? "Selected" : "Select Layout" }*/ }
							{/*				</Button>*/ }
							{/*			</div>*/ }
							{/*		</PopoverDialog>*/ }
							{/*	</Popover>*/ }

						</div>
					) ) }
				</div>
			) }
		</SidebarGroupContent>
	)
}
