import React, { useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { CreditCard, Truck, Landmark, Wallet, CheckCircle, ArrowLeft } from 'lucide-react';
import './Checkout.css';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, placeOrder, currentUser } = useContext(AppContext);

  // Capture discount from cart page state
  const discountAmount = location.state?.discountAmount || 0;

  // Form State
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.mobile || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [city, setCity] = useState('New Delhi');
  const [pincode, setPincode] = useState('110001');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isOrdering, setIsOrdering] = useState(false);

  const directBuyItem = location.state?.directBuyItem;
  const activeCartItems = directBuyItem ? [directBuyItem] : cart.filter(item => !item.saveLater);
  const subtotal = activeCartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const deliveryCharge = subtotal > 500 ? 0 : 49;
  const total = Math.max(0, subtotal - discountAmount + deliveryCharge);

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !address || !city || !pincode) {
      alert('Please fill out all shipping fields.');
      return;
    }

    setIsOrdering(true);

    // Simulate payment gateway delay
    setTimeout(() => {
      const order = placeOrder(
        { name, email, phone, address, city, pincode },
        paymentMethod,
        discountAmount,
        directBuyItem ? [directBuyItem] : null
      );

      setIsOrdering(false);
      if (order) {
        navigate(`/order-tracking/${order.id}`);
      }
    }, 2000);
  };

  if (activeCartItems.length === 0) {
    return (
      <div className="checkout-page container text-center" style={{ padding: '80px 20px' }}>
        <h2>No items in checkout</h2>
        <p>Add items to your cart before proceeding to checkout.</p>
        <button className="btn btn-primary" onClick={() => navigate('/shop')}>
          Go to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page container">
      {/* Back to Cart */}
      <div className="back-link text-left">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/cart')}>
          <ArrowLeft size={16} /> Back to Cart
        </button>
      </div>

      <div className="checkout-title-box text-left">
        <h1 className="title-lg">Checkout</h1>
      </div>

      {isOrdering ? (
        <div className="ordering-overlay card glass text-center flex-column flex-center gap-md">
          <div className="spinner"></div>
          <h2>Processing Payment Gateway</h2>
          <p>Please do not refresh the page or click back. Securing connection with your bank...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmitOrder} className="checkout-layout-grid">
          {/* Shipping Form */}
          <div className="card shipping-form-card text-left">
            <h3 className="checkout-section-title">Shipping Address</h3>
            <div className="form-group">
              <label className="form-label">Recipient Name *</label>
              <input 
                type="text" 
                className="form-input" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>
            
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input 
                  type="tel" 
                  className="form-input" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Street Address *</label>
              <input 
                type="text" 
                className="form-input" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                required 
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">City *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Pincode *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={pincode} 
                  onChange={(e) => setPincode(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <h3 className="checkout-section-title" style={{ marginTop: '30px' }}>Payment Method</h3>
            <div className="payment-methods-list">
              <label className={`payment-method-item ${paymentMethod === 'UPI' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="UPI" 
                  checked={paymentMethod === 'UPI'} 
                  onChange={() => setPaymentMethod('UPI')}
                />
                <Wallet className="payment-icon" />
                <div className="payment-label-details">
                  <span className="pay-title">UPI (GPay / PhonePe / Paytm)</span>
                  <span className="pay-sub">Pay instantly using any UPI app</span>
                </div>
              </label>

              <label className={`payment-method-item ${paymentMethod === 'Credit Card' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="Credit Card" 
                  checked={paymentMethod === 'Credit Card'} 
                  onChange={() => setPaymentMethod('Credit Card')}
                />
                <CreditCard className="payment-icon" />
                <div className="payment-label-details">
                  <span className="pay-title">Credit / Debit Card</span>
                  <span className="pay-sub">Secure pay with Visa, Mastercard, RuPay</span>
                </div>
              </label>

              <label className={`payment-method-item ${paymentMethod === 'Net Banking' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="Net Banking" 
                  checked={paymentMethod === 'Net Banking'} 
                  onChange={() => setPaymentMethod('Net Banking')}
                />
                <Landmark className="payment-icon" />
                <div className="payment-label-details">
                  <span className="pay-title">Net Banking</span>
                  <span className="pay-sub">All major Indian banks supported</span>
                </div>
              </label>

              <label className={`payment-method-item ${paymentMethod === 'Cash on Delivery' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="Cash on Delivery" 
                  checked={paymentMethod === 'Cash on Delivery'} 
                  onChange={() => setPaymentMethod('Cash on Delivery')}
                />
                <Truck className="payment-icon" />
                <div className="payment-label-details">
                  <span className="pay-title">Cash on Delivery (COD)</span>
                  <span className="pay-sub">Pay in cash or UPI at the door (+₹10 handling)</span>
                </div>
              </label>
            </div>
          </div>

          {/* Checkout billing summary */}
          <div className="checkout-summary-column text-left">
            <div className="card billing-summary-card">
              <h3 className="summary-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>Items Summary</h3>
              <div className="checkout-items-preview flex-column gap-sm">
                {activeCartItems.map(item => (
                  <div key={item.id} className="preview-item flex-between">
                    <span className="item-name-preview">{item.name} <b>x{item.qty}</b></span>
                    <span className="item-total-preview">₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>

              <div className="summary-calculations" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
                <div className="calc-row flex-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="calc-row flex-between discount">
                    <span>Discount Coupon</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="calc-row flex-between">
                  <span>Delivery Charges</span>
                  <span>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span>
                </div>
                {paymentMethod === 'Cash on Delivery' && (
                  <div className="calc-row flex-between">
                    <span>COD Handling Fee</span>
                    <span>₹10</span>
                  </div>
                )}
                <div className="calc-total-row flex-between" style={{ fontSize: '1.2rem', marginTop: '16px', paddingTop: '16px' }}>
                  <span>To Pay</span>
                  <span>₹{total + (paymentMethod === 'Cash on Delivery' ? 10 : 0)}</span>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full btn-lg place-order-btn">
                <CheckCircle size={18} /> Place Sacred Order
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
