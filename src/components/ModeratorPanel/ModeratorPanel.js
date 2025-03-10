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
            <li>Ziehe Gesprächsteilnehmer per Drag & Drop in den Chat</li>
            <li>Lege ein Diskussionsthema oder eine Frage im Chat fest</li>
            <li>Starte die Diskussion</li>
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
