import React, { createContext, useState, useContext, useCallback } from 'react';

// ChatContext erstellen
const ChatContext = createContext();

// Custom hook zum Verwenden des ChatContext
export const useChat = () => useContext(ChatContext);

// ChatProvider Komponente
export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false); // State to track retries

  // API-Endpunkt Basis-URL
  const API_BASE_URL = '/api';

  // Sleep/Delay Funktion für Retries
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Alle Chats laden
  const fetchChats = useCallback(async (retryCount = 0, maxRetries = 3) => {
    if (retryCount === 0) {
      setLoading(true);
      setError(null);
      // Reset retry state only on the initial call
      if (retryCount === 0) {
        setIsRetrying(false);
      }
    }

    try {
      // Directly fetch chats, remove initial status check for faster loading
      const response = await fetch(`${API_BASE_URL}/chats`);
      
      // Check if we got HTML instead of JSON (common error when Netlify returns an error page)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        throw new Error('Erhielt HTML statt JSON. Der Server hat möglicherweise ein Problem.');
      }
      
      if (!response.ok) {
        // Handle 503 Service Unavailable (likely MongoDB connection issue)
        if (response.status === 503 && retryCount < maxRetries) {
          const errorText = await response.text();
          let errorJson;
          let retryAfter = 0;
          let isServerless = false;
          
          try {
            // Try to parse as JSON to get structured error
            errorJson = JSON.parse(errorText);
            
            // Check if this is a serverless function and get the retry_after value
            isServerless = errorJson.is_serverless === true;
            retryAfter = errorJson.retry_after || 0;
            
            console.log(
              `Datenbank nicht verfügbar, Versuch ${retryCount + 1} von ${maxRetries + 1}. ` +
              `Status: ${errorJson.readyState || 'unbekannt'}` +
              (isServerless ? ' (Serverless)' : '')
            );
          } catch (e) {
            // If not JSON, just use default values
            console.log(`Datenbank nicht verfügbar, Versuch ${retryCount + 1} von ${maxRetries + 1}`);
          }
          
          // Calculate delay - either use retry_after or exponential backoff
          // For serverless environments, respect the retry_after value if provided
          const defaultDelay = Math.pow(2, retryCount) * 1000;
          const delay = retryAfter > 0 ? retryAfter * 1000 : defaultDelay;

          // Indicate that we are now in a retry state
          setIsRetrying(true);
          
          // Wait with appropriate delay
          await sleep(delay);
          
          // Special case for serverless and connecting state - use longer retries
          if (isServerless || (errorJson && errorJson.readyState === 2)) {
            // If we're in a serverless environment or connecting state,
            // let's be more patient with retries
            return fetchChats(retryCount + 1, 5); // More retries for serverless
          }
          
          // Standard retry
          return fetchChats(retryCount + 1, maxRetries);
        }
        
        const errorText = await response.text();
        let errorMessage;
        let errorDetails = null;
        
        try {
          // Try to parse as JSON to get structured error
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || `HTTP error! Status: ${response.status}`;
          
          // Better user messages for different connection states
          if (response.status === 503) {
            if (errorJson.readyState === 2) {
              errorMessage = 'Datenbankverbindung wird hergestellt. Bitte versuchen Sie es in einigen Sekunden erneut.';
              
              // Trigger an auto-retry in 5 seconds for connecting state
              setTimeout(() => {
                console.log('Auto-Retry nach 5 Sekunden für Connecting-Status');
                fetchChats();
              }, 5000);
            } else if (errorJson.is_serverless) {
              errorMessage = 'Der Server ist gerade im Aufwachprozess. Bitte aktualisieren Sie in einigen Sekunden.';
            }
          }
        } catch (e) {
          // If not JSON, use plain text with truncation for very long HTML responses
          errorMessage = errorText.length > 150 ?
            `${errorText.substring(0, 150)}... (Error ${response.status})` :
            errorText;
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      setChats(data);
    } catch (err) {
      console.error('Fehler beim Laden der Chats:', err);
      setError(err.message || 'Fehler beim Laden der Chats');
    } finally {
      // Stop loading and reset retry state only when definitively finished
      if (retryCount === 0 || retryCount >= maxRetries || error) {
        setLoading(false);
        setIsRetrying(false);
      }
    }
  }, []);

  // Einzelnen Chat laden
  const fetchChat = useCallback(async (chatId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/chats/${chatId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setCurrentChat(data);
      return data;
    } catch (err) {
      console.error(`Fehler beim Laden des Chats mit ID ${chatId}:`, err);
      setError(err.message || 'Fehler beim Laden des Chats');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Neuen Chat erstellen
  const createChat = useCallback(async (chatData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const newChat = await response.json();
      setChats(prevChats => [...prevChats, newChat]);
      setCurrentChat(newChat);
      return newChat;
    } catch (err) {
      console.error('Fehler beim Erstellen des Chats:', err);
      setError(err.message || 'Fehler beim Erstellen des Chats');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Chat aktualisieren
  const updateChat = useCallback(async (chatId, updates) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const updatedChat = await response.json();
      
      // Aktualisieren der Chats-Liste
      setChats(prevChats => 
        prevChats.map(chat => 
          chat._id === chatId ? updatedChat : chat
        )
      );
      
      // Aktualisieren des currentChat, wenn es der aktuelle Chat ist
      if (currentChat && currentChat._id === chatId) {
        setCurrentChat(updatedChat);
      }
      
      return updatedChat;
    } catch (err) {
      console.error(`Fehler beim Aktualisieren des Chats mit ID ${chatId}:`, err);
      setError(err.message || 'Fehler beim Aktualisieren des Chats');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentChat]);

  // Chat löschen
  const deleteChat = useCallback(async (chatId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Chat aus der Liste entfernen
      setChats(prevChats => prevChats.filter(chat => chat._id !== chatId));
      
      // Wenn der gelöschte Chat der aktuelle Chat war, current Chat zurücksetzen
      if (currentChat && currentChat._id === chatId) {
        setCurrentChat(null);
      }
      
      return true;
    } catch (err) {
      console.error(`Fehler beim Löschen des Chats mit ID ${chatId}:`, err);
      setError(err.message || 'Fehler beim Löschen des Chats');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentChat]);

  // Nachricht zu einem Chat hinzufügen
  const addMessageToChat = useCallback(async (chatId, message) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
      
      if (!response.ok) {
        // Check for non-JSON success response (e.g., 204 No Content)
        if (response.status === 204) {
          console.log('Message added successfully (204 No Content)');
        } else if (response.headers.get('content-type')?.includes('application/json')) {
          // Process JSON response if available (might contain updated chat metadata)
          const updatedChatMetadata = await response.json();
          // Update chat list metadata (e.g., last message time) if needed
          setChats(prevChats =>
            prevChats.map(chat =>
              chat._id === chatId ? { ...chat, ...updatedChatMetadata } : chat // Merge metadata
            )
          );
        } else {
          // Handle unexpected success response
          console.warn('Message added, but received unexpected response format:', await response.text());
        }

        // Optimistic UI Update: Add message locally
        if (currentChat && currentChat._id === chatId) {
          setCurrentChat(prev => {
            // Ensure messages array exists and is an array
            const existingMessages = Array.isArray(prev.messages) ? prev.messages : [];
            return {
              ...prev,
              messages: [...existingMessages, message] // Append the new message
            };
          });
        }
        // Also update the message list in the main chats array for consistency in sidebar previews
        setChats(prevChats =>
          prevChats.map(chat =>
            chat._id === chatId ? {
              ...chat,
              // Optionally update last message preview here if needed
              // messages: [...(Array.isArray(chat.messages) ? chat.messages : []), message] // Less efficient for list view
            } : chat
          )
        );

      } // End of response.ok check

      return true; // Indicate success, even without returning full chat
    } catch (err) {
      console.error(`Fehler beim Hinzufügen einer Nachricht zum Chat mit ID ${chatId}:`, err);
      setError(err.message || 'Fehler beim Hinzufügen der Nachricht');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentChat]);

  // Wert des Provider
  const contextValue = {
    chats,
    currentChat,
    loading,
    error,
    isRetrying, // Expose retry state
    fetchChats,
    fetchChat,
    createChat,
    updateChat,
    deleteChat,
    addMessageToChat,
    setCurrentChat
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};