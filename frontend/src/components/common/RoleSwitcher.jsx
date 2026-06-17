import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { Shield, User, Truck, ChevronUp, ChevronDown, Moon, Sun } from 'lucide-react';
import './RoleSwitcher.css';

export default function RoleSwitcher() {
  const { activeRole, switchRole } = useContext(AppContext);
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('pujasamagri_theme') || 'light';
  });

  // Toggle theme (light/dark mode)
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('pujasamagri_theme', newTheme);
  };

  // Sync theme on mount
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const roles = [
    { id: 'customer', label: 'Customer Panel', icon: User, desc: 'Shop & track orders' },
    { id: 'admin', label: 'Admin Dashboard', icon: Shield, desc: 'Manage products & orders' },
    { id: 'delivery', label: 'Delivery Executive', icon: Truck, desc: 'Deliver assigned packages' }
  ];

  const currentRoleObj = roles.find(r => r.id === activeRole) || roles[0];

  return (
    <div className={`role-switcher-container ${isOpen ? 'open' : ''}`}>
      {isOpen && (
        <div className="role-switcher-menu card glass-light animate-fade-in">
          <div className="menu-header">
            <h4>Workspace Sandbox</h4>
            <p>Switch panels to test interactions</p>
          </div>
          <div className="role-list">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.id}
                  className={`role-btn ${activeRole === role.id ? 'active' : ''}`}
                  onClick={() => {
                    switchRole(role.id);
                    setIsOpen(false);
                  }}
                >
                  <Icon className="role-icon" size={18} />
                  <div className="role-info">
                    <span className="role-label">{role.label}</span>
                    <span className="role-desc">{role.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="menu-footer">
            <button className="theme-toggle-btn btn btn-secondary btn-sm" onClick={toggleTheme}>
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              <span>Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode</span>
            </button>
          </div>
        </div>
      )}

      <button className="role-switcher-fab btn btn-primary" onClick={() => setIsOpen(!isOpen)}>
        {React.createElement(currentRoleObj.icon, { size: 20 })}
        <span className="fab-text">Testing: {currentRoleObj.label}</span>
        {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </button>
    </div>
  );
}
