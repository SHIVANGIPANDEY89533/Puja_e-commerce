import React, { useContext, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { Star, ShoppingCart, Heart, ShieldAlert, Award, RefreshCw, Send } from 'lucide-react';
import './ProductDetails.css';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, reviews, addToCart, toggleWishlist, wishlist, addReview } = useContext(AppContext);

  const product = products.find(p => p.id === Number(id));

  // State
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Sync initial image on mount or product change
  React.useEffect(() => {
    if (product) {
      setActiveImage(product.images[0]);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="product-details-page container text-center" style={{ padding: '80px 20px' }}>
        <h2>Sacred item not found</h2>
        <p>The product you are trying to view does not exist in our catalog.</p>
        <button className="btn btn-primary" onClick={() => navigate('/shop')}>
          Back to Shop
        </button>
      </div>
    );
  }

  const isWishlisted = wishlist.includes(product.id);
  const productReviews = reviews[product.id] || [];
  const averageRating = productReviews.length > 0
    ? productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length
    : product.rating;

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
  };

  const handleBuyNow = () => {
    navigate('/checkout', {
      state: {
        directBuyItem: {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images[0],
          qty: quantity
        }
      }
    });
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (reviewComment.trim()) {
      addReview(product.id, reviewRating, reviewComment.trim());
      setReviewComment('');
      setReviewSubmitted(true);
      setTimeout(() => setReviewSubmitted(false), 4000);
    }
  };

  // Get related products (same category, excluding current)
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="product-details-page container">
      {/* Breadcrumbs */}
      <div className="breadcrumbs text-left">
        <Link to="/">Home</Link> &gt; <Link to="/shop">Shop</Link> &gt; <Link to={`/shop?category=${product.category}`}>{product.category}</Link> &gt; <span>{product.name}</span>
      </div>

      {/* Main product card */}
      <div className="product-info-grid">
        {/* Left column: Images */}
        <div className="gallery-column">
          <div className="main-image-box">
            <img src={activeImage} alt={product.name} />
          </div>
          {product.images.length > 1 && (
            <div className="thumbnails-row">
              {product.images.map((img, idx) => (
                <button 
                  key={idx} 
                  className={`thumb-btn ${activeImage === img ? 'active' : ''}`}
                  onClick={() => setActiveImage(img)}
                >
                  <img src={img} alt={`thumbnail-${idx}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Details */}
        <div className="details-column text-left">
          <span className="details-category">{product.category}</span>
          <h1 className="details-name">{product.name}</h1>

          <div className="rating-row">
            <div className="stars flex-center">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star 
                  key={s} 
                  size={18} 
                  fill={s <= Math.round(averageRating) ? 'var(--color-secondary)' : 'none'} 
                  className="star-icon" 
                />
              ))}
            </div>
            <span className="rating-count">({productReviews.length} Customer Reviews)</span>
          </div>

          <div className="price-row">
            <span className="current-price">₹{product.price}</span>
            {product.originalPrice > product.price && (
              <>
                <span className="original-price">₹{product.originalPrice}</span>
                <span className="discount-tag">Save ₹{product.originalPrice - product.price}</span>
              </>
            )}
          </div>

          <p className="details-desc">{product.description}</p>

          <div className="features-list">
            {product.features?.map((feat, idx) => (
              <div key={idx} className="feat-item">
                <span className="bullet">✓</span>
                <span>{feat}</span>
              </div>
            ))}
          </div>

          {/* Availability */}
          <div className="stock-status-row">
            <span className="status-label">Availability:</span>
            {product.stock === 0 ? (
              <span className="badge badge-danger">Out of Stock</span>
            ) : product.stock <= 5 ? (
              <span className="badge badge-warning">Low Stock ({product.stock} left)</span>
            ) : (
              <span className="badge badge-success">In Stock ({product.stock} available)</span>
            )}
          </div>

          {/* Action Row */}
          {product.stock > 0 && (
            <div className="action-row flex-center gap-md">
              <div className="qty-selector">
                <button onClick={() => setQuantity(prev => Math.max(1, prev - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}>+</button>
              </div>

              <button className="btn btn-primary btn-lg flex-grow flex-center gap-sm" onClick={handleAddToCart}>
                <ShoppingCart size={20} /> Add to Cart
              </button>

              <button className="btn btn-accent btn-lg flex-grow flex-center gap-sm" onClick={handleBuyNow}>
                Buy Now
              </button>

              <button 
                className={`wishlist-btn-large btn btn-secondary btn-lg ${isWishlisted ? 'active' : ''}`}
                onClick={() => toggleWishlist(product.id)}
                title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart size={20} fill={isWishlisted ? 'var(--color-accent)' : 'none'} />
              </button>
            </div>
          )}

          {/* Trust points */}
          <div className="trust-points-grid grid-3">
            <div className="trust-item card">
              <Award size={20} className="trust-icon" />
              <span>100% Organic</span>
            </div>
            <div className="trust-item card">
              <RefreshCw size={20} className="trust-icon" />
              <span>Easy Return</span>
            </div>
            <div className="trust-item card">
              <ShieldAlert size={20} className="trust-icon" />
              <span>Secure Pay</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="product-reviews-section">
        <div className="reviews-header text-left">
          <h2 className="title-md">Devotee Reviews ({productReviews.length})</h2>
        </div>

        <div className="reviews-layout-grid">
          {/* List Reviews */}
          <div className="reviews-list-box flex-column gap-md">
            {productReviews.length === 0 ? (
              <div className="card text-center" style={{ padding: '40px' }}>
                <p style={{ color: 'var(--text-secondary)' }}>No reviews yet. Be the first to share your auspicious experience!</p>
              </div>
            ) : (
              productReviews.map(rev => (
                <div key={rev.id} className="card review-item-card text-left">
                  <div className="review-meta flex-between">
                    <div className="reviewer-info-box">
                      <span className="rev-name">{rev.user}</span>
                      <span className="rev-date">{rev.date}</span>
                    </div>
                    <div className="stars flex-center">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star 
                          key={s} 
                          size={14} 
                          fill={s <= rev.rating ? 'var(--color-secondary)' : 'none'} 
                          className="star-icon" 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="rev-comment">"{rev.comment}"</p>
                </div>
              ))
            )}
          </div>

          {/* Submit Review */}
          <div className="submit-review-box">
            <div className="card glass-light text-left">
              <h3 className="card-title" style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Leave a Review</h3>
              {reviewSubmitted ? (
                <div className="success-msg animate-fade-in" style={{ color: 'hsl(142, 72%, 29%)', padding: '20px 0' }}>
                  ✓ Review submitted! Thank you for sharing your experience.
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="query-form">
                  <div className="form-group">
                    <label className="form-label">Rating</label>
                    <div className="rating-select-stars">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button 
                          key={s} 
                          type="button" 
                          className="star-rating-button"
                          onClick={() => setReviewRating(s)}
                        >
                          <Star 
                            size={24} 
                            fill={s <= reviewRating ? 'var(--color-secondary)' : 'none'} 
                            className="star-icon" 
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Review Details *</label>
                    <textarea 
                      rows="3" 
                      className="form-input" 
                      placeholder="Share your experience with this puja samagri..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary w-full">
                    <Send size={16} /> Submit Review
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="related-products-section">
          <div className="reviews-header text-left" style={{ marginBottom: '24px' }}>
            <h2 className="title-md">Related Auspicious Products</h2>
          </div>
          <div className="grid-4">
            {relatedProducts.map(prod => (
              <div key={prod.id} className="related-card-wrapper">
                <div className="card card-hover text-left" style={{ padding: '12px' }}>
                  <img 
                    src={prod.images[0]} 
                    alt={prod.name} 
                    style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} 
                  />
                  <h4 style={{ fontSize: '0.875rem', marginTop: '12px', minHeight: '36px', overflow: 'hidden' }}>
                    <Link to={`/product/${prod.id}`}>{prod.name}</Link>
                  </h4>
                  <div className="flex-between" style={{ marginTop: '8px' }}>
                    <span style={{ fontWeight: '800' }}>₹{prod.price}</span>
                    <Link to={`/product/${prod.id}`} className="btn btn-primary btn-sm" style={{ padding: '4px 8px' }}>View</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
