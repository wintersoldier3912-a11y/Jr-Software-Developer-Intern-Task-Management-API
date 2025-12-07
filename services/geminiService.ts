import { GoogleGenAI, Type } from "@google/genai";
import { CreateTaskDTO, TaskPriority, TaskStatus } from "../types";

// NOTE: In a real production app, this call would go through a backend proxy to hide the key.
// For this standalone demo, we use the env variable directly as instructed.
const apiKey = process.env.API_KEY || ''; 
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const geminiService = {
  isEnabled: !!apiKey,

  /**
   * Generates a detailed description and tags based on a short task title.
   */
  enhanceTask: async (title: string): Promise<Partial<CreateTaskDTO>> => {
    if (!ai) throw new Error("AI not configured");

    const prompt = `
      I am creating a task in a task management system. 
      The title is: "${title}".
      Please generate a concise but helpful description for this task, suggest a priority level based on urgency implied, and provide up to 3 relevant tags.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING },
              priority: { type: Type.STRING, enum: [TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH] },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["description", "priority", "tags"]
          }
        }
      });

      const text = response.text;
      if (!text) return {};
      
      return JSON.parse(text) as Partial<CreateTaskDTO>;
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  },

  /**
   * Analyzes a list of tasks and gives a productivity tip.
   */
  getDailyInsight: async (taskTitles: string[]): Promise<string> => {
    if (!ai) return "AI not configured";
    
    if (taskTitles.length === 0) return "You have no tasks yet. Add one to get started!";

    const prompt = `
      Here are my current task titles: ${JSON.stringify(taskTitles)}.
      Give me one short, motivating sentence about how to approach this workload. 
      Be witty but professional.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text || "Keep pushing forward!";
    } catch (e) {
      return "Focus on your highest priority task first.";
    }
  }
};