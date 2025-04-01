import React from "react";

interface TextEditorProps {
    editText: string;
    setEditText: React.Dispatch<React.SetStateAction<string>>;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
    handleEditSubmit: () => void;
}

export default function TextEditor({editText, setEditText, setIsEditing, handleEditSubmit}: TextEditorProps) {
    const handleEditTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditText(event.target.value)
    }

    return (
        <div className="mt-5 relative flex flex-col p-4 bg-secondary rounded-lg w-[65vw]">
            <textarea
                className="p-3 mb-10 border focus:outline-none border-secondary rounded-md resize-none bg-secondary text-white"
                value={editText}
                onChange={handleEditTextChange}
                rows={4}
            />
            {/* Flex container for buttons */}
            <div className="flex justify-end gap-4">
                <button className="px-4 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-700"
                        onClick={() => setIsEditing(false)}>
                    Cancel
                </button>
                <button className="px-4 py-2 text-white bg-primary rounded-md hover:bg-primary-dark"
                        onClick={handleEditSubmit}>
                    Save
                </button>
            </div>
        </div>
    )
}