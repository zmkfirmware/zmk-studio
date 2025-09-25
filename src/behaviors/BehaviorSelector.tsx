import { useMemo, useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { GetBehaviorDetailsResponse } from "@zmkfirmware/zmk-studio-ts-client/behaviors"
import { Button } from "@/components/ui/button"
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface BehaviorSelectorProps {
	behaviors: GetBehaviorDetailsResponse[]
	selectedBehaviorId: number
	onBehaviorSelected: (behaviorId: number) => void
	placeholder?: string
	className?: string
}

export const BehaviorSelector = ({
	behaviors,
	selectedBehaviorId,
	onBehaviorSelected,
	placeholder = "Select behavior...",
	className
}: BehaviorSelectorProps) => {
	const [open, setOpen] = useState(false)

	const sortedBehaviors = useMemo(
		() =>
			behaviors.sort((a, b) =>
				a.displayName.localeCompare(b.displayName)
			),
		[behaviors]
	)

	const selectedBehavior = useMemo(
		() => sortedBehaviors.find((b) => b.id === selectedBehaviorId),
		[sortedBehaviors, selectedBehaviorId]
	)

	const handleSelect = (behaviorId: number) => {
		onBehaviorSelected(behaviorId)
		setOpen(false)
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			{/*todo search for a fix for asChild issue*/}
			<PopoverTrigger>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className={cn("w-64 justify-between", className)}
				>
					{selectedBehavior ? selectedBehavior.displayName : placeholder}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-64 p-0">
				<Command>
					<CommandInput placeholder="Search behaviors..." />
					<CommandList>
						<CommandEmpty>No behavior found.</CommandEmpty>
						<CommandGroup>
							{sortedBehaviors.map((behavior) => (
								<CommandItem
									key={behavior.id}
									value={behavior.displayName}
									onSelect={() => handleSelect(behavior.id)}
								>
									<Check
										className={cn(
											"mr-2 h-4 w-4",
											selectedBehaviorId === behavior.id ? "opacity-100" : "opacity-0"
										)}
									/>
									{behavior.displayName}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
}
