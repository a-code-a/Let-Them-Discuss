import React, { useState } from 'react';
import './Feedback.css';

const Feedback = ({ onClose }) => {
  const [feedback, setFeedback] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [feedbackList, setFeedbackList] = useState(() => {
    const saved = localStorage.getItem('feedbackList');
    return saved ? JSON.parse(saved).map(item => ({
      ...item,
      upvotes: item.upvotes || 0,
      downvotes: item.downvotes || 0
    })) : [];
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newFeedback = {
      id: Date.now(),
      text: feedback,
      userName: userName.trim(),
      userEmail: userEmail.trim(),
      upvotes: 0,
      downvotes: 0,
      timestamp: new Date().toISOString()
    };
    const updatedList = [...feedbackList, newFeedback].sort((a, b) => 
      (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
    setFeedbackList(updatedList);
    localStorage.setItem('feedbackList', JSON.stringify(updatedList));
    setFeedback('');
    setUserName('');
    setUserEmail('');
  };

  const handleVote = (id, isUpvote) => {
    const updatedList = feedbackList
      .map(item => {
        if (item.id === id) {
          return {
            ...item,
            upvotes: isUpvote ? item.upvotes + 1 : item.upvotes,
            downvotes: !isUpvote ? item.downvotes + 1 : item.downvotes
          };
        }
        return item;
      })
      .sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
      
    setFeedbackList(updatedList);
    localStorage.setItem('feedbackList', JSON.stringify(updatedList));
  };

  const handleDelete = (id) => {
    const updatedList = feedbackList.filter(item => item.id !== id);
    setFeedbackList(updatedList);
    localStorage.setItem('feedbackList', JSON.stringify(updatedList));
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
              {feedbackList.map((item) => (
                <div key={item.id} className="feedback-item">
                  <div className="vote-buttons">
                    <button 
                      onClick={() => handleVote(item.id, true)}
                      className="vote-btn upvote"
                      aria-label="Upvote"
                    >
                      👍 <span className="vote-count upvote-count">{item.upvotes}</span>
                    </button>
                    <button
                      onClick={() => handleVote(item.id, false)}
                      className="vote-btn downvote"
                      aria-label="Downvote"
                    >
                      👎 <span className="vote-count downvote-count">{item.downvotes}</span>
                    </button>
                  </div>
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
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
