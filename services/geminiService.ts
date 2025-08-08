import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { FileData, Persona } from '../types';

if (!process.env.VITE_GEMINI_API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY });

const fileToGenerativePart = (file: FileData) => {
    return {
        inlineData: {
            mimeType: file.mimeType,
            data: file.data,
        },
    };
};

/**
 * Analyzes uploaded files and extracts a consolidated text summary.
 */
export async function extractTextFromFiles(files: FileData[]): Promise<string> {
    const textPrompt = {
        text: `Analyze the provided user data from various files (text, documents, images). Synthesize all the information to build a comprehensive profile of the target audience. Consolidate all relevant details—demographics, psychographics, behaviors, goals, challenges, and any other defining characteristics—into a single, coherent block of text. Ignore irrelevant information and focus on creating a unified summary.`
    };

    const fileParts = files.map(fileToGenerativePart);
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [textPrompt, ...fileParts] },
    });

    return response.text;
}


const personaSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Plausible full name for the persona." },
        imagePrompt: { type: Type.STRING, description: "A short, descriptive prompt for an image generator focusing on the persona's appearance. Example: 'photorealistic headshot of a 42-year-old male marketing manager from Brazil, warm smile, wearing a casual shirt'. If no race or ethnicity is specified in the source data, you must choose a diverse representation (e.g., Black, Asian, White, Latino, Middle Eastern, or mixed heritage) for the persona. Do not default to a single race." },
        age: { type: Type.INTEGER, description: "Age of the persona." },
        gender: { type: Type.STRING, description: "Gender of the persona." },
        nationality: { type: Type.STRING, description: "Nationality of the persona." },
        location: { type: Type.STRING, description: "Current city and country of the persona." },
        occupation: { type: Type.STRING, description: "Occupation or job title of the persona." },
        industry: { type: Type.STRING, description: "Industry the persona works in." },
        description: { type: Type.STRING, description: "A detailed paragraph describing the persona's background, personality, and motivations in a simple, casual, and easy-to-read language." },
        goals: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of 3-5 strings representing the persona's primary professional and personal goals."
        },
        interests: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of 3-5 strings representing the persona's key interests, hobbies, and topics or tools they are interested in."
        },
        painPoints: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of 3-5 strings listing the persona's primary pain points and unmet needs."
        },
        techSavviness: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of 3-5 strings describing the persona's tech savviness, preferred platforms, and tools they use."
        },
    },
    required: ["name", "imagePrompt", "age", "gender", "nationality", "location", "occupation", "industry", "description", "goals", "interests", "painPoints", "techSavviness"]
};

/**
 * Generates structured persona data from a text block.
 */
export async function generatePersonaDetails(text: string): Promise<Persona> {
    const prompt = `From the following text summary of a target audience, create a detailed user persona based on the provided JSON schema. Ensure each array (goals, interests, painPoints, techSavviness) contains between 3 and 5 descriptive items.

Text to analyze:
---
${text}
---
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: personaSchema
        },
    });

    try {
        const parsedData = JSON.parse(response.text);
        // The schema should enforce the structure, but a lightweight check is still good practice.
        if (parsedData && typeof parsedData.name === 'string' && Array.isArray(parsedData.painPoints)) {
           return parsedData as Persona;
        } else {
           console.error("Parsed data doesn't match expected structure:", parsedData);
           throw new Error("Parsed JSON does not match Persona structure.");
        }
    } catch (e) {
        console.error("Failed to parse JSON response:", response.text, e);
        throw new Error("The API returned an invalid JSON format. Please try again.");
    }
}


/**
 * Generates an image from a text prompt using Imagen.
 */
export async function generatePersonaImage(prompt: string): Promise<string> {
    const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: `${prompt}, photorealistic, high detail`,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
        throw new Error("Image generation failed to produce an image.");
    }
}