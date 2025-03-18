import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Login from '../Login/Login';
import ChatRoom from '../ChatRoom/ChatRoom';
import HamburgerMenu from '../HamburgerMenu/HamburgerMenu';
import '../../styles/App.css';

const counterStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white
  padding: '10px 20px',
  borderRadius: '20px',
  textAlign: 'center',
  marginTop: '20px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Add a subtle shadow
  fontFamily: 'Arial, sans-serif',
};

const countStyle = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#e44d26', // A warm, inviting color
  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)', // Add a text shadow for depth
};

function App() {
  const { isAuthenticated } = useAuth();
  const [figures, setFigures] = useState([]);
  const [visitorCount, setVisitorCount] = useState(0);

  useEffect(() => {
    const incrementVisitorCount = async () => {
      try {
        const response = await fetch('/.netlify/functions/incrementVisitorCount');
        const data = await response.json();
        setVisitorCount(data.count);
      } catch (error) {
        console.error('Error fetching visitor count:', error);
      }
    };

    incrementVisitorCount();
  }, []);

  if (!isAuthenticated) {
    return <Login />;
  }
  const handleAddFigure = (figure) => {
    if (!figures.some(f => f.id === figure.id)) {
      if (typeof figure.insertIndex === 'number') {
        setFigures(prev => [
          ...prev.slice(0, figure.insertIndex),
          figure,
          ...prev.slice(figure.insertIndex)
        ]);
      } else {
        setFigures(prev => [...prev, figure]);
      }
    }
  };

  const handleRemoveFigure = (figureId) => {
    setFigures(prev => prev.filter(f => f.id !== figureId));
  };

  return (
    <div className="App">
      <header className="App-header">
        <HamburgerMenu />
        <h1>Theologen Taverne</h1>
        <nav>
          <ul>
            <li><a href="#features">Features</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>
      </header>
      <div style={counterStyle}>
        <p>Besucher:</p>
        <p style={countStyle}>{visitorCount}</p>
      </div>
      <div className="chat-container">
        <ChatRoom
          figures={figures}
          onRemoveFigure={handleRemoveFigure}
          onAddFigure={handleAddFigure}
        />
      </div>
      <footer>
        <p>&copy; 2025 Theologen Taverne. All rights reserved.</p>
        <nav>
          <ul>
            <li><a href="/terms">Terms of Service</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
          </ul>
        </nav>
      </footer>
    </div>
  );
}

export default App;
