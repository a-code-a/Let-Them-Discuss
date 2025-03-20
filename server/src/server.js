const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const chatRoutes = require('./routes/chatRoutes');

// Express App initialisieren
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Datenbankverbindung herstellen
connectDB();

// Routen
app.use('/api/chats', chatRoutes);

// Fallback-Route für unbekannte Endpunkte
app.use('*', (req, res) => {
  res.status(404).json({ message: 'API-Endpunkt nicht gefunden' });
});

// Globale Fehlerbehandlung
app.use((err, req, res, next) => {
  console.error('Unbehandelter Fehler:', err);
  res.status(500).json({
    message: 'Serverfehler',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack,
  });
});

// Server starten
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});

module.exports = app;