import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

function Login() {
  const backgroundStyle = {
    backgroundImage: `url(${process.env.PUBLIC_URL}/images/Background.png)`
  };
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = login(password);
    setError(success ? '' : 'Falsches Passwort');
  };

  return (
    <div className="login-container" style={backgroundStyle}>
      <div className="login-form-wrapper">
        <form onSubmit={handleSubmit}>
          <h1>Login</h1>
          
          <div className="input-group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              autoComplete="username"
            />
            <span className="input-icon username-icon">👤</span>
          </div>
          
          <div className="input-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
            />
            <span className="input-icon password-icon">🔒</span>
          </div>
          
          <div className="login-options">
            <div className="remember-me">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember-me">Remember me</label>
            </div>
            <button className="forgot-password">Forgot password?</button>
          </div>
          
          <button type="submit" className="login-button">Login</button>
          
          {error && <p className="error-message">{error}</p>}
          
          <p className="register-link">Don't have an account? <button className="register-button">Register</button></p>
        </form>
      </div>
    </div>
  );
}

export default Login;
