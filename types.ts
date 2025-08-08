export interface Persona {
  name: string;
  imagePrompt: string;
  age: number;
  gender: string;
  nationality: string;
  location: string;
  occupation: string;
  industry: string;
  description: string;
  goals: string[];
  interests: string[];
  painPoints: string[];
  techSavviness: string[];
}

export interface FileData {
  mimeType: string;
  data: string; // base64 encoded string
}