import { OpenAI } from 'openai';
import 'dotenv/config';

// DeepSeek Client mit erweiterten Einstellungen
const deepseekClient = new OpenAI({
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: process.env.DEEPSEEK_API_KEY,
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept-Charset': 'utf-8'
  },
  fetch: async (url, options) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      }
    });
    return response;
  }
});

export const sendMessage = async (message) => {
  try {
    const completion = await deepseekClient.chat.completions.create({
      model: 'deepseek-reasoner',
      messages: [
        { 
          role: 'system', 
          content: 'Du bist ein historischer Experte mit Fachwissen aus erster Hand'
        },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 500,
      stream: false
    });

    console.log('API Response Data:', completion);

    return {
      status: 'success',
      message: completion.choices[0].message.content
    };
  } catch (error) {
    console.error('API Fehlerdetails:', {
      statusCode: error.status,
      errorMessage: error.message,
      responseData: error.response?.data
    });
    return { 
      status: 'error',
      message: 'Konnte Antwort nicht generieren',
      details: error.response?.data?.message || error.message
    };
  }
};

export const getChatHistory = async () => {
  // Implementierung folgt
  return [];
};
