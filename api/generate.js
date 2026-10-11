import { GoogleGenAI } from '@google/genai';

// Extend Vercel function execution timeout limit so hard math questions don't time out
export const maxDuration = 60;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { difficulty, domain } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Missing GEMINI_API_KEY environment variable.' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Generate a ${difficulty} level Digital SAT Math question focused on${domain || 'Algebra & Advanced Math'}.
    CRITICAL REQUIREMENT: Output strictly in valid JSON format with no markdown blocks (no \`\`\`json) and NO LaTeX symbols (use plain text symbols like ^ for exponents, sqrt() for square roots, x2 instead of x squared formatting).
    JSON structure required:
    {
      "question": "The question text here...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "answer": "A",
      "explanation": "Step by step plain-text explanation..."
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    let textResponse = response.text.trim();
    textResponse = textResponse.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');

    const questionData = JSON.parse(textResponse);
    return res.status(200).json(questionData);

  } catch (error) {
    console.error('Generation error:', error);
    return res.status(500).json({ error: 'Failed to generate question. Please try again.' });
