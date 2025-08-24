import { X } from "lucide-react"
import { BehaviorBindingPicker } from "../behaviors/BehaviorBindingPicker.tsx"
import { useBehaviors } from "../helpers/Behaviors.ts"
import { BehaviorBinding, Keymap } from "@zmkfirmware/zmk-studio-ts-client/keymap"
import { useCallback, useMemo } from "react"
import undoRedoStore from "../stores/UndoRedoStore.ts"
import useConnectionStore from "../stores/ConnectionStore.ts"
import { produce } from "immer"
import { callRemoteProcedureControl } from "../rpc/logging.ts"
import { SetLayerBindingResponse } from "@zmkfirmware/zmk-studio-ts-client/keymap"

interface KeyEditorProps {
	selectedKey: boolean;
	keymap: Keymap | undefined;
	setKeymap: (keymap: Keymap | ((prev: Keymap) => Keymap)) => void;
	selectedLayerIndex: number;
	selectedKeyPosition: number | undefined;
	setSelectedKeyPosition: (position: number | undefined) => void;
	setSelectedKey: (value: boolean) => void;
}

export function KeyEditor({
	selectedKey,
	keymap,
	setKeymap,
	selectedLayerIndex,
	selectedKeyPosition,
	setSelectedKeyPosition,
	setSelectedKey,
}: KeyEditorProps) {
	const { doIt } = undoRedoStore()
	const { connection } = useConnectionStore()
	const behaviors = useBehaviors()

	const sortedBehaviors = useMemo(
		() =>
			Object.values(behaviors).sort((a, b) =>
				a.displayName.localeCompare(b.displayName)
			),
		[behaviors]
	)

	const doUpdateBinding = useCallback(
		(binding: BehaviorBinding) => {
			if (!keymap || selectedKeyPosition === undefined) {
				console.error("Can't update binding without a selected key position and loaded keymap")
				return
			}
			
			// Add debugging to see what binding we're trying to set
			console.log("Attempting to set binding:", {
				behaviorId: binding.behaviorId,
				param1: binding.param1,
				param2: binding.param2,
				selectedKeyPosition,
				selectedLayerIndex,
				// Add hex values for debugging
				param1Hex: binding.param1?.toString(16),
				param2Hex: binding.param2?.toString(16)
			})
			
			const layer = selectedLayerIndex
			const layerId = keymap.layers[layer].id
			const keyPosition = selectedKeyPosition
			const oldBinding = keymap.layers[layer].bindings[keyPosition]

			doIt?.(async () => {
				if (!connection) throw new Error("Not connected")

				const resp = await callRemoteProcedureControl(connection, {
					keymap: {
						setLayerBinding: { layerId, keyPosition, binding }
					}
				})

				console.log("Binding response:", resp.keymap?.setLayerBinding)

				if (resp.keymap?.setLayerBinding === SetLayerBindingResponse.SET_LAYER_BINDING_RESP_OK) {
					setKeymap((prev: Keymap) => {
						const next = produce(prev, (draft) => {
							draft.layers[layer].bindings[keyPosition] = binding
						})
						return next
					})
				} else {
					console.error("Failed to set binding", resp.keymap?.setLayerBinding)
					// Log more details about the failed binding
					console.error("Failed binding details:", {
						layerId,
						keyPosition,
						binding,
						response: resp.keymap?.setLayerBinding,
						// Add more debugging info
						oldBinding,
						behaviorId: binding.behaviorId,
						param1: binding.param1,
						param2: binding.param2
					})
				}

				return async () => {
					if (!connection) return

					const resp = await callRemoteProcedureControl(connection, {
						keymap: {
							setLayerBinding: {
								layerId,
								keyPosition,
								binding: oldBinding
							}
						}
					})
					if (resp.keymap?.setLayerBinding === SetLayerBindingResponse.SET_LAYER_BINDING_RESP_OK) {
						setKeymap((prev: Keymap) => {
							const next = produce(prev, (draft) => {
								draft.layers[layer].bindings[keyPosition] = oldBinding
							})
							return next
						})
					} else {
						console.error("Failed to set binding", resp.keymap?.setLayerBinding)
					}
				}
			})
		},
		[connection, keymap, doIt, selectedLayerIndex, selectedKeyPosition, setKeymap]
	)

	const selectedBinding = useMemo(() => {
		if (keymap == null || selectedKeyPosition == null || !keymap.layers[selectedLayerIndex]) return null

		setSelectedKey(true)

		return keymap.layers[selectedLayerIndex].bindings[selectedKeyPosition]
	}, [keymap, selectedLayerIndex, selectedKeyPosition, setSelectedKey])

	return (
		<>
			{selectedKey && (
				<div className="p-2 col-start-2 row-start-2 w-full">
					<div className="card bg-base-100 shadow-xl">
						<div className="card-body p-4">
							<div className="flex flex-row gap-4 w-full">
									<BehaviorBindingPicker
										binding={selectedBinding}
										behaviors={Object.values(behaviors)}
										layers={keymap?.layers.map(
											( { id, name }, li ) => ({
												id,
												name: name || li.toLocaleString()
											})
										) || []}
										onBindingChanged={doUpdateBinding}
									/>
							</div>
								<button
									className="btn btn-square btn-sm absolute right-0 top-0 btn-soft btn-primary"
									onClick={() => {
										setSelectedKey(false)
										setSelectedKeyPosition(undefined)
									}}
								>
									<X />
								</button>
						</div>
					</div>
				</div>
			)}
		</>
	)
}