import React, { useState } from 'react';
import { generateResponse } from '../../services/chatService';
import ChatMessage from './ChatMessage';
import './ChatRoom.css';
import './discussion-styles.css';

const ChatRoom = ({ figures, onRemoveFigure }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDiscussionActive, setIsDiscussionActive] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const figureId = e.dataTransfer.getData('text/plain');
    if (figureId) {
      onRemoveFigure(figureId);
    }
  };

  const handleFigureDragStart = (e, figure) => {
    e.dataTransfer.setData('text/plain', figure.id);
    e.dataTransfer.effectAllowed = 'move';
    e.target.classList.add('dragging');
  };

  const handleDiscussion = () => {
    setIsDiscussionActive(prev => !prev);
  };

  const handleSendMessage = async () => {
    if (message.trim() && !isLoading) {
      setIsLoading(true);
      const context = isDiscussionActive ? 
        "Please respond in the context of the ongoing discussion, considering the previous messages and other participants' viewpoints." :
        "Please provide your perspective on this message.";
      // Add user message
      const userMessage = {
        figure: { name: 'User' },
        text: message,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);
      
      // Get AI responses from each figure
      for (const figure of figures) {
        try {
          const response = await generateResponse(figure, message + "\n\nContext: " + context);
          const aiMessage = {
            figure,
            text: response,
            timestamp: new Date().toISOString()
          };
          setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
          console.error(`Error getting response from ${figure.name}:`, error);
        }
      }
      setMessage('');
      setIsLoading(false);
    }
  };

  return (
    <div className={`chat-room ${isDiscussionActive ? 'discussion-active' : ''}`}>
      <div
        className={`chat-window ${isDraggingOver ? 'dragging-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="active-figures">
          <h3>Active Figures:</h3>
          <div className="figure-list">
            {figures.map(figure => (
              <div
                key={figure.id}
                className="active-figure"
                draggable
                onDragStart={(e) => handleFigureDragStart(e, figure)}
              >
                <img
                  src={figure.image}
                  alt={figure.name}
                  className="figure-avatar"
                />
                <span>{figure.name}</span>
              </div>
            ))}
          </div>
        </div>
        {isDiscussionActive && (
          <div className="discussion-indicator">
            Discussion Mode Active - Join the conversation! Your insights will help guide the discussion.
          </div>
        )}
        <div className="messages-container">
          {messages.map((msg, index) => (
            <ChatMessage 
              key={index}
              figure={msg.figure}
              text={msg.text}
              timestamp={msg.timestamp}
            />
          ))}
          {isLoading && <div className="loading-indicator">Generating responses...</div>}
        </div>
        <div className="message-input">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            disabled={isLoading}
          />
          <button onClick={handleSendMessage} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send'}
          </button>
          {messages.length > 0 && figures.length > 1 && (
            <button onClick={handleDiscussion} disabled={isLoading}>
              {isLoading ? 'Discussing...' : 'Start Discussion'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
