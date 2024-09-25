import React, { useState } from 'react';
import axios from 'axios';

const Signup = ({ onSignup }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = () => {
    axios.post('http://localhost:3001/signup', { name, email, password })
      .then(response => {
        onSignup(response.data.token); 
      })
      .catch(error => {
        console.error('Signup error:', error);
      });
  };

  return (
    <div className="background-image-section">
      <h2>Signup</h2>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button onClick={handleSignup}>Signup</button>
      <button onClick={() => onSignup(null)}>Back to Login</button> 
    </div>
  );
};

export default Signup;