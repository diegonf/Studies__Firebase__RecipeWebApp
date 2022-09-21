import { useState } from 'react';
import FirebaseAuthService from '../FirebaseAuthService';
import firebase from '../FirebaseConfig';

function LoginForm({ existingUser }: { existingUser: firebase.User | null }) {
  const [userName, setUsername] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await FirebaseAuthService.loginUser(userName, password);
      setUsername('');
      setPassword('');
    } catch (error) {
      if (error instanceof (Error)) alert(error?.message);
    }
  }

  function handleLogout() {
    FirebaseAuthService.logoutUser();
  }

  async function handleSendResetPasswordEmail() {
    if(!userName) {
      alert('Missing username!');
      return;
    }

    try {
      await FirebaseAuthService.sendPasswordResetEmail(userName);
      alert('sent the password reset email');
    } catch (error) {
      if (error instanceof (Error)) alert(error?.message);
    }
  }

  return (
    <div className='login-form-container'>
      {
        existingUser ?
          <div className='row'>
            <h3>Welcome, {existingUser.email}</h3>
            <button
              type='button'
              className='primary-button'
              onClick={handleLogout}
            >
              Logout
            </button>
          </div> :
          <form
            className='login-form'
            onSubmit={handleSubmit}
          >
            <label className='input-label login-label'>
              Username (email):
              <input 
                type="email" 
                required
                value={userName}
                onChange={ (e) => setUsername(e.target.value)}
                className='input-text'
              />
            </label>
            <label className='input-label login-label'>
              Password:
              <input 
                type="password" 
                required
                value={password}
                onChange={ (e) => setPassword(e.target.value)}
                className='input-text'
              />
            </label>
            <div className='button-box'>
              <button className='primary-button'>Login</button>
              <button
                type='button'
                onClick={handleSendResetPasswordEmail}
                className='primary-button'
              >
                Reset Password
              </button>
            </div>
          </form>
      }
    </div>
  )
}

export default LoginForm;