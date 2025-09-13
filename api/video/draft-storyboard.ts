import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

const ai = process.env.GOOGLE_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY })
  : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!ai) {
    return res.status(503).json({ error: 'AI service not available' });
  }
  const { concept } = req.body;
  if (!concept) {
    return res.status(400).json({ error: 'Concept is required' });
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are Maya, an AI brand strategist for luxury brands. A user wants to create a short video reel based on the following concept: "${concept}". Your task is to break this concept down into a 3-scene storyboard. For each scene, write a concise, cinematic prompt that an AI video generator can use. Respond in JSON format.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  scene: { type: Type.INTEGER },
                  prompt: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });
    const json = JSON.parse(response.text.trim());
    res.json(json);
  } catch (error) {
    res.status(500).json({ error: 'Failed to draft storyboard' });
  }
}
