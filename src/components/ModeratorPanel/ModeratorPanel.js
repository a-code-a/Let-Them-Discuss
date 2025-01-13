import React, { useState } from 'react';
import './ModeratorPanel.css';

const ModeratorPanel = ({ 
  selectedFigures,
  onSelectSpeaker,
  onRemoveParticipant,
  onAddParticipant,
  currentSpeaker,
  topic,
  onStartDiscussion,
  onStopDiscussion,
  isDiscussionActive: externalIsDiscussionActive 
}) => {
  const [isDiscussionActive, setIsDiscussionActive] = useState(false);

  const toggleDiscussion = () => {
    if (!isDiscussionActive && selectedFigures.length < 2) {
      alert('Bitte wählen Sie mindestens 2 Teilnehmer aus.');
      return;
    }
    
    if (isDiscussionActive) {
      onStopDiscussion();
    } else {
      onStartDiscussion();
    }
    
    setIsDiscussionActive(!isDiscussionActive);
  };

  return (
    <div className="moderator-panel">
      <h3>Moderator Panel</h3>
      
      <div className="discussion-controls">
        <button 
          className={`discussion-toggle ${isDiscussionActive ? 'active' : ''}`}
          onClick={toggleDiscussion}
        >
          {isDiscussionActive ? 'Diskussion beenden' : 'Diskussion starten'}
        </button>
      </div>

      {topic && (
        <div className="topic-display">
          <h4>Aktuelles Thema:</h4>
          <p>{topic}</p>
        </div>
      )}

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
                  disabled={currentSpeaker?.id === figure.id || isDiscussionActive}
                >
                  Rederecht erteilen
                </button>
                <button 
                  onClick={() => onRemoveParticipant(figure)}
                  className="remove-btn"
                  disabled={isDiscussionActive}
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
