import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { wishlist, toggleWishlist, addToCart, cart } = useContext(AppContext);
  const navigate = useNavigate();

  const handleBuyNow = () => {
    navigate('/checkout', {
      state: {
        directBuyItem: {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images[0],
          qty: 1
        }
      }
    });
  };

  const isWishlisted = wishlist.includes(product.id);
  const isInCart = cart.some(item => item.id === product.id && !item.saveLater);

  const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <div className="product-card card card-hover animate-fade-in">
      <div className="card-image-container">
        <img src={product.images[0]} alt={product.name} loading="lazy" />
        {discountPercent > 0 && <span className="discount-badge">-{discountPercent}% OFF</span>}
        <button 
          className={`wishlist-btn ${isWishlisted ? 'liked' : ''}`}
          onClick={() => toggleWishlist(product.id)}
          aria-label="Add to Wishlist"
        >
          <Heart size={18} fill={isWishlisted ? 'var(--color-accent)' : 'none'} />
        </button>
      </div>

      <div className="card-info">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name-title">
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>
        
        <div className="product-rating">
          <Star size={14} className="star-icon" fill="var(--color-secondary)" />
          <span>{product.rating.toFixed(1)}</span>
        </div>

        <div className="product-footer-price">
          <div className="price-box">
            <span className="current-price">₹{product.price}</span>
            {product.originalPrice > product.price && (
              <span className="original-price">₹{product.originalPrice}</span>
            )}
          </div>
          {product.stock === 0 ? (
            <span className="out-of-stock-label">Out of Stock</span>
          ) : (
            <div className="card-actions-group">
              <button 
                className={`add-cart-icon-btn btn ${isInCart ? 'btn-secondary' : 'btn-primary'}`}
                onClick={() => addToCart(product.id, 1)}
                title={isInCart ? 'Add another' : 'Add to Cart'}
              >
                <ShoppingCart size={14} />
                {isInCart ? 'Added' : 'Add'}
              </button>
              <button 
                className="btn btn-accent direct-buy-btn"
                onClick={handleBuyNow}
              >
                Buy
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
