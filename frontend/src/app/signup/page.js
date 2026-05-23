'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signup } from '../../services/auth';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signup(email, password, fullName);
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-wrapper">
        <h1>Create Account</h1>
        {success ? (
          <div className="success-message">Account created successfully! Redirecting...</div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Sign Up'}
            </button>
            
            <p className="redirect-link">
              Already have an account? <a href="/login">Login</a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
