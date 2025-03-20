const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const chatRoutes = require('../../server/src/routes/chatRoutes');

// Umgebungsvariablen laden
dotenv.config();

// Express App erstellen
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mit MongoDB verbinden
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB verbunden');
  } catch (err) {
    console.error('MongoDB Verbindungsfehler:', err.message);
    process.exit(1);
  }
};

// Verbindung zur Datenbank herstellen
connectDB();

// API-Routen
app.use('/api/chats', chatRoutes);

// Basisroute für Health-Check
app.get('/api', (req, res) => {
  res.json({ message: 'Chat API funktioniert!' });
});

// Error-Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Serverfehler', error: err.message });
});

// Serverless-Funktion exportieren
module.exports.handler = serverless(app);