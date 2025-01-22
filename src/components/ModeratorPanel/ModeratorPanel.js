import React, { useState } from 'react';
import './ModeratorPanel.css';

const ModeratorPanel = ({
  topic,
  onStartDiscussion,
  onStopDiscussion,
  isDiscussionActive: externalIsDiscussionActive
}) => {
  const [isDiscussionActive, setIsDiscussionActive] = useState(false);

  const toggleDiscussion = () => {
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

    </div>
  );
};

export default ModeratorPanel;
