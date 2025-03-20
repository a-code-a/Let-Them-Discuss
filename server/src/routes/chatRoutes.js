const express = require('express');
const chatController = require('../controllers/chatController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Da wir derzeit nur einen Admin-Benutzer haben, verwenden wir die vereinfachte Middleware
// Bei vollständiger Implementierung der Authentifizierung kann adminOnly durch protect ersetzt werden

// GET /api/chats - Alle Chats des Benutzers abrufen
router.get('/', adminOnly, chatController.getChats);

// GET /api/chats/:id - Einen spezifischen Chat abrufen
router.get('/:id', adminOnly, chatController.getChat);

// POST /api/chats - Einen neuen Chat erstellen
router.post('/', adminOnly, chatController.createChat);

// PUT /api/chats/:id - Einen Chat aktualisieren (z.B. Titel ändern)
router.put('/:id', adminOnly, chatController.updateChat);

// PUT /api/chats/:id/messages - Eine Nachricht zu einem Chat hinzufügen
router.put('/:id/messages', adminOnly, chatController.addMessage);

// DELETE /api/chats/:id - Einen Chat löschen
router.delete('/:id', adminOnly, chatController.deleteChat);

module.exports = router;