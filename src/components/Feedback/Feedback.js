import React, { useState, useEffect } from 'react';
import './Feedback.css';

const API_URL = '/.netlify/functions/feedback';

const Feedback = ({ onClose }) => {
  const [feedback, setFeedback] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [feedbackList, setFeedbackList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch feedback');
      const data = await response.json();
      setFeedbackList(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newFeedback = {
      text: feedback,
      userName: userName.trim(),
      userEmail: userEmail.trim()
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFeedback)
      });
      
      if (!response.ok) throw new Error('Failed to submit feedback');
      
      const updatedList = await response.json();
      setFeedbackList(updatedList);
      setFeedback('');
      setUserName('');
      setUserEmail('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };
  const handleDelete = async (id) => {
    try {
      const response = await fetch(API_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (!response.ok) throw new Error('Failed to delete feedback');

      const updatedList = await response.json();
      setFeedbackList(updatedList);
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };

  return (
    <div className="feedback-modal">
      <div className="feedback-content">
        <button className="close-button" onClick={onClose}>×</button>
        <div className="feedback-layout">
          <div className="feedback-input-section">
            <h2>Feedback</h2>
            <p>Wir freuen uns über Ihre Rückmeldung!</p>
            <form onSubmit={handleSubmit}>
              <div className="user-info-inputs">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Ihr Name*"
                  className="feedback-input"
                  required
                  minLength="2"
                />
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="Ihre E-Mail (optional)"
                  className="feedback-input"
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                />
              </div>
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
          </div>
          
          <div className="feedback-list-section">
            <h3>Bisherige Feedbacks</h3>
            <div className="feedback-list">
              {isLoading ? (
                <div className="loading">Lade Feedback...</div>
              ) : (
                feedbackList.map((item) => (
                  <div key={`${item.id}_${item.timestamp}`} className="feedback-item">
                    <div className="feedback-content-wrapper">
                      <div className="feedback-text">{item.text}</div>
                      <div className="feedback-user-info">
                        <div className="feedback-user-name">{item.userName}</div>
                        <div className="feedback-datetime">
                          {new Date(item.timestamp).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })} - 
                          {new Date(item.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="delete-btn"
                      aria-label="Feedback löschen"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
