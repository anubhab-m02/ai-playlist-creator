import React, { useState, useEffect } from 'react';
import Modal from './Modal'; // Assuming Modal.jsx is in the same directory
import { X, Tag, PlusCircle } from 'lucide-react';

const ManageTagsModal = ({
    isOpen,
    onClose,
    currentTags,
    onSaveTags,
    maxTags = 10,
}) => {
    const [tagsInModal, setTagsInModal] = useState([]);
    const [newTagInput, setNewTagInput] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setTagsInModal([...currentTags]); // Initialize with a copy
            setNewTagInput('');
            setError('');
        }
    }, [isOpen, currentTags]);

    const handleRemoveTag = (tagToRemove) => {
        setTagsInModal(prevTags => prevTags.filter(tag => tag !== tagToRemove));
    };

    const handleAddTags = () => {
        setError('');
        const newTagsArray = newTagInput
            .split(',')
            .map(tag => tag.trim().toLowerCase())
            .filter(tag => tag !== '');

        if (newTagsArray.length === 0 && newTagInput.trim() !== '') {
             // Handles case where input is just commas or spaces
            setError('Please enter valid tag names.');
            return;
        }
        if (newTagsArray.length === 0 && newTagInput.trim() === '') {
            // Handles case where input is empty
            return; // Do nothing if input is empty
        }


        let addedCount = 0;
        let alreadyExistCount = 0;
        let limitReached = false;

        const updatedTags = [...tagsInModal];

        for (const newTag of newTagsArray) {
            if (updatedTags.length >= maxTags) {
                limitReached = true;
                break;
            }
            if (!updatedTags.includes(newTag)) {
                updatedTags.push(newTag);
                addedCount++;
            } else {
                alreadyExistCount++;
            }
        }
        
        setTagsInModal(updatedTags);
        setNewTagInput('');

        if (limitReached) {
            setError(`Cannot add more than ${maxTags} tags.`);
        } else if (addedCount === 0 && alreadyExistCount > 0) {
            setError('All entered tags already exist.');
        } else if (alreadyExistCount > 0) {
            setError(`${alreadyExistCount} of the entered tags already exist. Others added.`);
        }
    };
    
    const handleSave = () => {
        onSaveTags([...tagsInModal]); // Save a copy to avoid direct state mutation issues
        onClose();
    };

    if (!isOpen) {
        return null;
    }

    return (
        <Modal title="Manage Playlist Tags" onClose={onClose}>
            <div className="space-y-4">
                {error && (
                    <p className="text-sm text-red-400 bg-red-900/50 p-2 rounded-md">{error}</p>
                )}
                <div>
                    <label htmlFor="newTagInputModal" className="block text-sm font-medium text-gray-300 mb-1">
                        Add New Tags (comma-separated)
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            id="newTagInputModal"
                            value={newTagInput}
                            onChange={(e) => setNewTagInput(e.target.value)}
                            onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTags();}}}
                            placeholder="e.g., 80s, synthwave, upbeat"
                            className="flex-grow p-2.5 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-gray-500"
                        />
                        <button
                            type="button"
                            onClick={handleAddTags}
                            className="flex items-center justify-center px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-md shadow-sm transition-colors text-sm"
                            title="Add tags from input"
                        >
                            <PlusCircle size={18} />
                        </button>
                    </div>
                </div>

                <div>
                    <h4 className="text-md font-medium text-purple-300 mb-2">Current Tags ({tagsInModal.length}/{maxTags})</h4>
                    {tagsInModal.length > 0 ? (
                        <div className="flex flex-wrap gap-2 p-3 bg-slate-800/60 rounded-md min-h-[50px]">
                            {tagsInModal.map(tag => (
                                <span
                                    key={tag}
                                    className="flex items-center bg-purple-600 text-white text-xs font-semibold pl-3 pr-2 py-1 rounded-full h-fit"
                                >
                                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTag(tag)}
                                        className="ml-1.5 text-purple-200 hover:text-white p-0.5 rounded-full hover:bg-purple-700/50 transition-colors"
                                        title={`Remove tag: ${tag}`}
                                    >
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 italic p-3 bg-slate-800/60 rounded-md">No tags added yet.</p>
                    )}
                </div>

                <div className="flex justify-end space-x-3 pt-3 border-t border-slate-600">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md text-sm font-medium bg-slate-600 hover:bg-slate-500 text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 rounded-md text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-colors"
                    >
                        Save Tags
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ManageTagsModal;
