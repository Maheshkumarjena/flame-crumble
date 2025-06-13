// components/Product/ImageUploader.jsx (Updated)
import React, { useState, useEffect, useCallback } from 'react';

const ImageUpload = ({ onFileSelect, imagePreview, onClearImage }) => {
    const [localPreviewUrl, setLocalPreviewUrl] = useState(null);

    // Effect to create/revoke local preview URL from `imagePreview` prop (Cloudinary URL)
    // or from a newly selected file
    useEffect(() => {
        if (imagePreview) {
            // If imagePreview is a Cloudinary URL, use it directly
            setLocalPreviewUrl(imagePreview);
        } else {
            // If no Cloudinary URL, clear local preview
            setLocalPreviewUrl(null);
        }
    }, [imagePreview]);

    const handleFileChange = useCallback((event) => {
        const file = event.target.files[0];
        if (file) {
            // Create a local URL for the new file for immediate preview
            const newPreview = URL.createObjectURL(file);
            setLocalPreviewUrl(newPreview);
            onFileSelect(file); // Pass the File object up to ProductManagement
        } else {
            setLocalPreviewUrl(null);
            onFileSelect(null); // No file selected
        }
    }, [onFileSelect]);

    const handleClear = useCallback(() => {
        setLocalPreviewUrl(null); // Clear local preview
        onClearImage(); // Notify parent to clear the image path/file
        // Reset the file input to allow re-selecting the same file if needed
        const fileInput = document.getElementById('image-upload-input');
        if (fileInput) {
            fileInput.value = '';
        }
    }, [onClearImage]);

    return (
        <div className="border border-gray-300 p-4 rounded-md shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Product Image</label>
            {localPreviewUrl ? (
                <div className="relative w-32 h-32 rounded-md overflow-hidden mb-4 border border-gray-200">
                    <img
                        src={localPreviewUrl}
                        alt="Image Preview"
                        className="object-cover w-full h-full"
                    />
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                        title="Remove Image"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-gray-400 transition-colors duration-200">
                    <input
                        id="image-upload-input"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <label htmlFor="image-upload-input" className="cursor-pointer flex flex-col items-center text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-upload-cloud mb-2"><polyline points="16 16 12 12 8 16"></polyline><line x1="12" y1="12" x2="12" y2="21"></line><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path><polyline points="16 16 12 12 8 16"></polyline></svg>
                        <span className="font-medium text-sm">Drag & drop an image or <span className="text-[#E30B5D] hover:underline">browse</span></span>
                        <span className="text-xs text-gray-500 mt-1">(PNG, JPG, GIF up to 5MB)</span>
                    </label>
                </div>
            )}
            {/* You might want to display the actual Cloudinary URL here for debugging if needed */}
            {/* {imagePreview && <p className="text-xs text-gray-500 mt-2 break-all">URL: {imagePreview}</p>} */}
        </div>
    );
};

export default ImageUpload;