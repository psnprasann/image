
import { GoogleGenAI, Type } from "@google/genai";
import { SeoMetadata } from '../types';

export const generateImageSeoData = async (base64Image: string): Promise<SeoMetadata> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set API_KEY in your environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Clean the base64 string if it contains the data URL prefix
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|webp);base64,/, "");

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/webp', // We are sending the optimized webp
            data: cleanBase64,
          },
        },
        {
          text: `Analyze this image for SEO purposes. Provide an SEO-friendly filename (using hyphens, ending in .webp), a descriptive alt text (max 120 chars), and 3-5 relevant tags.`,
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          filename: { type: Type.STRING, description: "SEO friendly filename ending in .webp" },
          altText: { type: Type.STRING, description: "Descriptive alt text for accessibility" },
          tags: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of relevant descriptive tags"
          }
        },
        required: ["filename", "altText", "tags"],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from Gemini");
  }

  try {
    return JSON.parse(text) as SeoMetadata;
  } catch (e) {
    console.error("Failed to parse JSON", e);
    throw new Error("Invalid JSON response from AI");
  }
};
