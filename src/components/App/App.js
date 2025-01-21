import React, { useState } from 'react';
import FigureSelection from '../FigureSelection/FigureSelection';
import ChatRoom from '../ChatRoom/ChatRoom';
import HamburgerMenu from '../HamburgerMenu/HamburgerMenu';
import Feedback from '../Feedback/Feedback';
import '../../styles/App.css';

function App() {
  const [figures, setFigures] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleAddFigure = (figure) => {
    if (!figures.some(f => f.id === figure.id)) {
      setFigures(prev => [...prev, figure]);
    }
  };

  const handleRemoveFigure = (figureId) => {
    setFigures(prev => prev.filter(f => f.id !== figureId));
  };

  return (
    <div className="App">
      <header className="App-header">
        <HamburgerMenu onFeedbackClick={() => setShowFeedback(true)} />
        <h1>Let Them Discuss</h1>
      </header>
      {showFeedback && <Feedback onClose={() => setShowFeedback(false)} />}
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
    </div>
  );
}

export default App;
