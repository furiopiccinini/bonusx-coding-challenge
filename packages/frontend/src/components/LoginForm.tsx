import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { AuthResponse, LoginData } from '../types';

interface LoginFormProps {
  onAuthSuccess: (authData: AuthResponse) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onAuthSuccess }) => {
  const [formData, setFormData] = useState<LoginData>({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(undefined);

    try {
      const authData = await authAPI.login(formData);
      onAuthSuccess(authData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="auth-container">
      <div className="card">
        <h2>Login</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
          Use demo/demo to login
        </p>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="input"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input"
              required
            />
          </div>
          
          <button
            type="submit"
            className="btn"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? (
              <span className="loading"></span>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm; 