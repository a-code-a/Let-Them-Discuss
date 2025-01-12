import Anthropic from '@anthropic-ai/sdk';
import { getPersonaPrompt } from './personaService';

if (!process.env.REACT_APP_ANTHROPIC_API_KEY) {
  throw new Error('Missing REACT_APP_ANTHROPIC_API_KEY environment variable');
}

const anthropic = new Anthropic({
  apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true // Temporary workaround for development
});

export const generateResponse = async (figure, message) => {
  try {
    const prompt = getPersonaPrompt(figure.name);
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `${prompt}\n\nUser: ${message}\nYou (as ${figure.name}):`
        }
      ]
    });
    
    return response.content[0].text;
  } catch (error) {
    console.error('Error generating response:', error);
    return 'I apologize, but I am temporarily unable to respond. Please try again later.';
  }
};

export const getFiguresList = () => {
  return [
    { id: 'Albert Einstein', name: 'Albert Einstein', title: 'Theoretical Physicist', year: '1879-1955' },
    { id: 'Isaac Newton', name: 'Isaac Newton', title: 'Natural Philosopher', year: '1643-1727' },
    { id: 'Galileo Galilei', name: 'Galileo Galilei', title: 'Astronomer & Physicist', year: '1564-1642' },
  ];
};
