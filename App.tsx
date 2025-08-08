
import React, { useState, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import PersonaDisplay from './components/PersonaDisplay';
import Spinner from './components/Spinner';
import { SparklesIcon } from './components/Icon';
import { Persona, FileData } from './types';
import { extractTextFromFiles, generatePersonaDetails, generatePersonaImage } from './services/geminiService';

const App: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [persona, setPersona] = useState<Persona | null>(null);
    const [personaImage, setPersonaImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);

    const convertFileToGenerativePart = (file: File): Promise<FileData> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64String = (reader.result as string).split(',')[1];
                if (base64String) {
                    resolve({
                        mimeType: file.type,
                        data: base64String
                    });
                } else {
                    reject(new Error('Failed to read file as base64.'));
                }
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleGenerate = async () => {
        if (files.length === 0) {
            setError("Please upload at least one file.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setPersona(null);
        setPersonaImage(null);

        try {
            // Step 1: Convert files to base64
            setLoadingMessage('Preparing files...');
            const fileData = await Promise.all(
                files.map(file => convertFileToGenerativePart(file))
            );

            // Step 2: Extract text from files
            setLoadingMessage('Analyzing audience data...');
            const extractedText = await extractTextFromFiles(fileData);

            // Step 3: Generate persona details from text
            setLoadingMessage('Creating persona profile...');
            const generatedPersona = await generatePersonaDetails(extractedText);
            setPersona(generatedPersona); // Set persona early to show progress

            // Step 4: Generate persona image
            setLoadingMessage('Generating persona image...');
            const imageUrl = await generatePersonaImage(generatedPersona.imagePrompt);
            setPersonaImage(imageUrl);

        } catch (e: any) {
            console.error(e);
            setError(e.message || 'An unknown error occurred. Please check the console and try again.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    const handleReset = () => {
        setFiles([]);
        setPersona(null);
        setPersonaImage(null);
        setError(null);
        setIsLoading(false);
    }
    
    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center p-4 sm:p-6 lg:p-8 selection:bg-indigo-500 selection:text-white">
             <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
            <div className="w-full max-w-7xl mx-auto z-10 flex-grow flex flex-col justify-center">
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 pb-2">
                        Persona Generator AI
                    </h1>
                    <p className="text-sm text-gray-500">
                        Created by{' '}
                        <a
                                 className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 hover:opacity-80 transition-opacity"
                        >
                            Ajyle AI
                        </a>
                    </p>
                    <p className="text-lg text-gray-400 max-w-3xl mx-auto mt-2">
                        Upload your audience data, and let AI craft a detailed user persona for you.
                    </p>
                </header>

                <main className="w-full">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center space-y-4 h-64">
                            <Spinner />
                            <p className="text-indigo-300 font-medium">{loadingMessage}</p>
                        </div>
                    ) : error ? (
                        <div className="text-center">
                            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative max-w-md mx-auto" role="alert">
                                <strong className="font-bold">Error: </strong>
                                <span className="block sm:inline">{error}</span>
                            </div>
                            <button
                                onClick={handleReset}
                                className="mt-6 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : persona && personaImage ? (
                        <div>
                            <PersonaDisplay persona={persona} personaImage={personaImage} />
                             <div className="text-center mt-8">
                                <button
                                    onClick={handleReset}
                                    className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-300 shadow-lg shadow-indigo-500/20"
                                >
                                    Generate Another Persona
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <FileUpload files={files} onFilesChange={setFiles} disabled={isLoading} />
                            {files.length > 0 && (
                                <div className="text-center">
                                    <button
                                        onClick={handleGenerate}
                                        disabled={isLoading || files.length === 0}
                                        className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                                    >
                                        <SparklesIcon className="w-6 h-6"/>
                                        Generate Persona
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default App;