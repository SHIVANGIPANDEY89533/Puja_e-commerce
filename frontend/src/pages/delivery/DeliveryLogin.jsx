import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { Truck, LogIn } from 'lucide-react';
import './DeliveryLogin.css';

export default function DeliveryLogin() {
  const { loginUser } = useContext(AppContext);
  const navigate = useNavigate();

  const [execId, setExecId] = useState('exec-1');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (execId) {
      loginUser({
        id: execId,
        name: execId === 'exec-1' ? 'Amit Patel' : execId === 'exec-2' ? 'Vikram Rao' : 'Sanjay Sharma',
        role: 'delivery'
      }, 'delivery');
      navigate('/delivery');
    }
  };

  return (
    <div className="delivery-login-page flex-center container">
      <div className="card login-card text-left animate-fade-in">
        <div className="login-header text-center">
          <div className="truck-icon-circle flex-center">
            <Truck size={32} />
          </div>
          <h2>Delivery Console</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Sign in to access your assigned orders</p>
        </div>

        <form onSubmit={handleLogin} className="query-form">
          <div className="form-group">
            <label className="form-label">Select Executive Account *</label>
            <select 
              className="form-input"
              value={execId}
              onChange={(e) => setExecId(e.target.value)}
            >
              <option value="exec-1">Amit Patel (Delhi NCR)</option>
              <option value="exec-2">Vikram Rao (Noida)</option>
              <option value="exec-3">Sanjay Sharma (Gurugram)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="•••••••• (Any password)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary w-full btn-lg login-submit-btn">
            <LogIn size={18} /> Enter Console
          </button>
        </form>
      </div>
    </div>
  );
}
