import React, { useState } from 'react';
import './HamburgerMenu.css';

const HamburgerMenu = ({ onFeedbackClick }) => {
  const [isOpen, setIsOpen] = useState(false);

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
              className="menu-item" 
              onClick={() => {
                onFeedbackClick();
                setIsOpen(false);
              }}
            >
              <i className="fas fa-comment"></i>
              Feedback
            </button>
          </li>
          <li>
            <button className="menu-item">
              <i className="fas fa-info-circle"></i>
              Über uns
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HamburgerMenu;
