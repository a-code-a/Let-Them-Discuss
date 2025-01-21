import React, { useState } from 'react';
import './Feedback.css';

const Feedback = ({ onClose }) => {
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Hier könnte später die Logik zum Senden des Feedbacks an einen Server implementiert werden
    console.log('Feedback submitted:', feedback);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setFeedback('');
    }, 2000);
  };

  return (
    <div className="feedback-modal">
      <div className="feedback-content">
        <button className="close-button" onClick={onClose}>×</button>
        {!submitted ? (
          <>
            <h2>Feedback</h2>
            <p>Wir freuen uns über Ihre Rückmeldung!</p>
            <form onSubmit={handleSubmit}>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Schreiben Sie hier Ihr Feedback..."
                required
              />
              <button type="submit" className="submit-button">
                Feedback senden
              </button>
            </form>
          </>
        ) : (
          <div className="success-message">
            <i className="fas fa-check-circle"></i>
            <p>Vielen Dank für Ihr Feedback!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feedback;
