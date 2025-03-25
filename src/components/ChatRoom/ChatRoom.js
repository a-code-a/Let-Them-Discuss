import React, { useState, useRef, useEffect, useCallback } from 'react';
import { generateResponse, shuffle } from '../../services/personaService';
import { useChat } from '../../context/ChatContext';
import FigureSelection from '../FigureSelection/FigureSelection';
import './ChatRoom.css';


const ChatRoom = ({ figures, onAddFigure, onRemoveFigure }) => {
  // Chat-Kontext für die Persistenz
  const {
    currentChat,
    createChat,
    addMessageToChat,
    updateChat
  } = useChat();
  const messagesContainerRef = useRef(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [isLoading, setIsLoading] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState(null);
  const [topic, setTopic] = useState('');
  const [isDiscussionActive, setIsDiscussionActive] = useState(false);
  const [discussionQueue, setDiscussionQueue] = useState([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);

  // Initialisieren eines neuen Chats
  const handleRefresh = () => {
    setMessages([]);
    setTopic('');
    setCurrentSpeaker(null);
    setActiveChatId(null);
    
    // Neuen Chat in der Datenbank erstellen, wenn Figuren vorhanden sind
    if (figures.length > 0) {
      createNewChat();
    }
  };

  // Erstellen eines neuen Chats in der Datenbank
  const createNewChat = async () => {
    try {
      const newChat = await createChat({
        title: topic || 'Neues Gespräch',
        figures: figures.map(f => ({ id: f.id, name: f.name })),
        messages: []
      });
      
      if (newChat && newChat._id) {
        setActiveChatId(newChat._id);
      }
    } catch (error) {
      console.error('Fehler beim Erstellen eines neuen Chats:', error);
    }
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

  const handleSetTopic = async (newTopic) => {
    setTopic(newTopic);
    const systemMessage = {
      figure: {
        id: 'system',
        name: 'System',
        image: '/images/system-icon.svg'
      },
      text: `Neues Diskussionsthema: ${newTopic}`,
      timestamp: new Date().toISOString()
    };
    
    // Aktualisieren der lokalen Nachrichten
    setMessages(prev => [...prev, systemMessage]);
    
    // Aktualisieren des Chat-Titels in der Datenbank, wenn ein aktiver Chat vorhanden ist
    if (activeChatId) {
      await updateChat(activeChatId, { title: newTopic });
      await addMessageToChat(activeChatId, systemMessage);
    } else {
      // Erstellen eines neuen Chats, wenn keiner aktiv ist
      const newChat = await createChat({
        title: newTopic,
        figures: figures.map(f => ({ id: f.id, name: f.name })),
        messages: [systemMessage]
      });
      
      if (newChat && newChat._id) {
        setActiveChatId(newChat._id);
      }
    }
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
      // Speichere Nachricht lokal
      setMessages(prev => [...prev, aiMessage]);
      setDiscussionQueue([...newQueue, currentFigure]);
      
      // Speichere die Nachricht in der Datenbank, wenn ein aktiver Chat existiert
      if (activeChatId) {
        console.log('Speichere Diskussions-Antwort im Chat ID:', activeChatId);
        
        // Stelle sicher, dass die Figurendaten das erwartete Format haben
        const cleanedMessage = {
          figure: {
            id: currentFigure.id,
            name: currentFigure.name,
            image: `/images/${currentFigure.id}.jpg`
          },
          text: response,
          timestamp: new Date().toISOString()
        };
        
        try {
          // Direkte Fetch-API verwenden für zuverlässigere Speicherung
          console.log('Speichere Diskussionsantwort direkt mit Fetch...');
          const saveResponse = await fetch(`/api/chats/${activeChatId}/messages`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(cleanedMessage),
          });
          
          if (!saveResponse.ok) {
            throw new Error(`HTTP error! Status: ${saveResponse.status}`);
          }
          
          console.log('Diskussionsantwort erfolgreich gespeichert');
        } catch (saveError) {
          console.error('Fehler beim Speichern der Diskussions-Antwort:', saveError);
        }
      }
      
      setTimeout(() => setIsProcessingQueue(false), 2000);
    } catch (error) {
      console.error(`Error getting response from ${currentFigure.name}:`, error);
      setIsProcessingQueue(false);
    }
  }, [isDiscussionActive, isProcessingQueue, discussionQueue, topic, messages, setMessages, setIsProcessingQueue, activeChatId]);

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
      
      // Chat-ID für diese Konversation sicherstellen
      let chatIdToUse = activeChatId;
      
      // Benutzernachricht vorbereiten
      const userMessage = {
        figure: {
          id: 'user',
          name: 'User',
          image: '/images/default-avatar.svg'
        },
        text: message,
        timestamp: new Date().toISOString()
      };
      
      // Nachricht in UI anzeigen
      setMessages(prev => [...prev, userMessage]);
      
      // Wenn kein aktiver Chat existiert, erstelle einen neuen
      if (!chatIdToUse && figures.length > 0) {
        try {
          const newChat = await createChat({
            title: topic || 'Neues Gespräch',
            figures: figures.map(f => ({ id: f.id, name: f.name })),
            messages: [userMessage] // Benutzernachricht direkt beim Erstellen hinzufügen
          });
          
          if (newChat && newChat._id) {
            chatIdToUse = newChat._id;
            setActiveChatId(newChat._id);
            console.log('Neuer Chat erstellt mit ID:', chatIdToUse);
          }
        } catch (error) {
          console.error('Fehler beim Erstellen eines neuen Chats:', error);
        }
      } else if (chatIdToUse) {
        // Füge die Nachricht zum bestehenden Chat hinzu - direkt mit Fetch API
        try {
          const saveResponse = await fetch(`/api/chats/${chatIdToUse}/messages`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userMessage),
          });
          
          if (!saveResponse.ok) {
            throw new Error(`HTTP error! Status: ${saveResponse.status}`);
          }
          
          console.log('Benutzernachricht erfolgreich gespeichert');
        } catch (saveError) {
          console.error('Fehler beim Speichern der Benutzernachricht:', saveError);
        }
      }
      
      if (!isDiscussionActive) {
        // Normaler Chat-Modus mit vollständigem Verlauf
        const topicContext = topic ? `Aktuelles Diskussionsthema: ${topic}. ` : '';
        const fullHistory = messages
          .filter(m => m && m.figure && m.text) // Null-Checks hinzufügen
          .map(m => `${m.figure.name}: ${m.text}`)
          .join('\n');
        const context = `${topicContext}Bitte antworte im Kontext dieser gesamten Diskussion:\n\n${fullHistory}\n\n`;
        const respondingFigures = currentSpeaker ? [currentSpeaker] : figures;
        
        // Generiere Antworten nacheinander
        for (const figure of respondingFigures) {
          try {
            console.log(`Generiere Antwort von ${figure.name}...`);
            const response = await generateResponse(figure, context + message);
            console.log(`Antwort von ${figure.name} generiert:`, response.substring(0, 50) + '...');
            
            // Jede AI-Nachricht einzeln speichern
            const aiMessageData = {
              figure: {
                id: figure.id,
                name: figure.name,
                image: `/images/${figure.id}.jpg`
              },
              text: response,
              timestamp: new Date().toISOString()
            };
            
            // Nachricht zur lokalen Anzeige hinzufügen
            setMessages(prev => [...prev, aiMessageData]);
            
            // Direkt einzeln in Datenbank speichern (nicht sammeln)
            if (chatIdToUse) {
              try {
                console.log(`Speichere Antwort von ${figure.name} direkt...`);
                
                // Direkte Fetch-API verwenden (keine abstrahierte Funktion)
                const saveResponse = await fetch(`/api/chats/${chatIdToUse}/messages`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ message: aiMessageData }),
                });
                
                if (!saveResponse.ok) {
                  throw new Error(`HTTP error! Status: ${saveResponse.status}`);
                }
                
                console.log(`Antwort von ${figure.name} erfolgreich gespeichert.`);
              } catch (saveError) {
                console.error(`Fehler beim Speichern der Antwort von ${figure.name}:`, saveError);
              }
            }
          } catch (error) {
            console.error(`Fehler beim Generieren der Antwort von ${figure.name}:`, error);
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

  // Laden eines Chats, wenn currentChat sich ändert
  useEffect(() => {
    if (currentChat) {
      // Chat-ID setzen
      setActiveChatId(currentChat._id);
      
      // Nachrichten laden
      if (currentChat.messages) {
        // Filtere ungültige Nachrichten heraus
        const validMessages = currentChat.messages.filter(m => m && m.figure && m.text);
        setMessages(validMessages);
      } else {
        setMessages([]);
      }
      
      // Thema setzen (aus dem Titel)
      if (currentChat.title && currentChat.title !== 'Neues Gespräch') {
        setTopic(currentChat.title);
      } else {
        setTopic('');
      }
      
      // Diskussion zurücksetzen
      setIsDiscussionActive(false);
      setDiscussionQueue([]);
      setIsProcessingQueue(false);
    }
  }, [currentChat]);

  return (
    <div className="chat-room">
      <FigureSelection
        onSelectFigure={onAddFigure}
        selectedFigures={figures}
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
                  title="Entfernen"
                  onClick={() => onRemoveFigure(figure.id)}
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
          {messages.map((msg, index) => {
            // Überprüfen, ob die Nachricht null oder undefined ist
            if (!msg || !msg.figure) {
              // Rendern einer Platzhalternachricht
              return (
                <div key={index} className="chat-message system-message">
                  <div className="message-text">
                    Diese Nachricht konnte nicht geladen werden.
                  </div>
                </div>
              );
            }

            // Rendern der normalen Nachricht
            return (
              <div key={index} className="chat-message">
                <div className="message-left">
                  <img
                    src={msg.figure.image || '/images/default-avatar.svg'}
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
            );
          })}
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
