import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { ShoppingBag, Heart, User, Search, Shield, Truck, Menu, X, LogOut, Compass } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { activeRole, switchRole, cart, wishlist, currentUser, logoutUser } = useContext(AppContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const activeCartCount = cart.filter(item => !item.saveLater).reduce((acc, item) => acc + item.qty, 0);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const renderCustomerNav = () => (
    <>
      <div className="nav-logo">
        <Link to="/">
          <span className="logo-accent">ॐ</span> Puja<span>Samagri</span>
        </Link>
      </div>

      {currentUser && (
        <form className="nav-search-bar" onSubmit={handleSearchSubmit}>
          <input 
            type="text" 
            placeholder="Search Agarbatti, Diyas, Puja Thali..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">
            <Search size={18} />
          </button>
        </form>
      )}

      <nav className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {currentUser ? (
          <>
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/shop" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
            {currentUser?.role === 'admin' && (
              <Link 
                to="/admin" 
                onClick={() => { switchRole('admin'); setMobileMenuOpen(false); }}
                className="admin-portal-link"
                style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}
              >
                <Shield size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                Admin Portal
              </Link>
            )}
            <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>My Profile</Link>
            <div className="nav-actions">
              <Link to="/wishlist" className="action-btn" title="Wishlist" onClick={() => setMobileMenuOpen(false)}>
                <Heart size={20} />
                {wishlist.length > 0 && <span className="action-badge">{wishlist.length}</span>}
              </Link>
              <Link to="/cart" className="action-btn" title="Shopping Cart" onClick={() => setMobileMenuOpen(false)}>
                <ShoppingBag size={20} />
                {activeCartCount > 0 && <span className="action-badge">{activeCartCount}</span>}
              </Link>
              <Link to="/profile" className="profile-trigger" title="User Profile" onClick={() => setMobileMenuOpen(false)}>
                <div className="avatar">{currentUser?.name?.charAt(0) || 'U'}</div>
                <span className="user-name">{currentUser?.name?.split(' ')[0]}</span>
              </Link>
              <button 
                className="action-btn logout-nav-btn" 
                onClick={() => { logoutUser(); navigate('/auth'); setMobileMenuOpen(false); }}
                title="Logout"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px', display: 'flex', alignItems: 'center', color: 'var(--color-accent)' }}
              >
                <LogOut size={20} />
              </button>
            </div>
          </>
        ) : (
          <Link to="/auth" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>Sign In</Link>
        )}
      </nav>

      <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </>
  );

  const renderAdminNav = () => (
    <>
      <div className="nav-logo">
        <Link to="/admin">
          <span className="logo-accent"><Shield size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /></span> Admin<span>Portal</span>
        </Link>
      </div>

      <nav className={`nav-links admin-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
        <Link to="/admin/products" onClick={() => setMobileMenuOpen(false)}>Products</Link>
        <Link to="/admin/orders" onClick={() => setMobileMenuOpen(false)}>Orders</Link>
        <Link to="/admin/coupons" onClick={() => setMobileMenuOpen(false)}>Coupons</Link>
        <div className="nav-actions">
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => { switchRole('customer'); navigate('/'); setMobileMenuOpen(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Compass size={14} /> Shop View
          </button>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => { logoutUser(); navigate('/auth'); setMobileMenuOpen(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-accent)' }}
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </nav>

      <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </>
  );

  const renderDeliveryNav = () => (
    <>
      <div className="nav-logo">
        <Link to="/delivery">
          <span className="logo-accent"><Truck size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /></span> Delivery<span>Console</span>
        </Link>
      </div>

      <nav className={`nav-links delivery-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <Link to="/delivery" onClick={() => setMobileMenuOpen(false)}>My Deliveries</Link>
        <div className="nav-actions">
          <div className="delivery-badge">
            <span className="online-indicator"></span> Executive Mode
          </div>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => { switchRole('customer'); navigate('/'); setMobileMenuOpen(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Compass size={14} /> Shop View
          </button>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => { logoutUser(); navigate('/auth'); setMobileMenuOpen(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-accent)' }}
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </nav>

      <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </>
  );

  return (
    <header className="main-navbar-header glass-light">
      <div className="container navbar-container">
        {activeRole === 'admin' ? renderAdminNav() : activeRole === 'delivery' ? renderDeliveryNav() : renderCustomerNav()}
      </div>
    </header>
  );
}
