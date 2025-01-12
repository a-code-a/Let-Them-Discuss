import React from 'react';
import './ChatRoom.css';

const ChatMessage = ({ figure, text, timestamp }) => {
  return (
    <div className="chat-message">
      <div className="message-header">
        <img 
          src={figure.image} 
          alt={figure.name} 
          className="figure-avatar"
        />
        <div className="message-info">
          <span className="figure-name">{figure.name}</span>
          <span className="message-time">
            {new Date(timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>
      <div className="message-text">{text}</div>
    </div>
  );
};

export default ChatMessage;
