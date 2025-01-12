import React, { useRef, useState } from 'react';
import { personas } from '../../services/personaService';
import './FigureSelection.css';

const FigureSelection = ({ onSelectFigure, selectedFigures }) => {
  const figures = Object.values(personas).map(persona => ({
    id: persona.name,
    name: persona.name,
    image: `images/${persona.name.toLowerCase().replace(/ /g, '-')}.jpg`,
    description: persona.role
  }));
  const dragItem = useRef(null);

  const handleDragStart = (e, figure) => {
    dragItem.current = figure;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', figure.id);
  };

  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (dragItem.current) {
      onSelectFigure(dragItem.current);
      dragItem.current = null;
    }
  };

  return (
    <div
      className={`figure-selection ${isDraggingOver ? 'dragging-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
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
