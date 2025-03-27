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

// Timeout Promise-Helfer
const timeout = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Überprüfen, ob wir in einer Netlify-Produktionsumgebung sind
const isNetlifyProduction = process.env.NETLIFY && process.env.CONTEXT === 'production';
console.log(`Umgebungserkennung: Netlify Produktion: ${isNetlifyProduction}`);

// Mit MongoDB verbinden mit Retries
const connectDB = async (retries = 3, delay = 2000) => {
  // Spezieller Modus für Netlify-Produktionsumgebung
  if (isNetlifyProduction) {
    console.log('Netlify-Produktionsumgebung erkannt, verwende optimierte Verbindungsoptionen');
    
    // In Netlify-Produktionsumgebung: Verkürzte Timeouts und optimierte Optionen
    try {
      // Mongoose-Optionen für Serverless-Umgebung
      mongoose.set('strictQuery', true);
      mongoose.set('bufferCommands', false); // Keine gepufferten Befehle für Serverless
      
      // Verbindung mit serverless-optimierten Optionen
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,   // Kürzerer Timeout in Serverless
        socketTimeoutMS: 10000,           // Socket Timeout
        connectTimeoutMS: 10000,          // Verbindungs-Timeout
        keepAlive: true,                  // Keep-Alive aktivieren
        keepAliveInitialDelay: 5000,      // Keep-Alive Initial-Delay
      });

      console.log(`MongoDB verbunden in Netlify-Produktion: ${conn.connection.host}`);
      return true;
    } catch (err) {
      console.error(`MongoDB Verbindungsfehler in Netlify-Produktion:`, err.message);
      return false; // Keine Retries in Produktion, um Kalt-Starts zu vermeiden
    }
  } else {
    // Standard-Modus für lokale Entwicklung
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Mongoose-Optionen für bessere Verbindungsstabilität
        mongoose.set('strictQuery', true);
        
        // Verbindung herstellen
        await mongoose.connect(process.env.MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 10000, // 10 Sekunden Timeout
          heartbeatFrequencyMS: 5000,      // Häufigere Heartbeats
        });
        
        console.log(`MongoDB verbunden (Versuch ${attempt})`);
        return true;
      } catch (err) {
        console.error(`MongoDB Verbindungsfehler (Versuch ${attempt}/${retries}):`, err.message);
        
        if (attempt < retries) {
          console.log(`Erneuter Verbindungsversuch in ${delay}ms...`);
          await timeout(delay);
          // Exponential backoff
          delay = delay * 1.5;
        } else {
          console.error('Maximale Anzahl von Verbindungsversuchen erreicht.');
          return false;
        }
      }
    }
    return false;
  }
};

// Verbindung zur Datenbank herstellen
let dbConnectionPromise;

// In Netlify-Produktionsumgebung verzögern wir die Verbindung bis zum ersten Aufruf
if (isNetlifyProduction) {
  // Keine Verbindung im Handler-Setup herstellen in Produktion (Cold-Start Problem)
  console.log('In Netlify-Produktion: Verbindung wird beim ersten Request hergestellt');
  dbConnectionPromise = Promise.resolve(false);
} else {
  // In Entwicklung sofort verbinden
  dbConnectionPromise = connectDB().catch(err => {
    console.error('Initial MongoDB connection failed:', err.message);
    return false;
  });
}

// Variable für den Verbindungsstatus
let isConnected = false;

// Wir halten diese Promise, um den Verbindungsstatus zu verfolgen

// MongoDB Verbindungsstatus Mapping
const readyStateMap = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
  99: 'uninitialized'
};

// Funktion zum erneuten Verbindungsversuch
const reconnectIfNeeded = async () => {
  // Wenn bereits verbunden, nichts tun
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return true;
  }
  
  // Wenn wir in Netlify Produktion sind und die Verbindung gerade hergestellt wird
  if (isNetlifyProduction && mongoose.connection.readyState === 2) {
    console.log('Netlify Produktion: Verbindung wird bereits hergestellt, nicht erneut versuchen');
    return false; // Lassen wir die bestehende Verbindung weiter versuchen
  }
  
  // Verbindungsversuch basierend auf Umgebung
  console.log(`${isNetlifyProduction ? 'Netlify Produktion' : 'Entwicklung'}: MongoDB verbinden...`);
  const result = await connectDB(isNetlifyProduction ? 1 : 2, 1000);
  isConnected = result;
  return result;
};

// Health check with connection status
app.get('/api/status', async (req, res) => {
  // In Netlify Produktion: Verbindung herstellen, wenn dieser Endpunkt aufgerufen wird
  if (isNetlifyProduction && mongoose.connection.readyState !== 1) {
    console.log('Status-Endpunkt aufgerufen: Verbindungsversuch in Netlify Produktion');
    await reconnectIfNeeded();
  } else if (mongoose.connection.readyState !== 1) {
    await reconnectIfNeeded();
  }
  
  const readyState = mongoose.connection.readyState;
  
  res.json({
    status: 'ok',
    api_version: '1.0.0',
    timestamp: new Date().toISOString(),
    mongodb: readyStateMap[readyState] || 'unbekannt',
    mongodb_state: readyState,
    mongodb_host: mongoose.connection.host || 'nicht verfügbar',
    env: {
      has_mongodb_uri: !!process.env.MONGODB_URI,
      mongodb_uri_length: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0,
      node_env: process.env.NODE_ENV || 'nicht definiert',
      netlify: process.env.NETLIFY ? 'true' : 'false',
      context: process.env.CONTEXT || 'nicht definiert',
      is_netlify_prod: isNetlifyProduction ? 'true' : 'false'
    },
    serverless_info: {
      is_connected: isConnected ? 'true' : 'false',
      deployment_info: 'Netlify serverless function'
    }
  });
});

// Add middleware to check DB connection before route handlers
app.use('/api/chats', async (req, res, next) => {
  // In Netlify Produktion spezielle Behandlung
  if (isNetlifyProduction) {
    // Wenn noch nicht verbunden oder Verbindung verloren, versuche zu verbinden
    if (mongoose.connection.readyState !== 1) {
      console.log('Netlify Produktion: Verbindungsversuch bei Zugriff auf /api/chats');
      
      // Wenn gerade verbindend (readyState=2), informiere früh, dass Daten bald verfügbar sind
      if (mongoose.connection.readyState === 2) {
        return res.status(503).json({
          message: 'Datenbank wird gerade verbunden',
          details: 'Die Verbindung zur Datenbank wird hergestellt. Bitte versuchen Sie es in wenigen Sekunden erneut.',
          readyState: 2,
          readyStateText: 'connecting',
          retry_after: 3, // Hinweis an den Client, es in 3 Sekunden erneut zu versuchen
          is_serverless: true
        });
      }
      
      // Verbindungsversuch
      const connected = await reconnectIfNeeded();
      
      // Wenn immer noch nicht verbunden
      if (!connected) {
        console.log('Netlify Produktion: Verbindung fehlgeschlagen, sende optimierten Fehler');
        return res.status(503).json({
          message: 'Serverless-Funktion konnte keine Datenbankverbindung herstellen',
          details: 'Bitte aktualisieren Sie die Seite oder versuchen Sie es in einigen Sekunden erneut.',
          readyState: mongoose.connection.readyState,
          readyStateText: readyStateMap[mongoose.connection.readyState] || 'unbekannter Status',
          retry_after: 5,
          troubleshooting: [
            'Der Server befindet sich möglicherweise im Cold-Start-Zustand',
            'In Netlify-Umgebungen kann die erste Verbindung länger dauern',
            'Dies ist ein bekanntes Verhalten bei Serverless-Funktionen'
          ]
        });
      }
    }
  } else {
    // Normale Entwicklungsumgebung
    if (mongoose.connection.readyState !== 1) {
      console.log('Entwicklung: MongoDB ist nicht verbunden. Verbindungsversuch...');
      await reconnectIfNeeded();
      
      // Wenn immer noch nicht verbunden, sende Fehlermeldung
      if (mongoose.connection.readyState !== 1) {
        console.error('Entwicklung: MongoDB konnte nicht verbunden werden');
        return res.status(503).json({
          message: 'Datenbankverbindung nicht verfügbar',
          details: 'Die Verbindung zur Datenbank konnte nicht hergestellt werden',
          readyState: mongoose.connection.readyState,
          readyStateText: readyStateMap[mongoose.connection.readyState] || 'unbekannter Status',
          troubleshooting: [
            'Überprüfen Sie, ob MongoDB läuft und erreichbar ist',
            'Kontrollieren Sie die MongoDB-URI in den Umgebungsvariablen',
            'Prüfen Sie die Netzwerkverbindung zum MongoDB-Server'
          ]
        });
      }
    }
  }
  next();
}, chatRoutes);

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