import React, { useState } from 'react';
import './SignUp.css';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await fetch('http://localhost:3011/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email, password }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

       
        if (data.message === 'User registered successfully!') {
          navigate('/');  
        } else {
          setErrors({ general: data.message });
        }
      } catch (error) {
        console.error('Error during registration:', error);
        setErrors({ general: 'An error occurred. Please try again later.' });
      }
    } else {
      setErrors(validationErrors);  
    }
  };

  const validateForm = () => {
    const validationErrors = {};
    if (!name) validationErrors.name = 'Name is required';
    if (!email) validationErrors.email = 'Email is required';
    if (!password) validationErrors.password = 'Password is required';
    else if (password.length < 6) validationErrors.password = 'Password must be at least 6 characters';
    return validationErrors;
  };

  return (
    <div className="onboard"
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
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <p className="error-message">{errors.name}</p>}
        </div>

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

        <button type="submit">Sign Up</button>
      </form>

      <div className="login-link">
        <p>Already have an account? <a href="/login">Login</a></p>
      </div>
    </div>
    </div>
  );
};

export default SignUp;
