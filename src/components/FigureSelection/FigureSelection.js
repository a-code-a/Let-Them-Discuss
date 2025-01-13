import React, { useState } from 'react';
import { getGroupedPersonas } from '../../services/personaService';
import './FigureSelection.css';

const FigureSelection = ({ onSelectFigure }) => {
  const [expandedEra, setExpandedEra] = useState(null);
  const groupedPersonas = getGroupedPersonas();

  const handleEraClick = (era) => {
    setExpandedEra(expandedEra === era ? null : era);
  };

  const handleFigureClick = (figureId) => {
    onSelectFigure(figureId);
  };

  return (
    <div className="figure-selection">
      <h2>Historische Persönlichkeiten</h2>
      <div className="eras-container">
        {Object.entries(groupedPersonas).map(([era, figures]) => (
          <div 
            key={era} 
            className={`era-group ${expandedEra === era ? 'expanded' : ''}`}
          >
            <div 
              className="era-header"
              onClick={() => handleEraClick(era)}
            >
              <h3>{era}</h3>
              <span className="era-count">{figures.length}</span>
              <span className="expand-icon">
                {expandedEra === era ? '▼' : '▶'}
              </span>
            </div>
            {expandedEra === era && (
              <div className="figures-grid">
                {figures.map((figure) => (
                  <div
                    key={figure.id}
                    className="figure-card"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/json', JSON.stringify(figure));
                      e.target.classList.add('dragging');
                    }}
                    onDragEnd={(e) => {
                      e.target.classList.remove('dragging');
                    }}
                  >
                    <img
                      src={`/images/${figure.id}.jpg`}
                      alt={figure.name}
                      className="figure-avatar"
                    />
                    <div className="figure-info">
                      <span className="figure-name">{figure.name}</span>
                      <span className="figure-era">{figure.era}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FigureSelection;
