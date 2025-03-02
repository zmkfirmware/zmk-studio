import { useState } from 'react';
import { Modal, ModalProps } from "./UI/Modal"

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
        newName: string | null,
    ) => void;
}

export default function EditLabelModal(props: EditLabelProps) {
    const [newLabelName, setNewLabelName] = useState(props.editLabelData.name);
    // const [label, setLabel] = useState(editLabelData);
    function handleSave(){
        props.handleSaveNewLabel(props.editLabelData.id, props.editLabelData.name, newLabelName);
    }

    return (
        <>
            <Modal usedFor="editLabel" modalButton={""} opened={props.opened} hideCloseButton customModalBoxClass={'w-auto'}>
                <h2 className="mb-3 text-lg">New Layer Name</h2>
                {/*<label className="input input-bordered flex items-center gap-2">*/}
                {/*    Label*/}
                <input
                    type="text" placeholder="Type here" className="input input-bordered w-full max-w-xs"
                    defaultValue={props.editLabelData.name}
                    autoFocus
                    onChange={(e) => setNewLabelName(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSave();
                        }
                    }}
                />

                {/*</label>*/}
            </Modal>
        </>
    );
}
