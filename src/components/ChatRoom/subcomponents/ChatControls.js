import React from 'react';
import './ChatRoom.css';

const ChatControls = ({ 
  isDiscussionActive, 
  onStartDiscussion, 
  onStopDiscussion, 
  onSendMessage,
  isLoading,
  message,
  setMessage 
}) => {
  return (
    <div className="chat-controls">
      <div className="keyboard-shortcuts">
        Press Enter to send • Shift + Enter for new line
      </div>
      <div className="message-input-container">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          title={isDiscussionActive ? "Share your thoughts or ask questions to guide the discussion" : "Ask a question or share your thoughts"}
          placeholder={isDiscussionActive ? 
            "Share your thoughts with the group..." : 
            "Type your message..."}
          disabled={isLoading}
          className="message-input"
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSendMessage();
            }
          }}
        />
        <button 
          onClick={onSendMessage} 
          disabled={isLoading || !message.trim()}
          className="send-button"
        >
          Send
        </button>
      </div>
      <div className="discussion-controls">
        {!isDiscussionActive ? (
          <button 
            onClick={onStartDiscussion}
            disabled={isLoading}
            className="discussion-button start"
          >
            Start Discussion
          </button>
        ) : (
          <button 
            onClick={onStopDiscussion}
            disabled={isLoading}
            className="discussion-button stop"
          >
            Stop Discussion
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatControls;