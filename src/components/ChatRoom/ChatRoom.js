import React, { useState, useRef, useEffect, useCallback } from 'react';
import { generateResponse, shuffle } from '../../services/personaService';
import ModeratorPanel from '../ModeratorPanel/ModeratorPanel';
import './ChatRoom.css';


const ChatRoom = ({ figures, onRemoveFigure, onAddFigure }) => {
  const messagesContainerRef = useRef(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  // Chat history is maintained in messages state
  // eslint-disable-next-line no-unused-vars
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
        
        // Get drop position relative to figure list
        const container = e.currentTarget.querySelector('.figure-list');
        const rect = container.getBoundingClientRect();
        const dropY = e.clientY - rect.top;
        
        // Find insertion position
        let insertIndex = 0;
        const figureElements = container.querySelectorAll('.active-figure');
        for (let i = 0; i < figureElements.length; i++) {
          const element = figureElements[i];
          const elementRect = element.getBoundingClientRect();
          const elementY = elementRect.top - rect.top + elementRect.height/2;
          
          if (dropY < elementY) {
            insertIndex = i;
            break;
          }
          insertIndex = i + 1;
        }

        onAddFigure({...newFigure, insertIndex});
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
      const fullHistory = messages.map(m => `${m.figure.name}: ${m.text}`).join('\n');
      const context = `${topicContext}Du bist ${currentFigure.name}. Bitte antworte im Kontext dieser gesamten Diskussion:\n\n${fullHistory}\n\nStelle kritische Fragen oder gib Denkanstöße die auf dem oben genannten Inhalt basieren.`;
      
      const response = await generateResponse(currentFigure, context);
      
      
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
        // Normaler Chat-Modus mit vollständigem Verlauf
        const topicContext = topic ? `Aktuelles Diskussionsthema: ${topic}. ` : '';
        const fullHistory = messages.map(m => `${m.figure.name}: ${m.text}`).join('\n');
        const context = `${topicContext}Bitte antworte im Kontext dieser gesamten Diskussion:\n\n${fullHistory}\n\n`;
        const respondingFigures = currentSpeaker ? [currentSpeaker] : figures;
        
        for (const figure of respondingFigures) {
          try {
            const response = await generateResponse(figure, context + message);
            
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

  // WhatsApp-like behavior: Keep scroll at the bottom when new messages are added
  useEffect(() => {
    if (messagesContainerRef.current) {
      // Scroll to bottom of the messages container whenever messages change
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // This effect runs once on component mount to set up the chat container
  useEffect(() => {
    if (messagesContainerRef.current) {
      // Set initial scroll position to bottom
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

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
        <div className="chat-header">
          <div className="chat-header-title">Diskussion</div>
          <button 
            className="refresh-button" 
            onClick={handleRefresh}
            title="Chat löschen"
            disabled={messages.length === 0}
          >
            ↻
          </button>
        </div>

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

        <div className="messages-container" ref={messagesContainerRef}>
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
            className="send-button"
            onClick={handleSendMessage}
            disabled={isLoading || message.trim() === ''}
          >
            {isLoading ? 'Sende...' : 'Senden'}
          </button>
          <button
            className={`discussion-toggle ${isDiscussionActive ? 'active' : ''}`}
            onClick={isDiscussionActive ? stopDiscussion : startDiscussion}
            disabled={figures.length < 2}
          >
            {isDiscussionActive ? 'Diskussion beenden' : 'Diskussion starten'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
