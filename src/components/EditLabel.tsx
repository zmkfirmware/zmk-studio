import { useState } from "react"
import { ModalProps } from "@/components/ui/OldModal.tsx"
import { Modal } from "@/components/ui/Modal.tsx"
import { Input } from "@/components/ui/input.tsx"

interface EditLabelData {
	id: number;
	name: string;
	newName?: string | null;
}

export interface EditLabelProps extends ModalProps {
	editLabelData?: EditLabelData;
	handleSaveNewLabel?: (
		id: number,
		oldName: string,
		newName: string | null
	) => void;
}

export default function EditLabel ( props: EditLabelProps ) {
	const [ newLabelName, setNewLabelName ] = useState( props.editLabelData.name )

	// const [label, setLabel] = useState(editLabelData);
	function handleSave () {
		return props.handleSaveNewLabel( props.editLabelData.id, props.editLabelData.name, newLabelName )
	}

	return (
		<Modal success= 'Update'
		       onOk={handleSave}
		       customModalBoxClass="w-11/14 max-w-2xl"
		       text="Rename"
		       type="text">
			<h2 className="mb-3 text-lg">New Layer Name</h2>
			<Input
				type="text" placeholder="Type here" className="input input-bordered w-full max-w-xs"
				defaultValue={ props.editLabelData.name }
				autoFocus
				onChange={ ( e ) => setNewLabelName( e.target.value ) }
				onKeyDown={ ( e ) => {
					if ( e.key === "Enter" ) {
						handleSave()
					}
				} }
			/>
			{/*<input*/}
			{/*	type="text" placeholder="Type here" className="input input-bordered w-full max-w-xs"*/}
			{/*	defaultValue={ props.editLabelData.name }*/}
			{/*	autoFocus*/}
			{/*	onChange={ ( e ) => setNewLabelName( e.target.value ) }*/}
			{/*	onKeyDown={ ( e ) => {*/}
			{/*		if ( e.key === "Enter" ) {*/}
			{/*			handleSave()*/}
			{/*		}*/}
			{/*	} }*/}
			{/*/>*/}
		</Modal>
	)
}
