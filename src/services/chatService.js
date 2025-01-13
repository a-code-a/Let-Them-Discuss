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
    const prompt = getPersonaPrompt(figure.id);
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      system: prompt,
      messages: [
        {
          role: 'user',
          content: message
        }
      ]
    });
    
    if (response.content && response.content[0] && response.content[0].text) {
      return response.content[0].text;
    }
    throw new Error('Invalid API response format');
  } catch (error) {
    console.error('Error generating response:', error);
    return 'I apologize, but I am temporarily unable to respond. Please try again later.';
  }
};

export const getFiguresList = () => {
  return [
    { id: 'Socrates', name: 'Socrates', title: 'Philosopher', year: '470-399 BCE' },
    { id: 'Plato', name: 'Plato', title: 'Philosopher', year: '428-348 BCE' },
    { id: 'Aristotle', name: 'Aristotle', title: 'Philosopher', year: '384-322 BCE' },
    { id: 'Hypatia', name: 'Hypatia', title: 'Mathematician & Philosopher', year: 'c. 350/370-415 CE' },
    { id: 'Leonardo-Da-Vinci', name: 'Leonardo da Vinci', title: 'Polymath', year: '1452-1519' },
    { id: 'Galileo-Galilei', name: 'Galileo Galilei', title: 'Astronomer & Physicist', year: '1564-1642' },
    { id: 'Isaac-Newton', name: 'Isaac Newton', title: 'Natural Philosopher', year: '1643-1727' },
    { id: 'Ada-Lovelace', name: 'Ada Lovelace', title: 'Computer Programmer', year: '1815-1852' },
    { id: 'Nikola-Tesla', name: 'Nikola Tesla', title: 'Inventor', year: '1856-1943' },
    { id: 'Marie-Curie', name: 'Marie Curie', title: 'Physicist & Chemist', year: '1867-1934' },
    { id: 'Albert-Einstein', name: 'Albert Einstein', title: 'Theoretical Physicist', year: '1879-1955' },
    { id: 'Grace-Hopper', name: 'Grace Hopper', title: 'Computer Scientist', year: '1906-1992' },
    { id: 'Richard-Feynman', name: 'Richard Feynman', title: 'Theoretical Physicist', year: '1918-1988' }
  ];
};
