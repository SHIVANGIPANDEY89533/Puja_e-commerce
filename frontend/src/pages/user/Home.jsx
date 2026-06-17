import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import ProductCard from '../../components/user/ProductCard';
import { Sparkles, MessageCircle, Send, Star, HelpCircle } from 'lucide-react';
import './Home.css';

export default function Home() {
  const { products, addQuery } = useContext(AppContext);
  const navigate = useNavigate();
  
  // Query Form State
  const [queryName, setQueryName] = useState('');
  const [queryEmail, setQueryEmail] = useState('');
  const [querySubject, setQuerySubject] = useState('');
  const [queryMsg, setQueryMsg] = useState('');
  const [querySubmitted, setQuerySubmitted] = useState(false);

  const categories = [
    { name: 'Agarbatti', icon: '🪔', desc: 'Incense Sticks' },
    { name: 'Dhoop', icon: '🪵', desc: 'Resin Cones & Cups' },
    { name: 'Camphor', icon: '💎', desc: 'Pure Kapur' },
    { name: 'Puja Thali', icon: '🍽️', desc: 'Plate Sets' },
    { name: 'Diyas', icon: '🪔', desc: 'Clay & Brass Lamps' },
    { name: 'Festival Kits', icon: '🎁', desc: 'All-In-One Kits' },
    { name: 'Religious Books', icon: '📖', desc: 'Sacred Texts' },
    { name: 'Spiritual Products', icon: '📿', desc: 'Malas & Beads' }
  ];

  // Get featured products (top 4 rated)
  const featuredProducts = [...products]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  const handleQuerySubmit = (e) => {
    e.preventDefault();
    if (queryName && queryEmail && queryMsg) {
      addQuery({
        user: queryName,
        email: queryEmail,
        subject: querySubject || 'General Inquiry',
        message: queryMsg
      });
      setQuerySubmitted(true);
      setQueryName('');
      setQueryEmail('');
      setQuerySubject('');
      setQueryMsg('');
      setTimeout(() => setQuerySubmitted(false), 5000);
    }
  };

  return (
    <div className="home-page-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-content text-left animate-fade-in">
            <span className="hero-tagline"><Sparkles size={16} /> Premium Spiritual Marketplace</span>
            <h1 className="title-xl">Invite Divinity into Your Daily Rituals</h1>
            <p className="hero-subtitle">
              Sourced directly from sacred locations across India. Experience hand-rolled agarbatti, chemical-free camphor, pure Gangajal, and artisanal thalis.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/shop')}>
                Shop Collection
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => navigate('/shop?category=Festival%20Kits')}>
                Festival Kits
              </button>
            </div>
          </div>
          <div className="hero-visual-frame flex-center">
            <div className="glowing-orb"></div>
            <img 
              src="https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=800&auto=format&fit=crop&q=80" 
              alt="Sacred Puja Thali Altar" 
              className="hero-image"
            />
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="categories-section container">
        <div className="section-header text-center">
          <span className="section-tag font-bold">Explore Collections</span>
          <h2 className="title-lg">Shop by Auspicious Category</h2>
        </div>
        <div className="categories-grid grid-4">
          {categories.map((cat, idx) => (
            <Link 
              key={idx} 
              to={`/shop?category=${encodeURIComponent(cat.name)}`} 
              className="category-card card card-hover text-center"
            >
              <span className="category-emoji">{cat.icon}</span>
              <h4>{cat.name}</h4>
              <p>{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section container">
        <div className="section-header flex-between">
          <div>
            <span className="section-tag">Auspicious Picks</span>
            <h2 className="title-lg">Best Selling Products</h2>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/shop')}>
            View All Products
          </button>
        </div>
        <div className="grid-4">
          {featuredProducts.map(prod => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* Promotional Marketing Banner */}
      <section className="promo-banner-section">
        <div className="container promo-banner card glass">
          <div className="promo-content">
            <span className="badge badge-warning">Festival Offer</span>
            <h3>Up to 20% Off on Diwali Puja Kits</h3>
            <p>Get ready for festive celebrations with all ritual items packed into one beautiful wooden chest. Apply coupon <b>FESTIVAL20</b> during checkout.</p>
            <button className="btn btn-primary" onClick={() => navigate('/shop?category=Festival%20Kits')}>
              Claim Offer
            </button>
          </div>
        </div>
      </section>

      {/* Customer Help Queries Section */}
      <section className="queries-form-section container">
        <div className="queries-grid">
          <div className="queries-info text-left">
            <span className="section-tag">Customer Care</span>
            <h2 className="title-lg">Do You Have a Spiritual Question or Order Query?</h2>
            <p className="queries-sub">
              Our experts at Cyvanta Tech are happy to assist. Submit a query ticket, and we will update you in real time. You can track tickets in the Admin Panel.
            </p>
            <div className="feature-bullets">
              <div className="bullet-item">
                <HelpCircle className="bullet-icon" />
                <span>Custom sizing for home temples</span>
              </div>
              <div className="bullet-item">
                <HelpCircle className="bullet-icon" />
                <span>Urgent bulk deliveries for events</span>
              </div>
              <div className="bullet-item">
                <HelpCircle className="bullet-icon" />
                <span>Ritual guidebook advice requests</span>
              </div>
            </div>
          </div>
          <div className="queries-card-container">
            <div className="card glass-light">
              <h3 className="card-title">Submit Support Ticket</h3>
              {querySubmitted ? (
                <div className="query-success-msg animate-fade-in text-center">
                  <MessageCircle size={36} className="success-icon" />
                  <h4>Ticket Submitted Successfully!</h4>
                  <p>A support executive has been allocated. You can view this ticket immediately on the Admin Panel under Support Queries.</p>
                </div>
              ) : (
                <form onSubmit={handleQuerySubmit} className="query-form">
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="e.g. Rahul Dev" 
                        value={queryName} 
                        onChange={(e) => setQueryName(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address *</label>
                      <input 
                        type="email" 
                        className="form-input" 
                        placeholder="e.g. rahul@gmail.com" 
                        value={queryEmail} 
                        onChange={(e) => setQueryEmail(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Delivery request / Bulk order" 
                      value={querySubject} 
                      onChange={(e) => setQuerySubject(e.target.value)} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Message / Query *</label>
                    <textarea 
                      rows="3" 
                      className="form-input" 
                      placeholder="Detail your request here..." 
                      value={queryMsg} 
                      onChange={(e) => setQueryMsg(e.target.value)} 
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary w-full">
                    <Send size={16} /> Submit Ticket
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="testimonials-section container">
        <div className="section-header text-center">
          <span className="section-tag">Blessed Experiences</span>
          <h2 className="title-lg">What Our Devotees Say</h2>
        </div>
        <div className="grid-3">
          <div className="card testimonial-card">
            <div className="stars">
              <Star size={16} fill="var(--color-secondary)" />
              <Star size={16} fill="var(--color-secondary)" />
              <Star size={16} fill="var(--color-secondary)" />
              <Star size={16} fill="var(--color-secondary)" />
              <Star size={16} fill="var(--color-secondary)" />
            </div>
            <p className="quote">"The premium Bhimseni camphor has zero residues and smells amazingly pure. Fast delivery to Delhi!"</p>
            <div className="reviewer">
              <span className="reviewer-avatar">VS</span>
              <div className="reviewer-info">
                <h5>Vikram Singh</h5>
                <span>Verified Buyer</span>
              </div>
            </div>
          </div>
          <div className="card testimonial-card">
            <div className="stars">
              <Star size={16} fill="var(--color-secondary)" />
              <Star size={16} fill="var(--color-secondary)" />
              <Star size={16} fill="var(--color-secondary)" />
              <Star size={16} fill="var(--color-secondary)" />
              <Star size={16} fill="var(--color-secondary)" />
            </div>
            <p className="quote">"I ordered the Diwali Laxmi Puja kit. It had all 30+ items listed in the description, packed perfectly. Saved me so much running around!"</p>
            <div className="reviewer">
              <span className="reviewer-avatar">AD</span>
              <div className="reviewer-info">
                <h5>Anjali Dwivedi</h5>
                <span>Verified Buyer</span>
              </div>
            </div>
          </div>
          <div className="card testimonial-card">
            <div className="stars">
              <Star size={16} fill="var(--color-secondary)" />
              <Star size={16} fill="var(--color-secondary)" />
              <Star size={16} fill="var(--color-secondary)" />
              <Star size={16} fill="var(--color-secondary)" />
              <Star size={16} fill="none" />
            </div>
            <p className="quote">"Beautifully designed brass Thali. Weighted and polished perfectly. Customer service solved my shipping queries immediately."</p>
            <div className="reviewer">
              <span className="reviewer-avatar">RK</span>
              <div className="reviewer-info">
                <h5>Ram Krishna</h5>
                <span>Verified Buyer</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
