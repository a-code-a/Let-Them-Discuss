import React, { useState } from 'react';
import './ModeratorPanel.css';

const ModeratorPanel = ({ 
  selectedFigures,
  onSetTopic,
  onSelectSpeaker,
  onRemoveParticipant,
  onAddParticipant,
  currentSpeaker,
  topic 
}) => {
  const [newTopic, setNewTopic] = useState('');

  const handleTopicSubmit = (e) => {
    e.preventDefault();
    onSetTopic(newTopic);
    setNewTopic('');
  };

  return (
    <div className="moderator-panel">
      <h3>Moderator Panel</h3>
      
      <div className="topic-section">
        <h4>Diskussionsthema</h4>
        <form onSubmit={handleTopicSubmit}>
          <input
            type="text"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder="Neues Thema eingeben"
          />
          <button type="submit">Thema setzen</button>
        </form>
        {topic && <p>Aktuelles Thema: {topic}</p>}
      </div>

      <div className="participants-section">
        <h4>Teilnehmer</h4>
        <div className="participants-list">
          {selectedFigures.map((figure) => (
            <div 
              key={figure.id} 
              className={`participant ${currentSpeaker?.id === figure.id ? 'speaking' : ''}`}
            >
              <span>{figure.name}</span>
              <div className="participant-controls">
                <button 
                  onClick={() => onSelectSpeaker(figure)}
                  disabled={currentSpeaker?.id === figure.id}
                >
                  Rederecht erteilen
                </button>
                <button 
                  onClick={() => onRemoveParticipant(figure)}
                  className="remove-btn"
                >
                  Entfernen
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModeratorPanel;
