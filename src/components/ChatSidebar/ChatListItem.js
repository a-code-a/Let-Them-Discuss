import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useChat } from '../../context/ChatContext';
import './ChatListItem.css';

const ChatListItem = ({ chat, isActive, onClick }) => {
  const { deleteChat, updateChat } = useChat();
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(chat.title);
  const [showDropdown, setShowDropdown] = useState(false);
  const renameInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Formatieren des Zeitstempels
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' });
    }
  };

  // Anzeigen der letzten Nachricht als Vorschau
  const getMessagePreview = () => {
    if (chat.messages && chat.messages.length > 0) {
      const lastMessage = chat.messages[chat.messages.length - 1];
      if (lastMessage && lastMessage.figure && lastMessage.text) {
        return `${lastMessage.figure.name}: ${lastMessage.text.slice(0, 50)}${lastMessage.text.length > 50 ? '...' : ''}`;
      }
    }
    return 'Keine Nachrichten';
  };

  // Umbenennen des Chats
  const handleRename = async (e) => {
    e.stopPropagation(); // Verhindert das Auslösen des onClick-Events für das ListItem
    setIsRenaming(true);
    setShowDropdown(false);
    
    // Focus auf das Input-Feld setzen (nach dem Rendern)
    setTimeout(() => {
      if (renameInputRef.current) {
        renameInputRef.current.focus();
        renameInputRef.current.select();
      }
    }, 10);
  };

  // Speichern des neuen Titels
  const handleSaveRename = useCallback(async () => {
    if (newTitle.trim() && newTitle !== chat.title) {
      await updateChat(chat._id, { title: newTitle.trim() });
    } else {
      setNewTitle(chat.title); // Zurücksetzen auf den ursprünglichen Titel, wenn leer
    }
    setIsRenaming(false);
  }, [newTitle, chat, updateChat, setNewTitle, setIsRenaming]);

  // Tastatureingaben im Rename-Input
  const handleRenameKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveRename();
    } else if (e.key === 'Escape') {
      setNewTitle(chat.title);
      setIsRenaming(false);
    }
    e.stopPropagation();
  };

  // Löschen des Chats
  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Möchten Sie diesen Chat wirklich löschen?')) {
      await deleteChat(chat._id);
    }
    setShowDropdown(false);
  };

  // Dropdown-Menü umschalten
  const toggleDropdown = (e) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  // Dropdown schließen, wenn außerhalb geklickt wird
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Input-Feld schließen, wenn außerhalb geklickt wird
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (renameInputRef.current && !renameInputRef.current.contains(event.target)) {
        handleSaveRename();
      }
    };

    if (isRenaming) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isRenaming, handleSaveRename]);

  return (
    <div 
      className={`chat-list-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="chat-item-content">
        {isRenaming ? (
          <input
            ref={renameInputRef}
            type="text"
            className="rename-input"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleRenameKeyDown}
            onBlur={handleSaveRename}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <>
            <h4 className="chat-item-title">{chat.title}</h4>
            <p className="chat-item-preview">{getMessagePreview()}</p>
            <div className="chat-item-time">
              {formatTimestamp(chat.updatedAt)}
            </div>
          </>
        )}
      </div>

      <div className="chat-item-dropdown" ref={dropdownRef}>
        <button 
          className="dropdown-btn"
          onClick={toggleDropdown}
          aria-label="Chat-Aktionen"
        >
          ⋮
        </button>
        
        {showDropdown && (
          <div className="dropdown-menu">
            <div className="dropdown-item" onClick={handleRename}>
              <span className="dropdown-icon">✏️</span>
              Umbenennen
            </div>
            <div className="dropdown-item" onClick={handleDelete}>
              <span className="dropdown-icon">🗑️</span>
              Löschen
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatListItem;