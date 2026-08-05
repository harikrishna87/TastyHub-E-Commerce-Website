import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const apiKey = process.env.GEMINI_API_KEY;
console.log('API Key present:', !!apiKey);

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY is missing in env');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function main() {
  try {
    console.log('Sending request to Gemini API (gemini-2.5-flash)...');
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Say hello from TastyBot in a friendly tone!',
    });
    console.log('✅ Response:', response.text);
  } catch (error) {
    console.error('❌ Error running Gemini:', error);
  }
}

main();
