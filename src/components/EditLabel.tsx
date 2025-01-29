import { useState } from 'react';

interface EditLabelData {
    id: number;
    name: string;
    newName: string | null;
}

export default function EditLabel({
    editLabelData,
    handleSaveNewLabel,
}: {
    editLabelData: EditLabelData;
    handleSaveNewLabel?: (
        id: number,
        oldName: string,
        newName: string | null,
    ) => void;
}) {
    const [newLabelName, setNewLabelName] = useState(editLabelData.name);
    const [label, setLabel] = useState(editLabelData);
    function handleSave(){
        handleSaveNewLabel(editLabelData.id, editLabelData.name, newLabelName);
    }

    return (
        <>
            <span className="mb-3 text-lg">New Layer Name</span>
            <input
                className="p-1 border rounded border-base-content border-solid"
                type="text"
                defaultValue={editLabelData.name}
                autoFocus
                onChange={(e) => setNewLabelName(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSave();
                    }
                }}
            />
        </>
    );
}
