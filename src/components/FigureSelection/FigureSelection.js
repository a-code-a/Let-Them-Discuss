import React, { useRef } from 'react';
import { getFiguresList } from '../../services/chatService';
import './FigureSelection.css';

const FigureSelection = ({ onSelectFigure, selectedFigures }) => {
  const figures = getFiguresList();
  const dragItem = useRef(null);

  const handleDragStart = (e, figure) => {
    dragItem.current = figure;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', figure.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (dragItem.current) {
      onSelectFigure(dragItem.current);
      dragItem.current = null;
    }
  };

  return (
    <div 
      className="figure-selection"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <h2>Drag figures into the chat room:</h2>
      <div className="figure-grid">
        {figures.map((figure) => (
          <div
            key={figure.id}
            className={`figure-card ${
              selectedFigures.some(f => f.id === figure.id) ? 'selected' : ''
            }`}
            draggable
            onDragStart={(e) => handleDragStart(e, figure)}
          >
            <img 
              src={figure.image} 
              alt={figure.name} 
              className="figure-image"
            />
            <div className="figure-info">
              <h3>{figure.name}</h3>
              <p>{figure.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FigureSelection;
