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

  // API-Endpunkt Basis-URL
  const API_BASE_URL = '/api';

  // Alle Chats laden
  const fetchChats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/chats`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setChats(data);
    } catch (err) {
      console.error('Fehler beim Laden der Chats:', err);
      setError(err.message || 'Fehler beim Laden der Chats');
    } finally {
      setLoading(false);
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