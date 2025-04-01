import { Dispatch, SetStateAction, useState } from "react";

interface DeleteButtonProps {
    onDelete: () => void;
    setIsDropdownVisible: Dispatch<SetStateAction<boolean>>;
}

export default function DeleteButton({ onDelete, setIsDropdownVisible }: DeleteButtonProps) {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    return (
        <>
            <li 
                onClick={() => {
                    setIsOpen(true)
                }} 
                className="px-4 py-2 cursor-pointer hover:bg-foreground"
            >
                Delete
            </li>

            {isOpen && <DeleteConfirmationPopup onConfirm={()=> {
                onDelete()
                setIsDropdownVisible(false)
            }} 
            onCancel={() => {
                setIsOpen(false)
                setIsDropdownVisible(false)
                }} />}
        </>
    );
}

interface DeleteConfirmationPopupProps {
    onConfirm: () => void;
    onCancel: () => void;
}

function DeleteConfirmationPopup({ onConfirm, onCancel }: DeleteConfirmationPopupProps) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
                <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
                <p className="text-gray-600 mb-4">Are you sure you want to delete this item?</p>
                <div className="flex justify-center space-x-4">
                    <button 
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => { onConfirm(); onCancel(); }}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
