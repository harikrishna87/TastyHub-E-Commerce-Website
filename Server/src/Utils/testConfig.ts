import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY is missing');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function main() {
  try {
    console.log('Sending structured JSON request (5-6 words constraint) to Gemini API...');
    
    const systemPrompt = `You are Buddy, the witty and creative marketing copywriter for the TastyHub food delivery app.
Your task is to generate a highly engaging, catchy, creative, and witty push notification (like Zomato and Swiggy notifications).

Rules:
- The tone must be extremely witty, casual, food-loving, and engaging.
- Use food emojis effectively in both title and body.
- Reference actual items from the menu, combo deals, restaurant names, or coupon codes provided in the user prompt.
- Keep the title and body extremely engaging, urging the user to tap and order now.
- CRITICAL: The "body" must be extremely short, using only 5 to 6 words maximum. Keep it punchy, creative, and fast to read!

You must output exactly a JSON object matching this schema:
{
  "title": "A short, catchy, emoji-rich notification title (under 50 chars)",
  "body": "A punchy, creative message of exactly 5 to 6 words maximum."
}`;

    const userPrompt = `Generate a push notification for:
Time of Day Slot: lunch (Hour: 12:00 IST)

Here is the current database context:
---
Available Products:
- Butter Paneer Masala: ₹250
- Veg Pizza: ₹300
---
Make it sound like a catchy Zomato/Swiggy alert!`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }]
        }
      ],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.85,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING' },
            body: { type: 'STRING' }
          },
          required: ['title', 'body']
        }
      }
    });

    console.log('✅ Status: OK');
    console.log('✅ Response Text:', JSON.stringify(response.text));
    console.log('✅ Full Response Object:', JSON.stringify(response, null, 2));
  } catch (error) {
    console.error('❌ Error running Gemini test:', error);
  }
}

main();
