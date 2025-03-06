import React, { useState } from 'react';
import { generateResponse } from '../../services/personaService';

const Chat = ({ figure, onStartDiscussion, onStopDiscussion }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDiscussionActive, setIsDiscussionActive] = useState(false);

  const toggleDiscussion = () => {
    if (isDiscussionActive) {
      onStopDiscussion?.();
    } else {
      onStartDiscussion?.();
    }
    setIsDiscussionActive(!isDiscussionActive);
  };

  const handleSendMessage = async () => {
    if (input.trim()) {
      const userMessage = input.trim();
      setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
      setInput('');
      setIsLoading(true);

      try {
        const response = await generateResponse(figure, userMessage);
        setMessages(prev => [...prev, { sender: 'figure', text: response }]);
      } catch (error) {
        console.error('Failed to get response:', error);
        setMessages(prev => [...prev, { 
          sender: 'figure', 
          text: 'I apologize, but I am temporarily unable to respond. Please try again later.' 
        }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat">
      <div className="messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            {message.text}
          </div>
        ))}
        {isLoading && (
          <div className="message figure">
            <span className="typing-indicator">Thinking...</span>
          </div>
        )}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`Ask ${figure.name} something...`}
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading || !input.trim()}
        >
          Send
        </button>
        <button
          className={`discussion-toggle ${isDiscussionActive ? 'active' : ''}`}
          onClick={toggleDiscussion}
        >
          {isDiscussionActive ? 'Diskussion beenden' : 'Diskussion starten'}
        </button>
      </div>
    </div>
  );
};

export default Chat;