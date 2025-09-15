/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, Type } from "@google/genai";

// Helper function to convert a File object to a Gemini API Part
const fileToPart = async (file: File): Promise<{ inlineData: { mimeType: string; data: string; } }> => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
    
    const arr = dataUrl.split(',');
    if (arr.length < 2) throw new Error("Invalid data URL");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("Could not parse MIME type from data URL");
    
    const mimeType = mimeMatch[1];
    const data = arr[1];
    return { inlineData: { mimeType, data } };
};

// Define the expected JSON structure for the AI's response
const schema = {
  type: Type.OBJECT,
  properties: {
    isFood: { type: Type.BOOLEAN, description: 'True if the image contains edible food or a drink, otherwise false.' },
    dishName: { type: Type.STRING, description: 'The identified name of the dish. If not food, return "Not a food item".' },
    recipe: {
      type: Type.OBJECT,
      properties: {
        ingredients: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'An array of strings for each ingredient.'
        },
        steps: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'An array of strings for each step in the recipe.'
        },
      },
      required: ['ingredients', 'steps']
    },
    nutrition: {
      type: Type.OBJECT,
      properties: {
        calories: { type: Type.STRING, description: 'Approximate calories per serving, as a string (e.g., "450 kcal").' },
        protein: { type: Type.STRING, description: 'Approximate protein per serving, as a string (e.g., "25g").' },
        carbs: { type: Type.STRING, description: 'Approximate carbohydrates per serving, as a string (e.g., "30g").' },
        fat: { type: Type.STRING, description: 'Approximate fat per serving, as a string (e.g., "15g").' },
      },
      required: ['calories', 'protein', 'carbs', 'fat']
    },
    healthierVariation: { type: Type.STRING, description: 'A short suggestion for a healthier version. If not food, return an empty string.' },
    friendlyAdvice: { type: Type.STRING, description: 'If the dish is high-calorie, provide a friendly tip about moderation. Omit if not applicable or not food.' },
  },
  required: ['isFood', 'dishName', 'recipe', 'nutrition', 'healthierVariation']
};

export interface FoodAnalysis {
  isFood: boolean;
  dishName: string;
  recipe: {
    ingredients: string[];
    steps: string[];
  };
  nutrition: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  };
  healthierVariation: string;
  friendlyAdvice?: string;
}

/**
 * Analyzes a food image to identify the dish and provide recipe, nutrition, and health tips.
 * @param imageFile The image of the food to analyze.
 * @returns A promise that resolves to a structured `FoodAnalysis` object.
 */
export const analyzeFoodImage = async (imageFile: File): Promise<FoodAnalysis> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const imagePart = await fileToPart(imageFile);

    const prompt = `You are FoodSnap Tutor, an expert AI chef and nutritionist. Your task is to analyze the user-provided image.

    1. First, determine if the image contains edible food or a drink. Set the 'isFood' property accordingly.
    
    2. If 'isFood' is false, set 'dishName' to "Not a food item" and provide empty or default values for the other fields to satisfy the schema.
    
    3. If 'isFood' is true, proceed with the full analysis:
        a. Identify the most likely dish name. If you are unsure, suggest the top 2-3 possible dishes (e.g., "Spaghetti Carbonara or possibly Cacio e Pepe").
        b. Provide a clear, step-by-step recipe.
        c. Include approximate nutritional information per serving.
        d. Suggest at least one healthier variation.
        e. If the dish is generally considered high in fat, sugar, or calories, add a friendly, non-judgmental suggestion about enjoying it in moderation in the 'friendlyAdvice' field. Otherwise, omit this field.

    Return the information in a valid JSON object that adheres to the provided schema. Do not add any text or explanations outside of the JSON object.`;

    const textPart = { text: prompt };

    console.log('Sending image to the model for analysis...');
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        },
    });
    console.log('Received response from model.', response);
    
    if (response.promptFeedback?.blockReason) {
        throw new Error(`Request was blocked due to: ${response.promptFeedback.blockReason}. This may be due to safety settings.`);
    }

    const jsonText = response.text.trim();
    try {
        const parsedJson = JSON.parse(jsonText);
        return parsedJson as FoodAnalysis;
    } catch (e) {
        console.error("Failed to parse JSON response:", jsonText, e);
        throw new Error("The AI returned an invalid response. Please try again with a clearer image.");
    }
};