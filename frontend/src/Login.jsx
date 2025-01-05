import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await fetch('http://localhost:3011/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (data.message === 'Login successful') {
          localStorage.setItem('token', data.token);
          setMessage('Login successful!');
          navigate('/profile');
        } else {
          setErrors({ general: data.message });
        }
      } catch (err) {
        console.error('Error during login:', err);
        setErrors({ general: 'Something went wrong. Please try again later.' });
      }
    } else {
      setErrors(validationErrors);
    }
  };

  const validateForm = () => {
    const validationErrors = {};
    if (!email) validationErrors.email = 'Email is required';
    if (!password) validationErrors.password = 'Password is required';
    return validationErrors;
  };

  return (
    <div className="onborad"
    style={{
      width: '100vw',
      height: '100vh',
      backgroundImage: `url(${process.env.PUBLIC_URL + '/back3.webp'})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed', // ✅ Prevents background scrolling
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      margin: '0',
      padding: '0'
  
  }}
>
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={errors.email ? 'error' : ''}
           
          />
          {errors.email && <p className="error-message">{errors.email}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={errors.password ? 'error' : ''}
            
          />
          {errors.password && <p className="error-message">{errors.password}</p>}
        </div>

        {errors.general && <p className="error-message">{errors.general}</p>}

        <button type="submit">Login</button>
      </form>

      {message && <p className="success-message">{message}</p>}

      <div className="signup-link">
        <p>Don't have an account? <a href="/signup">Sign Up</a></p>
      </div>
    </div>
    </div>
  );
};

export default Login;
