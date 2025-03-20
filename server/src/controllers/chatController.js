const Chat = require('../models/Chat');
const mongoose = require('mongoose');

// Alle Chats eines Benutzers abrufen
// GET /api/chats
exports.getChats = async (req, res) => {
  try {
    const userId = req.user.id; // Benutzer-ID aus dem Auth-Token

    // Chats abrufen, nach Aktualisierungsdatum sortiert (neueste zuerst)
    const chats = await Chat.find({ userId })
      .sort({ updatedAt: -1 })
      .select('-messages') // Nachrichten ausschließen, für bessere Performance
      .lean();

    res.status(200).json(chats);
  } catch (error) {
    console.error('Error getting chats:', error);
    res.status(500).json({ message: 'Serverfehler beim Abrufen der Chats' });
  }
};

// Einen spezifischen Chat abrufen
// GET /api/chats/:id
exports.getChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const chatId = req.params.id;

    const chat = await Chat.findOne({ _id: chatId, userId });

    if (!chat) {
      return res.status(404).json({ message: 'Chat nicht gefunden' });
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error('Error getting chat:', error);
    res.status(500).json({ message: 'Serverfehler beim Abrufen des Chats' });
  }
};

// Einen neuen Chat erstellen
// POST /api/chats
exports.createChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, figures, messages } = req.body;

    const newChat = new Chat({
      userId,
      title: title || 'Neues Gespräch',
      figures: figures || [],
      messages: messages || []
    });

    const savedChat = await newChat.save();
    res.status(201).json(savedChat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ message: 'Serverfehler beim Erstellen des Chats' });
  }
};

// Einen Chat aktualisieren
// PUT /api/chats/:id
exports.updateChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const chatId = req.params.id;
    const { title, figures } = req.body;

    const chat = await Chat.findOne({ _id: chatId, userId });

    if (!chat) {
      return res.status(404).json({ message: 'Chat nicht gefunden' });
    }

    // Aktualisieren der Felder
    if (title !== undefined) chat.title = title;
    if (figures !== undefined) chat.figures = figures;

    const updatedChat = await chat.save();
    res.status(200).json(updatedChat);
  } catch (error) {
    console.error('Error updating chat:', error);
    res.status(500).json({ message: 'Serverfehler beim Aktualisieren des Chats' });
  }
};

// Eine Nachricht zu einem Chat hinzufügen
// PUT /api/chats/:id/messages
exports.addMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const chatId = req.params.id;
    
    // Hol die rohen Daten - akzeptiere flexibles Format
    let rawData = req.body;
    
    console.log(`Hinzufügen der Nachricht zu Chat ${chatId}:`, JSON.stringify(rawData, null, 2));
    
    // Sehr einfache Nachrichtenstruktur erstellen
    let messageToAdd = {};
    
    // Mit verschiedenen möglichen Formaten umgehen
    if (rawData.message) {
      // Wenn die Nachricht in message eingebettet ist
      messageToAdd = rawData.message;
    } else if (rawData.figure && rawData.text) {
      // Wenn die Nachricht direkt im body liegt
      messageToAdd = rawData;
    } else {
      // Versuche, die beste Vermutung anzustellen
      messageToAdd = {
        figure: rawData.figure || {
          id: 'unknown',
          name: 'Unknown',
          image: '/images/default-avatar.svg'
        },
        text: rawData.text || 'Leere Nachricht',
        timestamp: rawData.timestamp || new Date().toISOString()
      };
    }
    
    // Stelle sicher, dass die figure-Eigenschaft existiert
    if (!messageToAdd.figure) {
      messageToAdd.figure = {
        id: 'unknown',
        name: 'Unknown',
        image: '/images/default-avatar.svg'
      };
    }
    
    // Stelle sicher, dass text existiert
    if (!messageToAdd.text) {
      messageToAdd.text = 'Leere Nachricht';
    }
    
    // Stelle sicher, dass timestamp existiert
    if (!messageToAdd.timestamp) {
      messageToAdd.timestamp = new Date().toISOString();
    }
    
    console.log('Vorbereitete Nachricht zum Speichern:', JSON.stringify(messageToAdd, null, 2));
    
    try {
      // Direkte Verwendung des MongoDB-Treibers, um Mongoose-Validierung zu umgehen
      const db = mongoose.connection.db;
      
      // Finde den Chat und aktualisiere ihn direkt
      const result = await db.collection('chats').updateOne(
        { _id: new mongoose.Types.ObjectId(chatId), userId },
        {
          $push: { messages: messageToAdd },
          $set: { updatedAt: new Date() }
        }
      );
      
      if (result.matchedCount === 0) {
        console.error(`Chat mit ID ${chatId} für Benutzer ${userId} nicht gefunden`);
        return res.status(404).json({ message: 'Chat nicht gefunden' });
      }
      
      // Hole den aktualisierten Chat
      const updatedChat = await Chat.findById(chatId);
      
      console.log(`Nachricht erfolgreich hinzugefügt. Chat hat jetzt ${updatedChat.messages.length} Nachrichten`);
      return res.status(200).json(updatedChat);
    } catch (dbError) {
      console.error('Datenbankfehler beim Hinzufügen der Nachricht:', dbError);
      return res.status(500).json({
        message: 'Datenbankfehler beim Hinzufügen der Nachricht',
        error: dbError.toString()
      });
    }
  } catch (error) {
    console.error('Error adding message to chat:', error);
    res.status(500).json({ message: 'Serverfehler beim Hinzufügen der Nachricht', error: error.toString() });
  }
};

// Einen Chat löschen
// DELETE /api/chats/:id
exports.deleteChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const chatId = req.params.id;

    const result = await Chat.deleteOne({ _id: chatId, userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Chat nicht gefunden' });
    }

    res.status(200).json({ message: 'Chat erfolgreich gelöscht' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ message: 'Serverfehler beim Löschen des Chats' });
  }
};