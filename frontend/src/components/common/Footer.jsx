import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="main-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>ॐ Puja<span>Samagri</span></h3>
            <p className="brand-pitch">
              Bringing purity and divine blessings to your home. Premium quality, organic puja samagri handcrafted by Indian artisans.
            </p>
            <div className="social-links">
              <a href="#" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="#" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
            </div>
          </div>

          <div className="footer-links-col">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/shop">Browse Shop</a></li>
              <li><a href="/shop?category=Festival%20Kits">Festival Kits</a></li>
              <li><a href="/profile">My Orders</a></li>
              <li><a href="/wishlist">Wishlist</a></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>Contact Cyvanta</h4>
            <ul className="contact-list">
              <li>
                <MapPin size={16} className="contact-icon" />
                <span>Cyvanta Tech Quantum Pvt. Ltd. Engineering Chauraha, Lucknow</span>
              </li>
              <li>
                <Phone size={16} className="contact-icon" />
                <span>+91 8090121332</span>
              </li>
              <li>
                <Mail size={16} className="contact-icon" />
                <span>cyvantaquantum.com</span>
              </li>
            </ul>
          </div>

          <div className="footer-newsletter">
            <h4>Newsletter</h4>
            <p>Subscribe to receive festival alerts, special offers, and daily spiritual wisdom.</p>
            {subscribed ? (
              <div className="subscribe-success animate-fade-in">
                ✓ Thank you for subscribing!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="newsletter-form">
                <input 
                  type="email" 
                  placeholder="Enter email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
                <button type="submit" aria-label="Subscribe">
                  <Send size={16} />
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Puja Samagri E-Commerce. Developed by Cyvanta Tech Quantum Pvt. Ltd. All rights reserved.</p>
          <div className="payment-badges">
            <span>UPI</span>
            <span>VISA</span>
            <span>MASTERCARD</span>
            <span>COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
