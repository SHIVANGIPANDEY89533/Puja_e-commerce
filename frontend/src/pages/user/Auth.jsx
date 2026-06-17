import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { LogIn, UserPlus, KeyRound, Mail, Shield, User, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import './Auth.css';

export default function Auth() {
  const { loginUser } = useContext(AppContext);
  const navigate = useNavigate();

  // Tabs: 'customer' | 'admin'
  const [activeTab, setActiveTab] = useState('customer');
  // Mode state within devotee portal: 'login' | 'register' | 'reset'
  const [mode, setMode] = useState('login');

  // Input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAutofill = (role) => {
    setErrorMsg('');
    setSuccessMsg('');
    if (role === 'customer') {
      setActiveTab('customer');
      setMode('login');
      setEmail('customer@gmail.com');
      setPassword('customer123');
    } else if (role === 'admin') {
      setActiveTab('admin');
      setEmail('admin@pujasamagri.com');
      setPassword('admin123');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (activeTab === 'admin') {
      // Admin Authentication Check
      if (email.trim() === 'admin@pujasamagri.com' && password === 'admin123') {
        loginUser({
          id: 'admin-1',
          name: 'Portal Administrator',
          email: 'admin@pujasamagri.com',
          role: 'admin',
          mobile: '9999988888',
          address: 'Main Temple Complex HQ, Haridwar'
        }, 'admin');
        setSuccessMsg('Admin Authenticated! Redirecting to Dashboard...');
        setTimeout(() => {
          navigate('/admin');
        }, 800);
      } else {
        setErrorMsg('Access Denied. Invalid admin email or password.');
      }
    } else {
      // Customer Authentication
      if (mode === 'login') {
        if (email && password) {
          const userName = email.split('@')[0].toUpperCase();
          loginUser({
            id: 'cust-' + Math.floor(1000 + Math.random() * 9000),
            name: userName === 'CUSTOMER' ? 'Rahul Dev' : userName,
            email: email.trim(),
            role: 'customer',
            mobile: '9876543210',
            address: '102, Shanti Kunj, Park Street, New Delhi - 110001'
          }, 'customer');
          setSuccessMsg('Welcome back! Directing to store...');
          setTimeout(() => {
            navigate('/');
          }, 800);
        } else {
          setErrorMsg('Please provide both email and password.');
        }
      } else if (mode === 'register') {
        if (name && email && password) {
          setSuccessMsg('Devotee registration successful! Please login.');
          setMode('login');
          setName('');
          setPassword('');
          setMobile('');
          setAddress('');
        } else {
          setErrorMsg('Please fill in all mandatory fields.');
        }
      } else {
        // Reset password
        if (email) {
          setSuccessMsg('A password recovery email has been sent.');
          setMode('login');
          setEmail('');
        } else {
          setErrorMsg('Please enter your registered email address.');
        }
      }
    }
  };

  return (
    <div className="auth-page flex-center container">
      <div className="card auth-card text-left animate-fade-in glass-light">
        <div className="auth-header text-center">
          <div className="om-symbol-header">ॐ</div>
          <h2>Puja<span>Samagri</span></h2>
          <p className="auth-sub">Digital Spiritual Ecosystem & Services</p>
        </div>

        {/* Portal Switching Tabs */}
        <div className="auth-tabs">
          <button 
            type="button" 
            className={`auth-tab-btn ${activeTab === 'customer' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('customer');
              setMode('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
          >
            <User size={16} />
            <span>Devotee Login</span>
          </button>
          <button 
            type="button" 
            className={`auth-tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('admin');
              setErrorMsg('');
              setSuccessMsg('');
            }}
          >
            <Shield size={16} />
            <span>Portal Admin</span>
          </button>
        </div>

        {/* Status Alerts */}
        {successMsg && (
          <div className="auth-alert success animate-fade-in">
            <CheckCircle size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="auth-alert error animate-fade-in">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="query-form auth-form-container">
          {activeTab === 'customer' && mode === 'register' && (
            <div className="form-group animate-slide-down">
              <label className="form-label">Full Name *</label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Rahul Dev"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input 
                type="email" 
                className="form-input" 
                placeholder={activeTab === 'admin' ? "admin@pujasamagri.com" : "e.g. rahul@gmail.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>

          {activeTab === 'customer' && mode === 'register' && (
            <div className="form-group animate-slide-down">
              <label className="form-label">Mobile Number</label>
              <input 
                type="tel" 
                className="form-input" 
                placeholder="e.g. 9876543210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>
          )}

          {activeTab === 'customer' && mode === 'register' && (
            <div className="form-group animate-slide-down">
              <label className="form-label">Delivery Address</label>
              <textarea 
                className="form-input" 
                rows="2"
                placeholder="Enter standard delivery address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          )}

          {(activeTab === 'admin' || mode !== 'reset') && (
            <div className="form-group">
              <label className="form-label">Password *</label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full btn-lg auth-submit-btn">
            {activeTab === 'admin' ? (
              <><Shield size={18} /> Admin Sign In</>
            ) : mode === 'login' ? (
              <><LogIn size={18} /> Devotee Entry</>
            ) : mode === 'register' ? (
              <><UserPlus size={18} /> Create Account</>
            ) : (
              <><KeyRound size={18} /> Request Password Reset</>
            )}
          </button>
        </form>

        {/* Demo Credentials Helper Card */}
        <div className="demo-credentials-card">
          <span className="demo-title">Sandbox Quick Test Fill:</span>
          <div className="demo-buttons">
            <button 
              type="button" 
              className="demo-pill customer-pill" 
              onClick={() => handleAutofill('customer')}
            >
              Devotee Demo
            </button>
            <button 
              type="button" 
              className="demo-pill admin-pill" 
              onClick={() => handleAutofill('admin')}
            >
              Admin Demo
            </button>
          </div>
        </div>

        {/* Auth Toggle Footer */}
        {activeTab === 'customer' && (
          <div className="auth-footer text-center flex-column gap-sm" style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
            {mode === 'login' ? (
              <>
                <button className="auth-toggle-btn" onClick={() => setMode('register')}>New Devotee? <b>Register Account</b></button>
                <button className="auth-toggle-btn" onClick={() => setMode('reset')}>Forgot password? <b>Reset</b></button>
              </>
            ) : mode === 'register' ? (
              <button className="auth-toggle-btn" onClick={() => setMode('login')}>Already registered? <b>Devotee Login</b></button>
            ) : (
              <button className="auth-toggle-btn" onClick={() => setMode('login')}>Return to <b>Devotee Login</b></button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
