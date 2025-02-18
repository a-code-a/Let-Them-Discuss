import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './HamburgerMenu.css';

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const { logout } = useAuth();

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    // Implement feedback submission
    fetch('/.netlify/functions/feedback', {
      method: 'POST',
      body: JSON.stringify({ text: feedbackText }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
      if (response.ok) {
        console.log('Feedback submitted successfully!');
        alert('Feedback wurde erfolgreich gesendet!');
      } else {
        console.error('Failed to submit feedback.');
        alert('Feedback konnte nicht gesendet werden.');
      }
    })
    .catch(error => {
      console.error('Error submitting feedback:', error);
      alert('Ein Fehler ist beim Senden des Feedbacks aufgetreten.');
    });
    setShowFeedbackDialog(false);
    setFeedbackText('');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="hamburger-menu">
      <button className="hamburger-button" onClick={toggleMenu}>
        <div className={`hamburger-icon ${isOpen ? 'open' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
      
      <div className={`menu-items ${isOpen ? 'open' : ''}`}>
        <ul>
          <li>
            <button className="menu-item">
              <i className="fas fa-home"></i>
              Startseite
            </button>
          </li>
          <li>
            <button
              className="menu-item feedback-button"
              onClick={() => {
                setShowFeedbackDialog(true);
                setIsOpen(false);
              }}
            >
              <i className="fas fa-comment"></i>
              Feedback
            </button>
          </li>
          <li>
            <button 
              className="menu-item logout-button"
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
            >
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </li>
        </ul>
      </div>

      {showFeedbackDialog && (
        <div className="dialog-overlay" onClick={() => setShowFeedbackDialog(false)}>
          <div className="feedback-dialog dialog-content" onClick={(e) => e.stopPropagation()}>
            <h3>Feedback senden</h3>
            <form onSubmit={handleSubmitFeedback}>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Ihr Feedback hier..."
                required
              />
              <div className="dialog-buttons">
                <button type="button" onClick={() => setShowFeedbackDialog(false)}>
                  Abbrechen
                </button>
                <button type="submit">Senden</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu;
