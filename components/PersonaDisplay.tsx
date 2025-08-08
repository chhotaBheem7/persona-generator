import React, { useState } from 'react';
import { Persona } from '../types';
import { SparklesIcon, CopyIcon, DownloadIcon, ChatBubbleIcon, DescriptionIcon, GoalsIcon, InterestsIcon, PainPointsIcon, TechSavvyIcon } from './Icon';

interface PersonaDisplayProps {
    persona: Persona;
    personaImage: string;
}

const InfoItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-semibold text-indigo-300">{label}</p>
        <p className="text-lg text-gray-200">{value}</p>
    </div>
);

const DetailCard: React.FC<{ title: string; icon: React.ReactNode; items: string[] }> = ({ title, icon, items }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-gray-700 h-full">
        <h3 className="text-xl font-bold text-indigo-400 mb-4 flex items-center gap-3">
            {icon}
            {title}
        </h3>
        <ul className="space-y-2 list-disc list-outside text-gray-300 pl-5">
            {items.map((item, index) => <li key={index} className="pl-2">{item}</li>)}
        </ul>
    </div>
);

const PersonaDisplay: React.FC<PersonaDisplayProps> = ({ persona, personaImage }) => {
    const [isCopied, setIsCopied] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isCreatingChat, setIsCreatingChat] = useState(false);

    const handleCopy = () => {
        const personaText = `
### Persona Details
---
- **Name**: ${persona.name}
- **Age**: ${persona.age}
- **Gender**: ${persona.gender}
- **Nationality**: ${persona.nationality}
- **Location**: ${persona.location}
- **Occupation**: ${persona.occupation}
- **Industry**: ${persona.industry}

### Description
---
${persona.description}

### Goals
---
- ${persona.goals.join('\n- ')}

### Interests
---
- ${persona.interests.join('\n- ')}

### Pain Points
---
- ${persona.painPoints.join('\n- ')}

### Tech Savviness
---
- ${persona.techSavviness.join('\n- ')}
        `.trim();

        navigator.clipboard.writeText(personaText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
    };

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF('p', 'pt', 'a4');
            const docWidth = doc.internal.pageSize.getWidth();
            const margin = 40;
            let currentY = margin;

            const checkPageBreak = (heightNeeded: number = 0) => {
                if (currentY + heightNeeded > doc.internal.pageSize.getHeight() - margin) {
                    doc.addPage();
                    currentY = margin;
                }
            };
            
            const addSectionTitle = (title: string) => {
                checkPageBreak(40);
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text(title, margin, currentY);
                currentY += 15;
                doc.setDrawColor(200, 200, 200);
                doc.line(margin, currentY, docWidth - margin, currentY);
                currentY += 15;
            };

            const addText = (text: string) => {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                const splitText = doc.splitTextToSize(text, docWidth - margin * 2);
                checkPageBreak(doc.getTextDimensions(splitText).h);
                doc.text(splitText, margin, currentY);
                currentY += doc.getTextDimensions(splitText).h + 10;
            };

            const addList = (items: string[]) => {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                items.forEach(item => {
                    const fullText = `•  ${item}`;
                    const splitText = doc.splitTextToSize(fullText, docWidth - margin * 2 - 15);
                    checkPageBreak(doc.getTextDimensions(splitText).h);
                    doc.text(splitText, margin + 8, currentY);
                    currentY += doc.getTextDimensions(splitText).h + 5;
                });
                currentY += 10;
            };

            // --- Build PDF Document ---
            doc.addImage(personaImage, 'JPEG', margin, currentY, 80, 80);
            doc.setFontSize(28);
            doc.setFont('helvetica', 'bold');
            doc.text(persona.name, margin + 100, currentY + 45, { baseline: 'top' });
            currentY += 100;

            const addInfoItem = (label: string, value: string | number) => {
                checkPageBreak(20);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.text(`${label}:`, margin, currentY);
                doc.setFont('helvetica', 'normal');
                doc.text(String(value), margin + 80, currentY);
                currentY += 20;
            };
            
            addInfoItem('Age', persona.age);
            addInfoItem('Gender', persona.gender);
            addInfoItem('Nationality', persona.nationality);
            addInfoItem('Location', persona.location);
            addInfoItem('Occupation', persona.occupation);
            addInfoItem('Industry', persona.industry);
            currentY += 10;

            addSectionTitle('Persona Description');
            addText(persona.description);
            
            addSectionTitle('Goals');
            addList(persona.goals);

            addSectionTitle('Interests');
            addList(persona.interests);

            addSectionTitle('Pain Points');
            addList(persona.painPoints);

            addSectionTitle('Tech Savviness');
            addList(persona.techSavviness);

            doc.save(`${persona.name.replace(/\s/g, '_')}_Persona.pdf`);
        } catch (error) {
            console.error("Failed to generate PDF:", error);
        } finally {
            setIsDownloading(false);
        }
    };
    
    const handleCreateChat = () => {
        // The final URL for the Chatterbots app, as provided.
        const CHATTERBOTS_APP_URL = 'https://aistudio.google.com/app/u/0/apps/bundled/chatterbots?showPreview=true';
    
        setIsCreatingChat(true);
        try {
            // 1. Stringify the JSON object
            const personaJsonString = JSON.stringify(persona);
            
            // 2. Base64-encode the string (btoa is a standard browser function)
            const base64Encoded = btoa(personaJsonString);
            
            // 3. URI-encode the Base64 string to make it safe for a URL
            const uriEncoded = encodeURIComponent(base64Encoded);

            // 4. Construct the final URL. To avoid conflicts with existing parameters 
            // in the base URL (like ?showPreview=true), we strip them and append only
            // the essential personaData parameter.
            const baseUrl = CHATTERBOTS_APP_URL.split('?')[0];
            const finalUrl = `${baseUrl}?personaData=${uriEncoded}`;
            
            // 5. Open the URL in a new tab
            window.open(finalUrl, '_blank', 'noopener,noreferrer');
    
        } catch (error: any) {
            console.error("Failed to construct the chat URL:", error);
            alert(`Could not prepare data for the Chatterbot app: ${error.message}`);
        } finally {
            // The process is very fast, but this provides feedback and prevents
            // the button from getting stuck in a loading state.
            setIsCreatingChat(false);
        }
    };


    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in space-y-8">
            {/* Card 1: Persona ID */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-gray-700">
                <div className="md:flex">
                    <div className="md:flex-shrink-0">
                        <img className="h-full w-full object-cover md:w-64" src={personaImage} alt="Generated Persona" />
                    </div>
                    <div className="p-8 flex-grow">
                        <div className="flex justify-between items-start">
                            <div className="uppercase tracking-wide text-sm text-indigo-400 font-semibold flex items-center gap-2">
                               <SparklesIcon className="w-5 h-5" /> Persona ID
                            </div>
                            <div className="flex items-center flex-wrap gap-3">
                                <button
                                    onClick={handleCreateChat}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isCopied || isDownloading || isCreatingChat}
                                >
                                    {isCreatingChat ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Connecting...
                                        </>
                                    ) : (
                                        <>
                                            <ChatBubbleIcon className="w-4 h-4" />
                                            Chat with Persona
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-gray-700/50 text-gray-300 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
                                    disabled={isCopied || isDownloading || isCreatingChat}
                                >
                                    {isCopied ? (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <CopyIcon className="w-4 h-4" />
                                            Copy Persona
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-gray-700/50 text-gray-300 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
                                    disabled={isDownloading || isCreatingChat}
                                >
                                    {isDownloading ? (
                                         <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Downloading...
                                        </>
                                    ) : (
                                        <>
                                            <DownloadIcon className="w-4 h-4" />
                                            Download PDF
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <h2 className="mt-2 text-3xl font-bold text-white tracking-tight">{persona.name}</h2>
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-6">
                            <InfoItem label="Age" value={persona.age} />
                            <InfoItem label="Gender" value={persona.gender} />
                            <InfoItem label="Nationality" value={persona.nationality} />
                            <InfoItem label="Location" value={persona.location} />
                            <InfoItem label="Occupation" value={persona.occupation} />
                            <InfoItem label="Industry" value={persona.industry} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Card 2: Description */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-gray-700">
                <h3 className="text-xl font-bold text-indigo-400 mb-4 flex items-center gap-3">
                    <DescriptionIcon className="w-6 h-6" />
                    Persona Description
                </h3>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{persona.description}</p>
            </div>

            {/* Card 3: Details Grid */}
            <div className="grid md:grid-cols-2 gap-8">
                <DetailCard title="Goals" icon={<GoalsIcon className="w-6 h-6" />} items={persona.goals} />
                <DetailCard title="Interests" icon={<InterestsIcon className="w-6 h-6" />} items={persona.interests} />
                <DetailCard title="Pain Points" icon={<PainPointsIcon className="w-6 h-6" />} items={persona.painPoints} />
                <DetailCard title="Tech Savviness" icon={<TechSavvyIcon className="w-6 h-6" />} items={persona.techSavviness} />
            </div>
        </div>
    );
};

export default PersonaDisplay;