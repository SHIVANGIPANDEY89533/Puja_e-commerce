import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { Truck, MapPin, Phone, ShoppingBag, Eye, Calendar, Award, CheckCircle2, AlertTriangle, LogOut } from 'lucide-react';
import './DeliveryDashboard.css';

export default function DeliveryDashboard() {
  const { orders, updateDeliveryStatus, currentUser, logoutUser, activeRole } = useContext(AppContext);
  const navigate = useNavigate();

  // State for closing/opening delivery status update details
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusNotes, setStatusNotes] = useState('');
  const [newStatus, setNewStatus] = useState('Delivered');

  // Verify role or fallback to default exec
  const isDeliveryRole = activeRole === 'delivery' || currentUser?.role === 'delivery';

  // Logged in Executive details
  const executiveId = isDeliveryRole ? currentUser?.id || 'exec-1' : 'exec-1';
  const executiveName = isDeliveryRole ? currentUser?.name || 'Amit Patel' : 'Amit Patel';

  // Filter orders assigned to this executive
  const assignedOrders = orders.filter(o => o.deliveryExecutive === executiveId);
  const pendingDeliveries = assignedOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Delivery Failed');
  const completedDeliveries = assignedOrders.filter(o => o.status === 'Delivered' || o.status === 'Delivery Failed');

  const handleStatusUpdate = (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    updateDeliveryStatus(selectedOrder.id, newStatus, statusNotes);
    setSelectedOrder(null);
    setStatusNotes('');
  };

  const openStatusUpdate = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status === 'Out for Delivery' ? 'Delivered' : order.status === 'Shipped' ? 'Out for Delivery' : 'Shipped');
  };

  return (
    <div className="delivery-dashboard container">
      {/* Header */}
      <div className="delivery-header-panel card flex-between text-left">
        <div className="executive-meta flex-center gap-md">
          <div className="exec-avatar flex-center">
            <Truck size={24} />
          </div>
          <div>
            <h3>Welcome, {executiveName}</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Assigned Hub: Delhi Central | Code: {executiveId}
            </p>
          </div>
        </div>

        <div className="header-stats-row flex-center gap-lg">
          <div className="header-stat text-center">
            <span className="stat-label">Pending</span>
            <h4 style={{ color: 'var(--color-primary)' }}>{pendingDeliveries.length}</h4>
          </div>
          <div className="header-stat text-center">
            <span className="stat-label">Completed</span>
            <h4 style={{ color: 'hsl(142, 72%, 29%)' }}>{completedDeliveries.length}</h4>
          </div>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => { logoutUser(); navigate('/delivery/login'); }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <LogOut size={14} /> Exit
          </button>
        </div>
      </div>

      <div className="delivery-main-layout">
        {/* Left: Active shipments */}
        <div className="active-shipments text-left">
          <h2 className="section-title">Active Shipments ({pendingDeliveries.length})</h2>

          {pendingDeliveries.length === 0 ? (
            <div className="card text-center" style={{ padding: '60px 20px', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={48} style={{ color: 'hsl(142, 72%, 29%)', margin: '0 auto 16px' }} />
              <h3>All caught up!</h3>
              <p>No pending orders are currently assigned to you. Toggle to Admin Panel to assign orders.</p>
            </div>
          ) : (
            <div className="deliveries-cards-list flex-column gap-md">
              {pendingDeliveries.map(order => (
                <div key={order.id} className="card delivery-order-card">
                  <div className="delivery-card-header flex-between">
                    <span className="order-id-badge">Order: {order.id}</span>
                    <span className={`badge ${
                      order.status === 'Processing' ? 'badge-info' : 'badge-warning'
                    }`} style={{ fontSize: '0.65rem' }}>
                      {order.status === 'Processing' ? 'Assigned' : order.status}
                    </span>
                  </div>

                  <div className="delivery-card-body flex-column gap-sm">
                    <div className="info-row">
                      <MapPin size={16} className="info-icon" />
                      <div>
                        <b>{order.userName}</b>
                        <p className="text-secondary" style={{ fontSize: '0.8125rem' }}>{order.address}</p>
                      </div>
                    </div>

                    <div className="info-row">
                      <Phone size={16} className="info-icon" />
                      <a href={`tel:${order.phone}`} style={{ fontSize: '0.8125rem', fontWeight: '600' }}>{order.phone}</a>
                    </div>

                    <div className="info-row">
                      <ShoppingBag size={16} className="info-icon" />
                      <span style={{ fontSize: '0.8125rem' }}>
                        {order.items.map(item => `${item.name} (x${item.qty})`).join(', ')}
                      </span>
                    </div>
                  </div>

                  <div className="delivery-card-footer flex-between">
                    <div className="payment-status-box" style={{ fontSize: '0.8125rem' }}>
                      To Pay: <b>₹{order.total}</b> ({order.paymentMethod})
                      <span className={`badge ${order.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`} style={{ marginLeft: '8px', fontSize: '0.6rem', padding: '2px 6px' }}>
                        {order.paymentStatus}
                      </span>
                    </div>

                    <div className="action-buttons-box flex-center gap-sm">
                      {order.status === 'Processing' && (
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => updateDeliveryStatus(order.id, 'Shipped', 'Picked up from warehouse')}
                        >
                          Pick Up Package
                        </button>
                      )}
                      {order.status === 'Shipped' && (
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => updateDeliveryStatus(order.id, 'Out for Delivery', 'Out for delivery')}
                        >
                          Mark Out for Delivery
                        </button>
                      )}
                      {order.status === 'Out for Delivery' && (
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => openStatusUpdate(order)}
                        >
                          Complete Delivery
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: History logs */}
        <div className="completed-deliveries text-left">
          <h2 className="section-title">Delivery History ({completedDeliveries.length})</h2>

          <div className="card table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {completedDeliveries.map(order => (
                  <tr key={order.id}>
                    <td><b>{order.id}</b></td>
                    <td>{order.userName}</td>
                    <td>₹{order.total}</td>
                    <td>
                      <span className={`badge ${
                        order.status === 'Delivered' ? 'badge-success' : 'badge-danger'
                      }`} style={{ fontSize: '0.6875rem' }}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* UPDATE STATUS MODAL */}
      {selectedOrder && (
        <div className="invoice-modal-overlay flex-center animate-fade-in" onClick={() => setSelectedOrder(null)}>
          <div className="card invoice-modal-container text-left" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex-between">
              <h3>Update Shipment Delivery status</h3>
              <button className="close-invoice-btn" onClick={() => setSelectedOrder(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleStatusUpdate} className="query-form" style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label className="form-label">Delivery Status Outcome *</label>
                <select 
                  className="form-input"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="Delivered">Delivered (Successful)</option>
                  <option value="Delivery Failed">Delivery Failed (Returned / Rejected)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Delivery Executive Notes *</label>
                <textarea 
                  rows="3" 
                  className="form-input"
                  placeholder="e.g. Left at door / Customer rejected COD payment"
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary w-full">
                Submit Shipment Update
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
