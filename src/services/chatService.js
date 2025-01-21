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

export const sendMessage = async (message, chatHistory = [], topic = '') => {
  try {
    const completion = await deepseekClient.chat.completions.create({
      model: 'deepseek-reasoner',
      messages: [
        { 
          role: 'system', 
          content: `Analysiere kritisch nach diesen Regeln:
1. Kontextanalyse: ${chatHistory.length} historische Nachrichten
2. Relevanzgewichtung: 
   - Aktuelle Beiträge auf logische Konsistenz prüfen
3. Bezugspflicht:
   - Mindestens 1 Schriftstelle (Buch/Kapitel/Vers)
   - 1 Bezug zum Diskussionsthema "${topic}"
4. Widerspruchserkennung:
   - Logische Zirkularität markieren
   - Dogmatische Abweichungen kennzeichnen
   - Zeitliche Inkonsistenzen aufzeigen`
        },
        // Historische Nachrichten nach Relevanz sortiert
        ...chatHistory
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
          .map((msg, index) => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: `[Beitrag ${index + 1}] ${msg.author}: ${msg.text} (${new Date(msg.timestamp).toLocaleDateString()})`
          })),
        // Aktuelle Anfrage mit Kontextverknüpfung
        { 
          role: 'user', 
          content: `${message}\n\nKontextverpflichtungen:\n1. Bezug auf Beitrag ${Math.max(1, chatHistory.length - 2)}\n2. Bezug auf Beitrag ${Math.max(1, chatHistory.length - 5)}` 
        }
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
