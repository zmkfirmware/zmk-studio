import { keyboards } from "../../data/keys"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

// Modifier key definitions (same as HidUsagePicker)
enum Mods {
	LeftControl = 0x01,
	LeftShift = 0x02,
	LeftAlt = 0x04,
	LeftGUI = 0x08,
	RightControl = 0x10,
	RightShift = 0x20,
	RightAlt = 0x40,
	RightGUI = 0x80,
}

const mod_labels: Record<Mods, string> = {
	[Mods.LeftControl]: 'L Ctrl',
	[Mods.LeftShift]: 'L Shift',
	[Mods.LeftAlt]: 'L Alt',
	[Mods.LeftGUI]: 'L GUI',
	[Mods.RightControl]: 'R Ctrl',
	[Mods.RightShift]: 'R Shift',
	[Mods.RightAlt]: 'R Alt',
	[Mods.RightGUI]: 'R GUI',
}

// Map keyboard IDs to modifier flags
const KEY_ID_TO_MOD: Record<number, Mods> = {
	224: Mods.LeftControl,   // Keyboard LeftControl
	225: Mods.LeftShift,     // Keyboard LeftShift
	226: Mods.LeftAlt,       // Keyboard LeftAlt
	227: Mods.LeftGUI,       // Keyboard Left GUI
	228: Mods.RightControl,  // Keyboard RightControl
	229: Mods.RightShift,    // Keyboard RightShift
	230: Mods.RightAlt,      // Keyboard RightAlt
	231: Mods.RightGUI,      // Keyboard Right GUI
}

interface SelectedKeysDisplayProps {
	selectedKey?: number
	selectedModifiers: Mods[]
	onClearAll: () => void
	onRemoveKey: (key: number) => void
	onRemoveModifier: (keyId: number) => void
}

export const SelectedKeysDisplay = ({
	selectedKey,
	selectedModifiers,
	onClearAll,
	onRemoveKey,
	onRemoveModifier
}: SelectedKeysDisplayProps) => {
	// Helper function to get key info by ID
	function getKeyInfo(keyId: number) {
		for (const keyboard of keyboards) {
			const key = keyboard.UsageIds.find(k => {
				const kId = typeof k.Id === 'string' ? parseInt(k.Id) : k.Id;
				return kId === keyId;
			});
			if (key) {
				return { ...key, keyboardName: keyboard.Name };
			}
		}
		return null;
	}

	// Helper function to get display label for selected key
	function getSelectedKeyDisplayLabel(): string {
		if (selectedKey === undefined) return "";
		
		const keyInfo = getKeyInfo(selectedKey);
		if (keyInfo) {
			// Prefer Label over Name, and ensure we have a readable string
			const label = keyInfo.Label || keyInfo.Name;
			if (label && label.trim() !== "") {
				return label;
			}
		}
		
		// If we can't get a proper label, try to find it in the keyboard data
		// This is a fallback for when the conversion might have failed
		for (const keyboard of keyboards) {
			const key = keyboard.UsageIds.find(k => {
				const kId = typeof k.Id === 'string' ? parseInt(k.Id) : k.Id;
				return kId === selectedKey;
			});
			if (key && key.Label && key.Label.trim() !== "") {
				return key.Label;
			}
		}
		
		// Last resort: show a generic label
		return `Key ${selectedKey}`;
	}

	if (selectedKey === undefined && selectedModifiers.length === 0) {
		return null;
	}

	return (
		<Card className="mb-4 w-full">
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-sm">Selected Key & Modifiers</CardTitle>
					<Button 
						variant="ghost" 
						size="sm"
						onClick={onClearAll}
					>
						Clear All
					</Button>
				</div>
			</CardHeader>
			<CardContent className="pt-0 w-full">
				<div className="flex flex-wrap gap-2">
					{/* Display selected key */}
					{selectedKey !== undefined && (
						<div className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-md text-sm">
							{getSelectedKeyDisplayLabel()}
							<Button 
								variant="ghost" 
								size="icon"
								className="h-4 w-4 p-0 hover:bg-primary-foreground/20"
								onClick={() => onRemoveKey(selectedKey)}
							>
								<X className="h-3 w-3" />
							</Button>
						</div>
					)}
					{/* Display selected modifiers */}
					{selectedModifiers.map(modifier => {
						// Find the key ID that corresponds to this modifier
						const keyId = Object.keys(KEY_ID_TO_MOD).find(k => KEY_ID_TO_MOD[parseInt(k)] === modifier);
						const keyInfo = keyId ? getKeyInfo(parseInt(keyId)) : null;
						
						console.log("Displaying modifier:", { 
							modifier, 
							keyId, 
							keyInfo, 
							modLabel: mod_labels[modifier] 
						});
						
						return (
							<div key={`mod-${modifier}`} className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm">
								{keyInfo?.Label || mod_labels[modifier]}
								<Button 
									variant="ghost" 
									size="icon"
									className="h-4 w-4 p-0 hover:bg-secondary-foreground/20"
									onClick={() => {
										console.log("Modifier X button clicked for:", { modifier, keyId });
										if (keyId) {
											onRemoveModifier(parseInt(keyId));
										}
									}}
								>
									<X className="h-3 w-3" />
								</Button>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	)
}
