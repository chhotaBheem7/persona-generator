
import React, { useState, useCallback } from 'react';
import { UploadIcon, FileIcon, TrashIcon } from './Icon';

interface FileUploadProps {
    files: File[];
    onFilesChange: (files: File[]) => void;
    disabled: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ files, onFilesChange, disabled }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if(!disabled) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (disabled) return;

        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles && droppedFiles.length > 0) {
            onFilesChange([...files, ...droppedFiles]);
        }
    }, [files, onFilesChange, disabled]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (selectedFiles.length > 0) {
            onFilesChange([...files, ...selectedFiles]);
        }
    };
    
    const removeFile = (index: number) => {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        onFilesChange(newFiles);
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-300 ${isDragging ? 'border-indigo-400 bg-gray-800' : 'border-gray-600 hover:border-gray-500'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <input
                    type="file"
                    id="file-upload"
                    multiple
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileSelect}
                    disabled={disabled}
                />
                <div className="flex flex-col items-center justify-center space-y-4">
                    <UploadIcon className="w-12 h-12 text-gray-400" />
                    <p className="text-gray-400">
                        <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">Documents, Sheets, Images, or Text files</p>
                </div>
            </div>

            {files.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-300 mb-2">Uploaded Files:</h3>
                    <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {files.map((file, index) => (
                            <li key={index} className="flex items-center justify-between bg-gray-800 p-3 rounded-md">
                                <div className="flex items-center space-x-3">
                                    <FileIcon className="h-5 w-5 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-200 truncate">{file.name}</span>
                                </div>
                                <button onClick={() => removeFile(index)} disabled={disabled} className="text-gray-500 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
