import { GoogleGenAI, Type, Schema } from "@google/genai";

const apiKey = process.env.API_KEY;

const MODEL_NAME = "gemini-2.5-flash";

const ai = new GoogleGenAI({ apiKey: apiKey });

const worldSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    worldName: { type: Type.STRING, description: "Cool name for the RPG world (e.g. Neon Wasteland)" },
    playerColor: { type: Type.STRING, description: "Hex color for the hero" },
    enemyColor: { type: Type.STRING, description: "Hex color for the enemies" },
    groundColor: { type: Type.STRING, description: "Dark Hex color for the ground/terrain" },
    accentColor: { type: Type.STRING, description: "Bright Hex color for world objects (buildings/trees)" },
    enemyName: { type: Type.STRING, description: "Name of the minion enemies" },
    bossName: { type: Type.STRING, description: "Name of the final boss" },
    questDescription: { type: Type.STRING, description: "A short quest objective (e.g. 'Hunt down 10 Cyber-Rats')" },
    npcName: { type: Type.STRING, description: "Name of a friendly NPC guide" },
    npcDialogue: { type: Type.STRING, description: "A helpful or mysterious sentence from the NPC" }
  },
  required: ["worldName", "playerColor", "enemyColor", "groundColor", "accentColor", "enemyName", "bossName", "questDescription", "npcName", "npcDialogue"],
};

export const generateWorldConfig = async (theme: string) => {
  try {
    const prompt = `
      Create a configuration for a Top-Down 2D Action RPG based on the theme: "${theme}".
      The player should be able to explore this world.
      The style should be consistent with the theme (Cyberpunk, Fantasy, Alien, etc.).
      Output JSON.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { text: prompt },
      config: {
        responseMimeType: "application/json",
        responseSchema: worldSchema,
        temperature: 0.8, 
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");

    const data = JSON.parse(jsonText);
    return { ...data, theme };
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback RPG config
    return {
      theme: theme,
      worldName: "Sector 7 Slums",
      playerColor: "#00FF9D", 
      enemyColor: "#FF0055", 
      groundColor: "#111111",
      accentColor: "#00F0FF",
      enemyName: "Rogue Droids",
      bossName: "The Mainframe",
      questDescription: "Destroy 10 Rogue Droids to secure the area.",
      npcName: "Deckard",
      npcDialogue: "Watch your back, the droids are malfunctioning today."
    };
  }
};
