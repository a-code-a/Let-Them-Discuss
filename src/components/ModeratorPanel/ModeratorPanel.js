import React from 'react';
import './ModeratorPanel.css';

const ModeratorPanel = ({
  topic,
  isDiscussionActive
}) => {
  return (
    <div className="moderator-panel">
      <h3>Moderator Panel</h3>
      
      <div className="discussion-controls">
        <div className="instruction">
          <h4>Anleitung:</h4>
          <p>
            Ziehe eine oder mehrere Personas per Drag & Drop in das Chatfenster, um ihnen Fragen zu stellen.<br/><br/>
            Wenn mehrere Personas ausgewählt sind, kannst du eine Diskussion starten.
          </p>
        </div>
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
