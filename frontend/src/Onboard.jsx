import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Onboard.css';

const Onboard = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="onboard-page"
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
      <div className="onboard-container">
        <img src={`${process.env.PUBLIC_URL}/onboard.png`} alt="logo" className="budget" />
        <h1>Welcome to Your Budget Tracker!</h1>
        <p>Welcome to your Budget Tracker! This personal finance companion is designed to simplify how you manage your money.</p>
        <p className="demo">Please sign up or log in to continue</p>
        <div className="button-container">
          <button onClick={() => navigate('/signup')} className="signup-button">
            Sign Up
          </button>
          <button onClick={() => navigate('/login')} className="login-button">
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboard;
