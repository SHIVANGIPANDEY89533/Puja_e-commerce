import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import ProductCard from '../../components/user/ProductCard';
import { Heart } from 'lucide-react';
import './Wishlist.css';

export default function Wishlist() {
  const { wishlist, products } = useContext(AppContext);
  const navigate = useNavigate();

  // Find products that are wishlisted
  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="wishlist-page container">
      <div className="wishlist-header text-left">
        <h1 className="title-lg">My Wishlist</h1>
        <p className="wishlist-sub">You have {wishlistedProducts.length} items saved in your sacred list</p>
      </div>

      {wishlistedProducts.length === 0 ? (
        <div className="empty-wishlist-card card glass text-center" style={{ padding: '60px 40px' }}>
          <Heart size={48} className="empty-heart-icon" />
          <h2>Your Wishlist is empty</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Save items you love here to easily purchase them for upcoming festivals and rituals.</p>
          <button className="btn btn-primary" onClick={() => navigate('/shop')}>
            Go to Shop
          </button>
        </div>
      ) : (
        <div className="grid-4">
          {wishlistedProducts.map(prod => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
}
