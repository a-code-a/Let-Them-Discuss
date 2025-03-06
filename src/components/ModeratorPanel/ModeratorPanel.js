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
          <ol className="steps-list">
            <li>Personas per Drag & Drop in das Chatfenster ziehen</li>
            <li>Diskussionsthema oder Frage festlegen im Chatfenster</li>
            <li>Diskussion starten</li>
          </ol>
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
