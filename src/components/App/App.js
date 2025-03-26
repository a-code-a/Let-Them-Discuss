import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ChatProvider } from '../../context/ChatContext';
import Login from '../Login/Login';
import ChatRoom from '../ChatRoom/ChatRoom';
import ChatSidebar from '../ChatSidebar/ChatSidebar';
import HamburgerMenu from '../HamburgerMenu/HamburgerMenu';
import '../../styles/App.css';

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
    <ChatProvider>
      <div className="App">
        <header className="App-header">
          <HamburgerMenu />
          <h1><span className="logo-theologen">Theologen</span> <span className="logo-taverne">Taverne</span></h1>
          <nav>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </nav>
          <div className="visitor-counter">
            <p className="visitor-label">Besucher:</p>
            <p className="visitor-count"><i className="fas fa-user"></i> {visitorCount}</p>
          </div>
        </header>
        
        <div className="main-content">
          <ChatSidebar />
          <div className="chat-container">
            <ChatRoom
              figures={figures}
              onRemoveFigure={handleRemoveFigure}
              onAddFigure={handleAddFigure}
            />
          </div>
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
    </ChatProvider>
  );
}

export default App;
