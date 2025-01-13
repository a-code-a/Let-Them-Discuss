import React, { useState } from 'react';
import { generateResponse } from '../../services/chatService';
import ChatMessage from './ChatMessage';
import ModeratorPanel from '../ModeratorPanel/ModeratorPanel';
import './ChatRoom.css';
import './discussion-styles.css';

const ChatRoom = ({ figures, onRemoveFigure, onAddFigure }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState(null);
  const [topic, setTopic] = useState('');

  const handleRefresh = () => {
    setMessages([]);
    setTopic('');
    setCurrentSpeaker(null);
  };

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
    try {
      const figureData = JSON.parse(e.dataTransfer.getData('application/json'));
      if (figureData && figureData.id && !figures.some(f => f.id === figureData.id)) {
        const newFigure = {
          id: figureData.id,
          name: figureData.name,
          era: figureData.era
        };
        onAddFigure(newFigure);
      }
    } catch (error) {
      console.error('Error parsing dropped data:', error);
    }
  };

  const handleSetTopic = (newTopic) => {
    setTopic(newTopic);
    const systemMessage = {
      figure: { 
        name: 'System',
        image: '/images/system-icon.svg'
      },
      text: `Neues Diskussionsthema: ${newTopic}`,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const handleSelectSpeaker = (figure) => {
    setCurrentSpeaker(figure);
    const systemMessage = {
      figure: { 
        name: 'System',
        image: '/images/system-icon.svg'
      },
      text: `${figure.name} hat das Wort erhalten.`,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const handleSendMessage = async () => {
    if (message.trim() && !isLoading) {
      setIsLoading(true);
      
      const topicContext = topic ? `Aktuelles Diskussionsthema: ${topic}. ` : '';
      const context = `${topicContext}Bitte antworte im Kontext der laufenden Diskussion und berücksichtige die vorherigen Nachrichten.`;

      const respondingFigures = currentSpeaker ? [currentSpeaker] : figures;

      const userMessage = {
        figure: { 
          name: 'User',
          image: '/images/default-avatar.svg'
        },
        text: message,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);
      
      for (const figure of respondingFigures) {
        try {
          const response = await generateResponse(figure, message + "\n\nContext: " + context);
          const aiMessage = {
            figure: {
              ...figure,
              image: `/images/${figure.id}.jpg`
            },
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
    <div className="chat-room">
      <ModeratorPanel
        selectedFigures={figures}
        onSetTopic={handleSetTopic}
        onSelectSpeaker={handleSelectSpeaker}
        onRemoveParticipant={onRemoveFigure}
        currentSpeaker={currentSpeaker}
        topic={topic}
      />
      
      <div
        className={`chat-window ${isDraggingOver ? 'dragging-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="active-figures">
          <h3>Aktive Teilnehmer:</h3>
          <div className="figure-list">
            {figures.map(figure => (
              <div
                key={figure.id}
                className={`active-figure ${currentSpeaker?.id === figure.id ? 'speaking' : ''}`}
              >
                <img
                  src={`/images/${figure.id}.jpg`}
                  alt={figure.name}
                  className="figure-avatar"
                />
                <span>{figure.name}</span>
                <button 
                  className="remove-figure"
                  onClick={() => onRemoveFigure(figure.id)}
                  title="Entfernen"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {topic && (
          <div className="discussion-indicator">
            Aktuelles Thema: {topic}
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
          {isLoading && <div className="loading-indicator">Generiere Antworten...</div>}
        </div>

        <div className="message-input">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Nachricht eingeben..."
            disabled={isLoading}
          />
          <button 
            className="refresh-button" 
            onClick={handleRefresh}
            title="Chat löschen"
            disabled={messages.length === 0}
          >
            ↻
          </button>
          <button onClick={handleSendMessage} disabled={isLoading}>
            {isLoading ? 'Sende...' : 'Senden'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
