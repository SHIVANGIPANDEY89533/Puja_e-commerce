import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { Trash2, Heart, ArrowRight, Bookmark, Tag, X } from 'lucide-react';
import './Cart.css';

export default function Cart() {
  const { cart, updateCartQty, removeFromCart, toggleSaveLater, coupons } = useContext(AppContext);
  const navigate = useNavigate();

  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  const activeCartItems = cart.filter(item => !item.saveLater);
  const savedForLaterItems = cart.filter(item => item.saveLater);

  const subtotal = activeCartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);

  // Apply Coupon
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    const coupon = coupons.find(c => c.code.toUpperCase() === couponInput.trim().toUpperCase());

    if (!coupon) {
      setCouponError('Invalid coupon code.');
      setAppliedCoupon(null);
      return;
    }
    if (!coupon.active) {
      setCouponError('This coupon is no longer active.');
      setAppliedCoupon(null);
      return;
    }
    if (subtotal < coupon.minCart) {
      setCouponError(`Minimum cart value of ₹${coupon.minCart} required.`);
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon(coupon);
    setCouponInput('');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  // Calculate discount
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') {
      discountAmount = Math.round((subtotal * appliedCoupon.discount) / 100);
    } else {
      discountAmount = appliedCoupon.discount;
    }
  }

  const deliveryCharge = subtotal > 500 || subtotal === 0 ? 0 : 49;
  const total = Math.max(0, subtotal - discountAmount + deliveryCharge);

  const handleCheckout = () => {
    if (activeCartItems.length > 0) {
      navigate('/checkout', { state: { discountAmount } });
    }
  };

  return (
    <div className="cart-page-container container">
      <div className="cart-title-header text-left">
        <h1 className="title-lg">Shopping Cart</h1>
      </div>

      {activeCartItems.length === 0 ? (
        <div className="empty-cart-card card glass text-center" style={{ padding: '60px 40px' }}>
          <h2>Your cart is empty</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Explore our handpicked collection of sacred puja samagri to invite spiritual energies into your altar.</p>
          <button className="btn btn-primary" onClick={() => navigate('/shop')}>
            Go to Shop
          </button>
        </div>
      ) : (
        <div className="cart-layout-grid">
          {/* Active Items List */}
          <div className="cart-items-column flex-column gap-md">
            {activeCartItems.map(item => (
              <div key={item.id} className="card cart-item-card flex-between text-left">
                <div className="item-details-box">
                  <img src={item.image} alt={item.name} className="item-thumbnail" />
                  <div className="item-texts">
                    <h4><Link to={`/product/${item.id}`}>{item.name}</Link></h4>
                    <span className="item-price-unit">₹{item.price} each</span>
                  </div>
                </div>

                <div className="item-actions-box flex-center gap-md">
                  <div className="qty-selector">
                    <button onClick={() => updateCartQty(item.id, item.qty - 1)}>-</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateCartQty(item.id, item.qty + 1)}>+</button>
                  </div>
                  <span className="item-total-price">₹{item.price * item.qty}</span>
                  <div className="action-buttons-wrapper">
                    <button 
                      className="action-icon-btn btn btn-secondary btn-sm"
                      onClick={() => toggleSaveLater(item.id)}
                      title="Save for Later"
                    >
                      <Bookmark size={14} />
                    </button>
                    <button 
                      className="action-icon-btn btn btn-accent btn-sm"
                      onClick={() => removeFromCart(item.id)}
                      title="Remove Item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Summary Side Card */}
          <div className="cart-summary-column">
            <div className="card cart-summary-card text-left">
              <h3 className="summary-title">Order Summary</h3>

              {/* Coupon Form */}
              <div className="coupon-box-wrapper">
                {appliedCoupon ? (
                  <div className="applied-coupon-badge flex-between">
                    <div className="flex-center gap-sm">
                      <Tag size={16} className="coupon-icon-active" />
                      <span>Applied: <b>{appliedCoupon.code}</b> (-₹{discountAmount})</span>
                    </div>
                    <button className="remove-coupon-btn" onClick={handleRemoveCoupon}>
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="coupon-form">
                    <input 
                      type="text" 
                      placeholder="Apply Promo Code (WELCOME10)" 
                      className="form-input coupon-input"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                    />
                    <button type="submit" className="btn btn-secondary btn-sm">Apply</button>
                  </form>
                )}
                {couponError && <p className="coupon-error-text animate-fade-in">{couponError}</p>}
              </div>

              {/* Financial calculations */}
              <div className="summary-calculations">
                <div className="calc-row flex-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="calc-row flex-between discount">
                    <span>Discount</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="calc-row flex-between">
                  <span>Delivery Charges</span>
                  <span>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span>
                </div>
                {deliveryCharge > 0 && (
                  <p className="free-delivery-tip">Add items worth ₹{500 - subtotal} more for FREE delivery.</p>
                )}
                <div className="calc-total-row flex-between">
                  <span>Grand Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              <button className="btn btn-primary w-full btn-lg checkout-btn" onClick={handleCheckout}>
                Proceed to Checkout <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save For Later Section */}
      {savedForLaterItems.length > 0 && (
        <div className="saved-for-later-section text-left">
          <h2 className="title-md" style={{ marginBottom: '20px' }}>Saved for Later ({savedForLaterItems.length})</h2>
          <div className="grid-2">
            {savedForLaterItems.map(item => (
              <div key={item.id} className="card cart-item-card flex-between">
                <div className="item-details-box">
                  <img src={item.image} alt={item.name} className="item-thumbnail" />
                  <div className="item-texts">
                    <h4><Link to={`/product/${item.id}`}>{item.name}</Link></h4>
                    <span className="item-price-unit">₹{item.price} each</span>
                  </div>
                </div>
                <div className="flex-center gap-md">
                  <button 
                    className="btn btn-primary btn-sm flex-center gap-sm"
                    onClick={() => toggleSaveLater(item.id)}
                  >
                    Move to Cart
                  </button>
                  <button 
                    className="btn btn-accent btn-sm"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
