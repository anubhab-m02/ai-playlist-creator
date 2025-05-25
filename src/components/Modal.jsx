import React from 'react';
import { XCircle } from 'lucide-react';

const Modal = ({ title, children, onClose }) => {
    // Prevent clicks inside the modal from closing it, only overlay clicks or close button
    const handleModalContentClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            onClick={onClose} // Click on overlay closes modal
        >
            <div 
                className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-md w-full"
                onClick={handleModalContentClick} // Stop propagation for content clicks
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-purple-300">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-200 transition-colors">
                        <XCircle size={24} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

export default Modal;
