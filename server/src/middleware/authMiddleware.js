const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware zur Überprüfung der Authentifizierung
exports.protect = (req, res, next) => {
  try {
    // Token aus dem Authorization-Header extrahieren
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Überprüfen, ob ein Token vorhanden ist
    if (!token) {
      return res.status(401).json({
        message: 'Nicht autorisiert, kein Token',
      });
    }

    // Token verifizieren
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      
      // Benutzerinformationen zum Request hinzufügen
      req.user = {
        id: decoded.id,
      };
      
      next();
    } catch (error) {
      return res.status(401).json({
        message: 'Nicht autorisiert, ungültiger Token',
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      message: 'Serverfehler bei der Authentifizierung',
    });
  }
};

// Vereinfachte Middleware für die aktuelle Einzelbenutzer-Umgebung
// Kann später entfernt werden, wenn die vollständige Authentifizierung implementiert ist
exports.adminOnly = (req, res, next) => {
  // Da derzeit nur ein Admin-Benutzer existiert, setzen wir diesen Benutzer direkt
  req.user = {
    id: 'admin',  // Feste ID für den Admin-Benutzer
  };
  
  next();
};