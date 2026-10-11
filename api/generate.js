import { GoogleGenAI } from '@google/genai';

// Extend Vercel function timeout to 60 seconds so hard questions never time out
export const maxDuration = 60;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Missing GEMINI_API_KEY environment variable.' });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Directly use gemini-2.0-flash without any looping
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    return res.status(200).json({
      candidates: [
        {
          content: {
            parts: [
              { text: response.text }
            ]
          }
        }
      ]
    });

  } catch (error) {
    console.error('Generation error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate question.' });
