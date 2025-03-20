import React, { useState, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import ChatListItem from './ChatListItem';
import './ChatSidebar.css';

const ChatSidebar = () => {
  const { 
    chats, 
    currentChat, 
    loading, 
    error, 
    fetchChats, 
    createChat, 
    setCurrentChat,
    fetchChat
  } = useChat();
  
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Chats bei Komponenteninitialisierung laden
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Erstellen eines neuen Chats
  const handleNewChat = async () => {
    const newChat = await createChat({
      title: 'Neues Gespräch',
      figures: [],
      messages: []
    });
    
    if (newChat) {
      setCurrentChat(newChat);
      setIsMobileOpen(false); // Mobile Sidebar schließen, wenn ein neuer Chat erstellt wird
    }
  };

  // Chat auswählen
  const handleSelectChat = async (chat) => {
    // Vollständige Chat-Details laden
    await fetchChat(chat._id);
    setIsMobileOpen(false); // Mobile Sidebar schließen, wenn ein Chat ausgewählt wird
  };

  // Seitenleiste auf Mobilgeräten umschalten
  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Mobiler Toggle-Button (nur auf kleinen Bildschirmen sichtbar) */}
      <button 
        className="sidebar-toggle" 
        onClick={toggleMobileSidebar}
        aria-label="Chatübersicht öffnen"
      >
        ☰
      </button>
      
      {/* Haupt-Sidebar */}
      <div className={`chat-sidebar ${isMobileOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Gespräche</h2>
          <button 
            className="new-chat-button" 
            onClick={handleNewChat}
            aria-label="Neues Gespräch"
          >
            Neu
          </button>
        </div>
        
        {loading ? (
          <div className="empty-state">
            <p>Lädt Gespräche...</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <p>Fehler beim Laden der Gespräche</p>
            <button onClick={fetchChats}>Erneut versuchen</button>
          </div>
        ) : chats.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💬</div>
            <p>Keine Gespräche gefunden</p>
            <p>Starten Sie ein neues Gespräch mit dem "Neu"-Button</p>
          </div>
        ) : (
          <ul className="chat-list">
            {chats.map(chat => (
              <ChatListItem 
                key={chat._id}
                chat={chat}
                isActive={currentChat && currentChat._id === chat._id}
                onClick={() => handleSelectChat(chat)}
              />
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default ChatSidebar;