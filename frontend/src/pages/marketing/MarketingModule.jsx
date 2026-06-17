import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { 
  Search, Globe, Share2, Mail, BarChart3, 
  Plus, Edit2, Play, Calendar, AlertCircle, ShoppingCart, Award
} from 'lucide-react';
import './MarketingModule.css';

export default function MarketingModule() {
  const { campaigns, addCampaign, updateCampaignStatus, seoConfig, setSeoConfig } = useContext(AppContext);

  // Sub tabs inside marketing: 'seo' | 'social' | 'email' | 'campaigns'
  const [marketTab, setMarketTab] = useState('seo');

  // SEO Form State
  const [seoTitle, setSeoTitle] = useState(seoConfig.homeTitle);
  const [seoDesc, setSeoDesc] = useState(seoConfig.homeMetaDesc);
  const [seoSaved, setSeoSaved] = useState(false);

  // Campaign Creator State
  const [campName, setCampName] = useState('');
  const [campType, setCampType] = useState('Email');
  const [campStart, setCampStart] = useState('');
  const [campEnd, setCampEnd] = useState('');
  const [campStatus, setCampStatus] = useState('Scheduled');

  // --- ACTIONS ---
  const handleSaveSEO = (e) => {
    e.preventDefault();
    setSeoConfig({
      ...seoConfig,
      homeTitle: seoTitle,
      homeMetaDesc: seoDesc
    });
    setSeoSaved(true);
    setTimeout(() => setSeoSaved(false), 3000);
  };

  const handleCreateCampaign = (e) => {
    e.preventDefault();
    if (!campName || !campStart || !campEnd) return;

    addCampaign({
      name: campName,
      type: campType,
      startDate: campStart,
      endDate: campEnd,
      status: campStatus
    });

    setCampName('');
    setCampStart('');
    setCampEnd('');
    setCampStatus('Scheduled');
  };

  // Structured Data (JSON-LD) Preview generator
  const generatedSchema = `{
  "@context": "https://schema.org",
  "@type": "Store",
  "name": "Puja Samagri Online Shop",
  "description": "${seoDesc}",
  "url": "https://cyvantapujasamagri.com",
  "logo": "https://cyvantapujasamagri.com/logo.png",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Tech Hub, Sector 5",
    "addressLocality": "Noida",
    "addressRegion": "UP",
    "postalCode": "201301",
    "addressCountry": "IN"
  }
}`;

  return (
    <div className="marketing-module text-left">
      <div className="flex-between" style={{ marginBottom: '24px' }}>
        <div>
          <h2 className="tab-heading" style={{ marginBottom: '4px' }}>Digital Marketing Services</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Configure search visibility, social templates, newsletters, and email automation campaigns.</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="card marketing-tabs-header flex-center" style={{ padding: '8px', justifyContent: 'flex-start', gap: '10px', marginBottom: '30px' }}>
        <button className={`market-btn-tab ${marketTab === 'seo' ? 'active' : ''}`} onClick={() => setMarketTab('seo')}>
          <Globe size={16} /> SEO Settings
        </button>
        <button className={`market-btn-tab ${marketTab === 'social' ? 'active' : ''}`} onClick={() => setMarketTab('social')}>
          <Share2 size={16} /> Social Media & SMS
        </button>
        <button className={`market-btn-tab ${marketTab === 'email' ? 'active' : ''}`} onClick={() => setMarketTab('email')}>
          <Mail size={16} /> Email Automation & Recovery
        </button>
        <button className={`market-btn-tab ${marketTab === 'campaigns' ? 'active' : ''}`} onClick={() => setMarketTab('campaigns')}>
          <BarChart3 size={16} /> Active Campaigns ({campaigns.length})
        </button>
      </div>

      {/* TAB CONTENT: SEO */}
      {marketTab === 'seo' && (
        <div className="marketing-tab-pane animate-fade-in flex-column gap-lg">
          <div className="grid-2" style={{ alignItems: 'flex-start' }}>
            <div className="card">
              <h3 className="section-title">Meta Tags Management</h3>
              {seoSaved && (
                <div className="success-msg badge badge-success w-full text-center" style={{ display: 'block', padding: '10px', marginBottom: '16px' }}>
                  ✓ SEO Meta tags updated successfully.
                </div>
              )}
              <form onSubmit={handleSaveSEO} className="query-form">
                <div className="form-group">
                  <label className="form-label">SEO Home Title *</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    required 
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Recommended length: 50-60 characters. Current: {seoTitle.length}</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Meta Description *</label>
                  <textarea 
                    rows="4" 
                    className="form-input"
                    value={seoDesc}
                    onChange={(e) => setSeoDesc(e.target.value)}
                    required
                  ></textarea>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Recommended length: 150-160 characters. Current: {seoDesc.length}</span>
                </div>

                <button type="submit" className="btn btn-primary w-full">Save SEO Settings</button>
              </form>
            </div>

            {/* Google Search Snippet Preview */}
            <div className="flex-column gap-md">
              <div className="card google-snippet-card">
                <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '14px' }}>Google Search Preview</h4>
                <div className="google-preview-box">
                  <span className="google-link">https://cyvantapujasamagri.com</span>
                  <h3 className="google-title">{seoTitle}</h3>
                  <p className="google-desc">{seoDesc}</p>
                </div>
              </div>

              {/* JSON-LD Schema Markup */}
              <div className="card schema-card">
                <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '12px' }}>Product & Store JSON-LD Schema</h4>
                <pre className="schema-code-block"><code>{generatedSchema}</code></pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SOCIAL & SMS */}
      {marketTab === 'social' && (
        <div className="marketing-tab-pane animate-fade-in flex-column gap-lg">
          <div className="grid-2">
            <div className="card">
              <h3 className="section-title"><Share2 size={18} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} /> WhatsApp Notification API</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                When customers place an order or their delivery status updates, automated WhatsApp notifications are triggered via our integrated API.
              </p>
              
              <div className="mock-message-preview card glass">
                <div className="msg-preview-header flex-between">
                  <span>WhatsApp Template Preview</span>
                  <span className="badge badge-success">Active</span>
                </div>
                <div className="msg-preview-body">
                  <p><b>ॐ Puja Samagri Alerts:</b></p>
                  <p>Pranam Rahul Dev, your order <b>#ORD-9872</b> has been picked up from our central warehouse and is out for delivery! Track order status at: <i>https://cyvantapujasamagri.com/order-tracking/ORD-9872</i></p>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="section-title">Social Media Campaigns</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Simulate marketing links sharing on Facebook, Instagram, and WhatsApp. Pre-constructed campaign layouts ready for deployment.
              </p>
              <div className="flex-column gap-sm">
                <button className="btn btn-secondary w-full" onClick={() => alert('Mock Facebook ad deployed! Check analytics under Campaign tab.')}>
                  Deploy Facebook Ad Campaign
                </button>
                <button className="btn btn-secondary w-full" onClick={() => alert('Mock Instagram story promo scheduled.')}>
                  Schedule Instagram Story Promo
                </button>
                <button className="btn btn-secondary w-full" onClick={() => alert('WhatsApp broadcast sent to all subscribed customers.')}>
                  Send WhatsApp Customer Broadcast
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: EMAIL & CART RECOVERY */}
      {marketTab === 'email' && (
        <div className="marketing-tab-pane animate-fade-in flex-column gap-lg">
          <div className="grid-2" style={{ alignItems: 'flex-start' }}>
            <div className="card">
              <h3 className="section-title">Newsletter Promotions</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Schedule newsletters or send instant promo emails to all customers containing custom coupons.
              </p>
              
              <div className="card promo-draft-box glass">
                <h4 style={{ marginBottom: '12px' }}>Draft: Diwali Shubh Labh Promo</h4>
                <div className="form-group">
                  <label className="form-label">Email Subject</label>
                  <input type="text" className="form-input" value="✨ Bring Divine Blessings to your Home this Diwali!" readOnly />
                </div>
                <div className="form-group">
                  <label className="form-label">Promo Coupon Code</label>
                  <input type="text" className="form-input" value="FESTIVAL20" readOnly />
                </div>
                <button className="btn btn-primary btn-sm w-full" onClick={() => alert('Promotional newsletter dispatched to 1200 contacts.')}>
                  Dispatch Promo Email
                </button>
              </div>
            </div>

            {/* Cart Recovery Automation */}
            <div className="card">
              <h3 className="section-title flex-center gap-sm" style={{ justifyContent: 'flex-start' }}>
                <ShoppingCart size={18} /> Cart Recovery Automation
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Automatically emails clients who added products to their carts but did not complete checkouts after 24 hours.
              </p>
              
              <div className="recovery-flow card glass flex-column gap-md">
                <div className="flow-step flex-between">
                  <span>1. User Abandons Cart</span>
                  <span className="badge badge-warning">Triggered</span>
                </div>
                <div className="flow-step flex-between">
                  <span>2. Wait 24 Hours</span>
                  <span className="badge badge-info">Waiting</span>
                </div>
                <div className="flow-step flex-between">
                  <span>3. Send Recovery Mail with coupon WELCOME10</span>
                  <span className="badge badge-success">Completed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ACTIVE CAMPAIGNS */}
      {marketTab === 'campaigns' && (
        <div className="marketing-tab-pane animate-fade-in flex-column gap-lg">
          <div className="grid-2" style={{ alignItems: 'flex-start' }}>
            {/* Create Campaign */}
            <div className="card">
              <h3 className="section-title">Schedule New Campaign</h3>
              <form onSubmit={handleCreateCampaign} className="query-form">
                <div className="form-group">
                  <label className="form-label">Campaign Name *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Navratri Special Promo" 
                    value={campName}
                    onChange={(e) => setCampName(e.target.value)}
                    required 
                  />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Campaign Type</label>
                    <select 
                      className="form-input"
                      value={campType}
                      onChange={(e) => setCampType(e.target.value)}
                    >
                      <option value="Email">Email Marketing</option>
                      <option value="WhatsApp">WhatsApp Message</option>
                      <option value="SMS">SMS Notification</option>
                      <option value="Facebook Ad">Facebook Ad</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Initial Status</label>
                    <select 
                      className="form-input"
                      value={campStatus}
                      onChange={(e) => setCampStatus(e.target.value)}
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Running">Running</option>
                      <option value="Paused">Paused</option>
                    </select>
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Start Date *</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={campStart}
                      onChange={(e) => setCampStart(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date *</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={campEnd}
                      onChange={(e) => setCampEnd(e.target.value)}
                      required 
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-full">Create Campaign</button>
              </form>
            </div>

            {/* Campaigns list table */}
            <div className="card table-container">
              <h3 className="section-title">Active Campaign Analytics</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Campaign Name</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>CTR / Conv</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map(camp => (
                    <tr key={camp.id}>
                      <td>
                        <div className="table-customer-name" style={{ fontSize: '0.8125rem' }}>{camp.name}</div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>ID: {camp.id}</span>
                      </td>
                      <td><span className="badge badge-info" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>{camp.type}</span></td>
                      <td>
                        <span className={`badge ${
                          camp.status === 'Running' ? 'badge-success' : 
                          camp.status === 'Paused' ? 'badge-danger' : 'badge-warning'
                        }`} style={{ fontSize: '0.65rem' }}>
                          {camp.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Sent: {camp.sent}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Conversions: {camp.conversions}</div>
                      </td>
                      <td>
                        {camp.status === 'Scheduled' ? (
                          <button 
                            className="btn btn-primary btn-sm flex-center"
                            style={{ padding: '4px 8px' }}
                            onClick={() => updateCampaignStatus(camp.id, 'Running')}
                          >
                            <Play size={10} /> Run
                          </button>
                        ) : camp.status === 'Running' ? (
                          <button 
                            className="btn btn-secondary btn-sm flex-center"
                            style={{ padding: '4px 8px' }}
                            onClick={() => updateCampaignStatus(camp.id, 'Paused')}
                          >
                            Pause
                          </button>
                        ) : (
                          <button 
                            className="btn btn-primary btn-sm flex-center"
                            style={{ padding: '4px 8px' }}
                            onClick={() => updateCampaignStatus(camp.id, 'Running')}
                          >
                            Resume
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
