import React, { useState, useRef, useEffect, useCallback } from 'react';
import { generateResponse, shuffle } from '../../services/personaService';
import ModeratorPanel from '../ModeratorPanel/ModeratorPanel';
import './ChatRoom.css';


const ChatRoom = ({ figures, onRemoveFigure, onAddFigure }) => {
  const messagesEndRef = useRef(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
// eslint-disable-next-line no-unused-vars
const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState(null);
  const [topic, setTopic] = useState('');
  const [isDiscussionActive, setIsDiscussionActive] = useState(false);
  const [discussionQueue, setDiscussionQueue] = useState([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

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

  const startDiscussion = () => {
    if (figures.length < 2) return;
    setIsDiscussionActive(true);
    // Erstelle eine zufällige Reihenfolge der Figuren für die erste Runde
    const shuffledFigures = shuffle([...figures]);
    setDiscussionQueue(shuffledFigures);
  };

  const stopDiscussion = () => {
    setIsDiscussionActive(false);
    setDiscussionQueue([]);
    setIsProcessingQueue(false);
  };

const processDiscussionQueue = useCallback(async () => {
    if (!isDiscussionActive || isProcessingQueue || discussionQueue.length === 0) return;

    setIsProcessingQueue(true);
    const currentFigure = discussionQueue[0];
    const newQueue = discussionQueue.slice(1);

    try {
      const topicContext = topic ? `Aktuelles Diskussionsthema: ${topic}. ` : '';
      const context = `${topicContext}Du bist ${currentFigure.name}. Bitte antworte im Kontext der laufenden Diskussion, berücksichtige die vorherigen Nachrichten und stelle kritische Fragen oder gib Denkanstöße.`;
      
      const lastMessage = messages[messages.length - 1];
      const response = await generateResponse(currentFigure, lastMessage.text + "\n\nContext: " + context);
      
      const aiMessage = {
        figure: {
          ...currentFigure,
          image: `/images/${currentFigure.id}.jpg`
        },
        text: response,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setDiscussionQueue([...newQueue, currentFigure]);
      
      setTimeout(() => setIsProcessingQueue(false), 2000);
    } catch (error) {
      console.error(`Error getting response from ${currentFigure.name}:`, error);
      setIsProcessingQueue(false);
    }
  }, [isDiscussionActive, isProcessingQueue, discussionQueue, topic, messages, setMessages, setIsProcessingQueue]);

  const handleSendMessage = async () => {
    if (message.trim() && !isLoading) {
      setIsLoading(true);
      
      // Überprüfe auf Thema-Befehl
      if (message.toLowerCase().startsWith('/thema ')) {
        const newTopic = message.slice(7).trim();
        handleSetTopic(newTopic);
        setMessage('');
        setIsLoading(false);
        return;
      }
      
      const userMessage = {
        figure: { 
          name: 'User',
          image: '/images/default-avatar.svg'
        },
        text: message,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);
      
      if (!isDiscussionActive) {
        // Normaler Chat-Modus
        const topicContext = topic ? `Aktuelles Diskussionsthema: ${topic}. ` : '';
        const context = `${topicContext}Bitte antworte im Kontext der laufenden Diskussion und berücksichtige die vorherigen Nachrichten.`;
        const respondingFigures = currentSpeaker ? [currentSpeaker] : figures;
        
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
      } else if (discussionQueue.length === 0) {
        // Starte die Diskussion mit der ersten Nachricht
        const shuffledFigures = shuffle([...figures]);
        setDiscussionQueue(shuffledFigures);
      }
      
      setMessage('');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isDiscussionActive && !isProcessingQueue && discussionQueue.length > 0) {
      processDiscussionQueue();
    }
  }, [isDiscussionActive, isProcessingQueue, discussionQueue, messages, processDiscussionQueue]);

  useEffect(() => {
    // Scrolle immer zum Ende der Nachrichten
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest' 
      });
    }
  }, [messages]);

  return (
    <div className="chat-room">
      <ModeratorPanel
        selectedFigures={figures}
        onSetTopic={handleSetTopic}
        onSelectSpeaker={handleSelectSpeaker}
        onRemoveParticipant={onRemoveFigure}
        currentSpeaker={currentSpeaker}
        topic={topic}
        isDiscussionActive={isDiscussionActive}
        onStartDiscussion={startDiscussion}
        onStopDiscussion={stopDiscussion}
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
            <div key={index} className="chat-message">
              <div className="message-left">
                <img
                  src={msg.figure.image}
                  alt={msg.figure.name}
                  className={msg.figure.name === 'System' ? 'system-avatar' : 'figure-avatar'}
                />
              </div>
              <div className="message-right">
                <div className="message-header">
                  <span className="figure-name">{msg.figure.name}</span>
                  <span className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="message-text">{msg.text}</div>
              </div>
            </div>
          ))}
          {isLoading && <div className="loading-indicator">Generiere Antworten...</div>}
          <div ref={messagesEndRef} />
        </div>

        <div className="message-input">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={isDiscussionActive ? "Diskussion läuft automatisch..." : "Nachricht eingeben... (/thema für neues Thema)"}
            disabled={isLoading || isDiscussionActive}
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
