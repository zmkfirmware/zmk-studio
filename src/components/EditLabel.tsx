import { useState } from 'react';

interface EditLabelData {
    id: number;
    name: string;
}

export function EditLabel({
    onClose,
    editLabelData,
    handleSaveNewLabel,
}: {
    onClose: () => void;
    editLabelData: EditLabelData;
    handleSaveNewLabel: (
        id: number,
        oldName: string,
        newName: string | null,
    ) => void;
}) {
    const [newLabelName, setNewLabelName] = useState(editLabelData.name);

    function handleSave(){
        handleSaveNewLabel(editLabelData.id, editLabelData.name, newLabelName);
        onClose();
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
            <div className="mt-4 flex justify-end">
                <button className="py-1.5 px-2" type="button" onClick={onClose}>
                    Cancel
                </button>
                <button
                    className="py-1.5 px-2 ml-4 rounded-md bg-gray-100 text-black hover:bg-gray-300"
                    type="button"
                    onClick={() => {
                        handleSave();
                    }}
                >
                    Save
                </button>
            </div>
        </>
    );
}
