import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { User, Mail, Phone, MapPin, ClipboardList, FileText, X, Printer, Download } from 'lucide-react';
import './Profile.css';

export default function Profile() {
  const { currentUser, updateProfile, orders } = useContext(AppContext);

  // Profile Form State
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [mobile, setMobile] = useState(currentUser?.mobile || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [editSuccess, setEditSuccess] = useState(false);

  // Invoice Modal State
  const [activeInvoice, setActiveInvoice] = useState(null);

  // Filter orders for current logged in user
  const userOrders = orders.filter(o => o.userId === currentUser?.id);

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    updateProfile({ name, email, mobile, address });
    setEditSuccess(true);
    setTimeout(() => setEditSuccess(false), 3000);
  };

  const openInvoice = (order) => {
    setActiveInvoice(order);
  };

  const closeInvoice = () => {
    setActiveInvoice(null);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="profile-page-container container">
      <div className="profile-header text-left">
        <h1 className="title-lg">My Profile</h1>
      </div>

      <div className="profile-layout-grid">
        {/* Left: Edit Account info */}
        <div className="card profile-info-card text-left">
          <h3 className="section-title">Account Information</h3>
          {editSuccess && (
            <div className="success-msg animate-fade-in" style={{ color: 'hsl(142, 72%, 29%)', marginBottom: '16px', fontWeight: '600' }}>
              ✓ Profile information updated successfully.
            </div>
          )}
          <form onSubmit={handleProfileUpdate} className="query-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input 
                  type="text" 
                  className="form-input" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input 
                  type="email" 
                  className="form-input" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <div className="input-with-icon">
                <Phone size={16} className="input-icon" />
                <input 
                  type="tel" 
                  className="form-input" 
                  value={mobile} 
                  onChange={(e) => setMobile(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Default Address</label>
              <div className="input-with-icon text-area-icon-wrapper">
                <MapPin size={16} className="input-icon" style={{ top: '16px' }} />
                <textarea 
                  rows="3" 
                  className="form-input" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  required
                ></textarea>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full">
              Update Account Details
            </button>
          </form>
        </div>

        {/* Right: Order history list */}
        <div className="card profile-orders-card text-left">
          <h3 className="section-title flex-center gap-sm" style={{ justifyContent: 'flex-start' }}>
            <ClipboardList size={18} /> Order History ({userOrders.length})
          </h3>
          
          {userOrders.length === 0 ? (
            <div className="text-center" style={{ padding: '40px 10px', color: 'var(--text-secondary)' }}>
              <p>You have not placed any orders yet.</p>
            </div>
          ) : (
            <div className="orders-history-list flex-column gap-md">
              {userOrders.map(order => (
                <div key={order.id} className="card order-history-item flex-between">
                  <div className="history-meta flex-column gap-sm">
                    <div className="flex-center gap-sm" style={{ justifyContent: 'flex-start' }}>
                      <span className="order-id-txt">{order.id}</span>
                      <span className={`badge ${
                        order.status === 'Delivered' ? 'badge-success' : 
                        order.status === 'Processing' ? 'badge-info' : 
                        order.status === 'Placed' ? 'badge-warning' : 'badge-danger'
                      }`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                        {order.status}
                      </span>
                    </div>
                    <span className="order-date-txt">Placed: {order.date}</span>
                    <span className="order-total-txt">Total: <b>₹{order.total}</b></span>
                  </div>

                  <div className="history-actions flex-center gap-sm">
                    <button 
                      className="btn btn-secondary btn-sm flex-center gap-sm"
                      onClick={() => openInvoice(order)}
                    >
                      <FileText size={14} /> Invoice
                    </button>
                    <a href={`/order-tracking/${order.id}`} className="btn btn-primary btn-sm">Track</a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invoice Modal Overlay */}
      {activeInvoice && (
        <div className="invoice-modal-overlay flex-center animate-fade-in" onClick={closeInvoice}>
          <div className="card invoice-modal-container text-left" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex-between">
              <h3>Tax Invoice / Bill of Supply</h3>
              <button className="close-invoice-btn" onClick={closeInvoice}>
                <X size={20} />
              </button>
            </div>

            {/* Print Section wrapper */}
            <div className="invoice-print-area" id="invoice-print-sheet">
              <div className="invoice-top-header flex-between">
                <div className="brand-invoice-details">
                  <h2>ॐ PujaSamagri</h2>
                  <p>Cyvanta Tech Quantum Pvt. Ltd.</p>
                  <p>Tech Hub, Sector 5, Noida, UP</p>
                  <p>Email: billing@cyvanta.com</p>
                </div>
                <div className="invoice-billing-numbers text-right">
                  <h3>INVOICE</h3>
                  <p>Invoice No: <b>INV-{activeInvoice.id.split('-')[1]}</b></p>
                  <p>Order ID: {activeInvoice.id}</p>
                  <p>Date: {activeInvoice.date}</p>
                </div>
              </div>

              <div className="invoice-addresses-grid grid-2">
                <div className="address-col">
                  <span className="addr-title">Billed To:</span>
                  <p className="addr-name">{activeInvoice.userName}</p>
                  <p className="addr-details">{activeInvoice.address}</p>
                  <p className="addr-phone">Phone: {activeInvoice.phone}</p>
                </div>
                <div className="address-col text-right">
                  <span className="addr-title">Payment Mode:</span>
                  <p style={{ fontWeight: '700' }}>{activeInvoice.paymentMethod}</p>
                  <p>Payment Status: <b>{activeInvoice.paymentStatus}</b></p>
                </div>
              </div>

              {/* Items Table */}
              <table className="invoice-items-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {activeInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name}</td>
                      <td>₹{item.price}</td>
                      <td>{item.qty}</td>
                      <td className="text-right">₹{item.price * item.qty}</td>
                    </tr>
                  ))}
                  <tr className="subtotal-tr">
                    <td colSpan="3" className="text-right">Subtotal</td>
                    <td className="text-right">₹{activeInvoice.items.reduce((acc, item) => acc + (item.price * item.qty), 0)}</td>
                  </tr>
                  {activeInvoice.total < activeInvoice.items.reduce((acc, item) => acc + (item.price * item.qty), 0) && (
                    <tr>
                      <td colSpan="3" className="text-right">Discount Applied</td>
                      <td className="text-right discount">-₹{activeInvoice.items.reduce((acc, item) => acc + (item.price * item.qty), 0) - activeInvoice.total}</td>
                    </tr>
                  )}
                  <tr className="grand-total-tr">
                    <td colSpan="3" className="text-right">Grand Total</td>
                    <td className="text-right">₹{activeInvoice.total}</td>
                  </tr>
                </tbody>
              </table>

              <div className="invoice-declarations">
                <p>This is a computer generated document and does not require a physical signature.</p>
                <p>Thank you for purchasing with Puja Samagri! May your prayers bring peace and prosperity.</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="modal-actions-footer flex-center gap-md">
              <button className="btn btn-secondary flex-center gap-sm" onClick={handlePrintInvoice}>
                <Printer size={16} /> Print Invoice
              </button>
              <button className="btn btn-primary flex-center gap-sm" onClick={() => alert('Mock download started: Invoice saved to downloads folder.')}>
                <Download size={16} /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
