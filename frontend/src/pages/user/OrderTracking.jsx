import React, { useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { 
  ShoppingBag, MapPin, CreditCard, Calendar, RefreshCw, 
  Compass, Clock, ShieldCheck, Phone, Truck 
} from 'lucide-react';
import './OrderTracking.css';

export default function OrderTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orders } = useContext(AppContext);

  const executives = [
    { id: 'exec-1', name: 'Amit Patel (Delhi NCR)', phone: '98765-43210' },
    { id: 'exec-2', name: 'Vikram Rao (Noida)', phone: '91234-56789' },
    { id: 'exec-3', name: 'Sanjay Sharma (Gurugram)', phone: '99998-88888' }
  ];

  const order = orders.find(o => o.id === orderId);

  if (!order) {
    return (
      <div className="tracking-page container text-center" style={{ padding: '80px 20px' }}>
        <h2>Order Not Found</h2>
        <p>We couldn't locate an order with ID: <b>{orderId}</b>.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Go Home
        </button>
      </div>
    );
  }

  // Map status to stepper index
  // Statuses: 'Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Delivery Failed'
  const steps = [
    { key: 'Placed', label: 'Order Placed', desc: 'Awaiting confirmation' },
    { key: 'Processing', label: 'Processing', desc: 'Preparing puja samagri' },
    { key: 'Shipped', label: 'Shipped', desc: 'Left sorting center' },
    { key: 'Out for Delivery', label: 'Out for Delivery', desc: 'Executive is nearby' },
    { key: 'Delivered', label: 'Delivered', desc: 'Delivered successfully' }
  ];

  const getStepIndex = (status) => {
    if (status === 'Delivery Failed') return 3; // Stay at out for delivery
    return steps.findIndex(s => s.key === status);
  };

  const currentStepIndex = getStepIndex(order.status);

  const matchedExec = executives.find(e => e.id === order.deliveryExecutive);

  const getTrackingStatusInfo = (status) => {
    switch (status) {
      case 'Placed':
        return {
          title: 'Awaiting Fulfillment',
          desc: 'Our sorting office is assembling your items.',
          eta: '1-2 Days',
          distance: 'Haridwar HQ',
          indicator: 'orange'
        };
      case 'Processing':
        return {
          title: 'Packaging Puja Samagri',
          desc: 'Your sacred items are being purified and packed.',
          eta: '1 Day',
          distance: 'Haridwar HQ',
          indicator: 'orange'
        };
      case 'Shipped':
        return {
          title: 'In Transit',
          desc: 'Dispatched from sorting facility, heading to your city.',
          eta: '12-18 Hours',
          distance: 'En Route',
          indicator: 'blue'
        };
      case 'Out for Delivery':
        return {
          title: 'Out for Delivery (Live tracking)',
          desc: `${matchedExec ? matchedExec.name : 'Executive'} is delivering your order.`,
          eta: '10-25 Mins',
          distance: '2.4 km away',
          indicator: 'green'
        };
      case 'Delivered':
        return {
          title: 'Order Delivered',
          desc: 'Puja samagri package successfully handed over.',
          eta: 'Completed',
          distance: '0 km',
          indicator: 'success'
        };
      case 'Delivery Failed':
        return {
          title: 'Delivery Attempt Failed',
          desc: order.deliveryNotes || 'Delivery executive could not reach recipient.',
          eta: 'N/A',
          distance: 'Retrying soon',
          indicator: 'red'
        };
      default:
        return {
          title: 'Status Unknown',
          desc: 'Fetching tracking update...',
          eta: 'N/A',
          distance: 'N/A',
          indicator: 'gray'
        };
    }
  };

  const trackingInfo = getTrackingStatusInfo(order.status);
  const mapSearchQuery = encodeURIComponent(order.address);
  const embedMapUrl = `https://maps.google.com/maps?q=${mapSearchQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="tracking-page container">
      <div className="tracking-header text-left">
        <h1 className="title-lg">Order Tracking</h1>
        <p className="tracking-sub">ID: <b>{order.id}</b> | Placed on {order.date}</p>
      </div>

      {/* Sandbox Alert */}
      <div className="card sandbox-alert-card text-left animate-fade-in">
        <div className="flex-center gap-sm">
          <span className="sandbox-indicator-dot"></span>
          <h4>How to test this live:</h4>
        </div>
        <p>
          Currently, this order status is <b>{order.status}</b>. To update it, click the <b>Workspace Sandbox FAB</b> in the bottom right corner, switch to <b>Admin Dashboard</b> to assign it to an executive, or switch to <b>Delivery Executive</b> to progress the order to delivery!
        </p>
      </div>

      <div className="tracking-layout-grid">
        {/* Left: Stepper Timeline & Map Tracking */}
        <div className="flex-column gap-md">
          <div className="card tracking-timeline-card text-left">
            <h3 className="section-title">Delivery Status Timeline</h3>
            
            <div className="vertical-stepper">
              {steps.map((step, idx) => {
                let stepClass = '';
                if (idx < currentStepIndex) {
                  stepClass = 'completed';
                } else if (idx === currentStepIndex) {
                  stepClass = order.status === 'Delivery Failed' ? 'failed' : 'active';
                }

                return (
                  <div key={idx} className={`v-step-item ${stepClass}`}>
                    <div className="v-step-indicator">
                      <div className="v-step-dot">
                        {idx < currentStepIndex ? '✓' : idx + 1}
                      </div>
                      {idx < steps.length - 1 && <div className="v-step-line"></div>}
                    </div>
                    <div className="v-step-content">
                      <h4 className="v-step-label">{step.label}</h4>
                      <p className="v-step-desc">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
              
              {order.status === 'Delivery Failed' && (
                <div className="v-step-item failed">
                  <div className="v-step-indicator">
                    <div className="v-step-dot">✕</div>
                  </div>
                  <div className="v-step-content">
                    <h4 className="v-step-label" style={{ color: 'var(--color-accent)' }}>Delivery Failed</h4>
                    <p className="v-step-desc">{order.deliveryNotes || 'Delivery executive could not reach recipient.'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Google Maps Live Tracking Card */}
          <div className="card map-tracking-card text-left" style={{ padding: '0', overflow: 'hidden' }}>
            <div className="map-card-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
              <div className="flex-between">
                <div>
                  <h3 className="section-title" style={{ borderBottom: 'none', margin: '0', paddingBottom: '0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Compass className="spin-slow" size={18} style={{ color: 'var(--color-primary)' }} /> Live Map Tracking
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Powered by Google Maps</p>
                </div>
                
                <div className="flex-center gap-sm">
                  <span className={`map-status-dot ${trackingInfo.indicator}`}></span>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                    {trackingInfo.title}
                  </span>
                </div>
              </div>
            </div>

            {/* Map Frame wrapper */}
            <div className="live-map-viewport" style={{ position: 'relative', height: '360px', width: '100%', backgroundColor: 'var(--bg-sidebar)' }}>
              <iframe 
                title="Google Maps Order Tracking"
                src={embedMapUrl}
                width="100%"
                height="100%"
                style={{ border: '0', verticalAlign: 'middle' }}
                allowFullScreen=""
                loading="lazy"
              ></iframe>

              {/* Dynamic Tracking Status Dashboard Overlay */}
              <div className="map-tracking-overlay flex-between">
                <div className="tracking-stat-box">
                  <span className="stat-meta">ETA</span>
                  <div className="flex-center gap-xs" style={{ justifyContent: 'flex-start' }}>
                    <Clock size={12} style={{ color: 'var(--color-primary)' }} />
                    <span className="stat-bold">{trackingInfo.eta}</span>
                  </div>
                </div>

                <div className="tracking-stat-box">
                  <span className="stat-meta">Distance</span>
                  <div className="flex-center gap-xs" style={{ justifyContent: 'flex-start' }}>
                    <MapPin size={12} style={{ color: 'var(--color-primary)' }} />
                    <span className="stat-bold">{trackingInfo.distance}</span>
                  </div>
                </div>

                {matchedExec && (order.status === 'Out for Delivery' || order.status === 'Shipped') && (
                  <div className="tracking-stat-box">
                    <span className="stat-meta">Delivery Agent</span>
                    <div className="flex-center gap-xs" style={{ justifyContent: 'flex-start' }}>
                      <ShieldCheck size={12} style={{ color: 'var(--color-secondary)' }} />
                      <span className="stat-bold">{matchedExec.name.split(' ')[0]}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Executive details bar (only if assigned) */}
            {matchedExec && (order.status === 'Out for Delivery' || order.status === 'Shipped' || order.status === 'Delivered') && (
              <div className="delivery-executive-footer flex-between" style={{ padding: '16px 24px', backgroundColor: 'var(--bg-sidebar)', borderTop: '1px solid var(--border-color)', alignItems: 'center' }}>
                <div className="flex-center gap-sm" style={{ justifyContent: 'flex-start' }}>
                  <div className="exec-avatar-initial flex-center" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(242, 126, 26, 0.1)', color: 'var(--color-primary)', fontWeight: '700', fontSize: '0.875rem' }}>
                    {matchedExec.name.charAt(0)}
                  </div>
                  <div>
                    <h5 style={{ fontWeight: '700', margin: '0', fontSize: '0.875rem' }}>{matchedExec.name}</h5>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Dedicated PujaSamagri Courier</p>
                  </div>
                </div>

                <a href={`tel:${matchedExec.phone}`} className="btn btn-secondary btn-sm flex-center gap-xs" style={{ padding: '6px 12px', minWidth: 'auto', display: 'inline-flex' }}>
                  <Phone size={12} /> Contact Agent
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Right: Order details */}
        <div className="tracking-details-column flex-column gap-md">
          {/* Products Summary */}
          <div className="card text-left">
            <h3 className="section-title flex-center gap-sm" style={{ justifyContent: 'flex-start' }}>
              <ShoppingBag size={18} /> Items Ordered
            </h3>
            <div className="ordered-items-list flex-column gap-sm">
              {order.items.map((item, idx) => (
                <div key={idx} className="preview-item flex-between">
                  <span className="item-name-preview">{item.name} <b>x{item.qty}</b></span>
                  <span style={{ fontWeight: '700' }}>₹{item.price * item.qty}</span>
                </div>
              ))}
            </div>
            <div className="order-grand-total flex-between" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px', fontWeight: '800', fontSize: '1.1rem' }}>
              <span>Grand Total</span>
              <span>₹{order.total}</span>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card text-left">
            <h3 className="section-title flex-center gap-sm" style={{ justifyContent: 'flex-start' }}>
              <MapPin size={18} /> Shipping Address
            </h3>
            <div className="shipping-details-box text-secondary" style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
              <p style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>{order.userName}</p>
              <p>{order.address}</p>
              <p style={{ marginTop: '8px' }}>Phone: {order.phone}</p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="card text-left">
            <h3 className="section-title flex-center gap-sm" style={{ justifyContent: 'flex-start' }}>
              <CreditCard size={18} /> Payment Information
            </h3>
            <div className="shipping-details-box text-secondary" style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
              <p>Method: <b>{order.paymentMethod}</b></p>
              <p>Status: <span className={`badge ${order.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`} style={{ padding: '2px 8px', fontSize: '0.65rem' }}>{order.paymentStatus}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
