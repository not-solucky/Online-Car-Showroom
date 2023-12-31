import React, { useState } from 'react';
import axios from 'axios'
import './register.css';


export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [isSuccessfull, setisSuccessfull] = useState(false);
    const [error, setError] = useState(''); 

    const handleSubmit = async (event) => {
      event.preventDefault();
    
      try {
          const response = await axios.post('http://localhost:5000/user/signup', {
              email,
              password,
              phone: phone.trim(),
              name: name.trim(),
              address: address.trim(),
          });
    
          if (response.status === 200) {
              // Navigate to a protected route (e.g., user dashboard)
              // Replace '/dashboard' with the appropriate route
              setisSuccessfull(true)
          } else {
              console.log('Authentication faooooiled');
          }
      } catch (error) {
          console.error(error.response.data);
          setError(error.response.data.message);
      }
    
      // Reset the form
      setEmail('');
      setPassword('');
    };

    const handleNameChange = (event) => {
      setName(event.target.value);
    };
    const handlePhoneChange = (event) => {
      setPhone(event.target.value);
    };
    const handleEmailChange = (event) => {
      setEmail(event.target.value);
    };
  
    const handlePasswordChange = (event) => {
      setPassword(event.target.value);
    };

    const handleAddressChange = (e) =>{
      setAddress(e.target.value);
    }
  
    return (
        <div className="register-root-container">
        {isSuccessfull ? (
          <div className='register-success-container'><div className="register-success"><h3>Account created<br></br>Successfully</h3></div></div>
        ):(
          <div className="register-container">
          <h2>Sign Up</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={handleNameChange}
                  required
                />
            </div>
            <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="text"
                  id="phone"
                  value={phone}
                  onChange={handlePhoneChange}
                  required
                />
            </div>
            <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  id="address"
                  value={address}
                  onChange={handleAddressChange}
                  required
                />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Set password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div className="sign-up-link">
                <span>Already have an account? <a href="/login">Sign in</a> here!</span>
            </div>
            <div className="error-message">
              <span>{error}</span>
            </div>
            <div className="register-button">
              <button type="submit">Sign Up</button>
            </div>
          </form>
        </div>
        )}
      </div>
    );
}
