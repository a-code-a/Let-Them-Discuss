import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Login from '../Login/Login';
import FigureSelection from '../FigureSelection/FigureSelection';
import ChatRoom from '../ChatRoom/ChatRoom';
import HamburgerMenu from '../HamburgerMenu/HamburgerMenu';
import '../../styles/App.css';

function App() {
  const { isAuthenticated } = useAuth();
  const [figures, setFigures] = useState([]);

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
      <div className="chat-container">
        <FigureSelection
          onSelectFigure={handleAddFigure}
          selectedFigures={figures}
        />
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
