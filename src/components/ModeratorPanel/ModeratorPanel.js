import React, { useState } from 'react';
import './ModeratorPanel.css';

const ModeratorPanel = ({ 
  selectedFigures,
  onSetTopic,
  onSelectSpeaker,
  onRemoveParticipant,
  onAddParticipant,
  currentSpeaker,
  topic,
  onStartDiscussion,
  onStopDiscussion,
  isDiscussionActive: externalIsDiscussionActive 
}) => {
  const [newTopic, setNewTopic] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  const [isDiscussionActive, setIsDiscussionActive] = useState(false);

  const handleTopicSubmit = (e) => {
    e.preventDefault();
    onSetTopic(newTopic);
    setNewTopic('');
  };

  const handleInitialMessageSubmit = (e) => {
    e.preventDefault();
    if (initialMessage.trim()) {
      onStartDiscussion(initialMessage);
    }
  };

  const toggleDiscussion = () => {
    if (!isDiscussionActive && (!topic || !initialMessage || selectedFigures.length < 2)) {
      alert('Bitte setzen Sie ein Thema, geben Sie eine initiale Nachricht ein und wählen Sie mindestens 2 Teilnehmer aus.');
      return;
    }
    
    if (isDiscussionActive) {
      onStopDiscussion();
    } else {
      handleInitialMessageSubmit({ preventDefault: () => {} });
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

      <div className="topic-section">
        <h4>Diskussionsthema</h4>
        <form onSubmit={handleTopicSubmit}>
          <input
            type="text"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder="Neues Thema eingeben"
            disabled={isDiscussionActive}
          />
          <button type="submit" disabled={isDiscussionActive}>Thema setzen</button>
        </form>
        {topic && <p>Aktuelles Thema: {topic}</p>}
      </div>

      <div className="initial-message-section">
        <h4>Initiale Nachricht</h4>
        <form onSubmit={handleInitialMessageSubmit}>
          <textarea
            value={initialMessage}
            onChange={(e) => setInitialMessage(e.target.value)}
            placeholder="Geben Sie hier Ihre erste Nachricht ein, um die Diskussion zu starten..."
            disabled={isDiscussionActive}
          />
        </form>
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
