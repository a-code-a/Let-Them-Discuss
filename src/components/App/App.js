import React, { useState } from 'react';
import FigureSelection from '../FigureSelection/FigureSelection';
import ChatRoom from '../ChatRoom/ChatRoom';
import '../../styles/App.css';

function App() {
  const [figures, setFigures] = useState([]);

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
        <h1>Historical Figures Chat Room</h1>
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
    </div>
  );
}

export default App;
