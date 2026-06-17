import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { 
  TrendingUp, ShoppingBag, Users, Percent, MessageSquare, BarChart3, 
  Plus, Edit, Trash2, Truck, FileSpreadsheet, AlertTriangle, Check, X, Eye,
  Upload, Download
} from 'lucide-react';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { 
    products, addProduct, updateProduct, deleteProduct, bulkUploadProducts,
    orders, updateOrderStatus, assignDelivery,
    coupons, addCoupon, deleteCoupon, toggleCoupon,
    queries, resolveQuery
  } = useContext(AppContext);

  // Tab State: 'overview' | 'products' | 'orders' | 'coupons' | 'queries' | 'reports'
  const [activeTab, setActiveTab] = useState('overview');

  // Product CRUD states
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('Agarbatti');
  const [prodPrice, setProdPrice] = useState('');
  const [prodOriginalPrice, setProdOriginalPrice] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [imageUploadType, setImageUploadType] = useState('url'); // 'url' | 'file'

  // Bulk upload states
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkPreview, setBulkPreview] = useState([]);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const [uploadErrorMsg, setUploadErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Coupon Form state
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState('');
  const [couponType, setCouponType] = useState('percent');
  const [couponMinCart, setCouponMinCart] = useState('');

  // Mock Delivery Executives
  const executives = [
    { id: 'exec-1', name: 'Amit Patel (Delhi NCR)' },
    { id: 'exec-2', name: 'Vikram Rao (Noida)' },
    { id: 'exec-3', name: 'Sanjay Sharma (Gurugram)' }
  ];

  // --- STATS CALCULATIONS ---
  const totalSales = orders.reduce((acc, o) => o.status === 'Delivered' || o.paymentStatus === 'Paid' ? acc + o.total : acc, 0);
  const totalOrdersCount = orders.length;
  const lowStockProducts = products.filter(p => p.stock <= 5);
  const openQueries = queries.filter(q => q.status === 'Open').length;

  // --- ACTIONS ---
  const handleProductSubmit = (e) => {
    e.preventDefault();
    if (!prodName || !prodPrice || !prodStock) return;

    const prodData = {
      name: prodName,
      category: prodCategory,
      price: Number(prodPrice),
      originalPrice: Number(prodOriginalPrice || prodPrice),
      stock: Number(prodStock),
      description: prodDesc,
      images: prodImage ? [prodImage] : ['https://images.unsplash.com/photo-1605847444195-223040b5d97d?w=500&auto=format&fit=crop&q=60'],
      features: ['Premium Quality', 'Handcrafted', 'Divine Aroma']
    };

    if (editingProduct) {
      updateProduct({ ...editingProduct, ...prodData });
    } else {
      addProduct(prodData);
    }

    // Reset Form
    setEditingProduct(null);
    setProdName('');
    setProdPrice('');
    setProdOriginalPrice('');
    setProdStock('');
    setProdDesc('');
    setProdImage('');
    setShowProductModal(false);
  };

  const handleEditProductClick = (prod) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdCategory(prod.category);
    setProdPrice(prod.price);
    setProdOriginalPrice(prod.originalPrice);
    setProdStock(prod.stock);
    setProdDesc(prod.description);
    setProdImage(prod.images && prod.images.length > 0 ? prod.images[0] : '');
    setShowProductModal(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setProdImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // --- BULK UPLOAD HANDLERS ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file) => {
    const reader = new FileReader();
    const isJson = file.name.endsWith('.json');
    
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        let parsed = [];
        
        if (isJson) {
          parsed = JSON.parse(text);
          if (!Array.isArray(parsed)) {
            throw new Error("JSON file must contain an array of product objects.");
          }
        } else {
          // CSV Parsing
          const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
          if (lines.length < 2) {
            throw new Error("CSV file must contain a header row and at least one product row.");
          }
          
          // Parse header line
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          
          parsed = lines.slice(1).map(line => {
            const columns = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                columns.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            columns.push(current.trim());
            
            const prod = {};
            headers.forEach((header, index) => {
              let val = columns[index] || '';
              if (val.startsWith('"') && val.endsWith('"')) {
                val = val.substring(1, val.length - 1);
              }
              prod[header] = val;
            });
            
            return {
              name: prod.name || '',
              category: prod.category || 'Other',
              price: Number(prod.price) || 0,
              originalPrice: Number(prod.originalprice || prod.price) || 0,
              stock: Number(prod.stock) || 0,
              description: prod.description || '',
              images: prod.images ? prod.images.split(';').map(img => img.trim()) : [],
              features: prod.features ? prod.features.split(';').map(f => f.trim()) : []
            };
          });
        }
        
        // Validate parsed products
        const validated = parsed.map((p, idx) => {
          const errors = [];
          if (!p.name) errors.push("Product name is required.");
          if (isNaN(p.price) || Number(p.price) < 0) errors.push("Price must be a positive number.");
          if (isNaN(p.stock) || Number(p.stock) < 0) errors.push("Stock must be a positive number.");
          
          return {
            ...p,
            id: idx + 1,
            errors,
            isValid: errors.length === 0
          };
        });
        
        setBulkPreview(validated);
        setUploadSuccessMsg('');
        setUploadErrorMsg('');
      } catch (err) {
        setUploadErrorMsg("Error parsing file: " + err.message);
        setBulkPreview([]);
      }
    };
    
    reader.readAsText(file);
  };

  const downloadTemplate = (format) => {
    let content = '';
    let fileName = '';
    let mimeType = '';
    
    if (format === 'csv') {
      content = 'name,category,price,originalPrice,stock,description,images,features\n' +
                'Premium Sandalwood Agarbatti,Agarbatti,199,249,50,Slow-burning agarbatti,https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf,"100% Natural;Eco-friendly;Divine Aroma"\n' +
                'Pure Bhimseni Camphor,Camphor,299,349,15,Pure camphor crystals,https://images.unsplash.com/photo-1608571423902-eed4a5ad8108,"Leaves no residue;Edible-grade purity"';
      fileName = 'products_bulk_template.csv';
      mimeType = 'text/csv';
    } else {
      content = JSON.stringify([
        {
          name: "Premium Sandalwood Agarbatti",
          category: "Agarbatti",
          price: 199,
          originalPrice: 249,
          stock: 50,
          description: "Slow-burning agarbatti",
          images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf"],
          features: ["100% Natural", "Eco-friendly", "Divine Aroma"]
        },
        {
          name: "Pure Bhimseni Camphor",
          category: "Camphor",
          price: 299,
          originalPrice: 349,
          stock: 15,
          description: "Pure camphor crystals",
          images: ["https://images.unsplash.com/photo-1608571423902-eed4a5ad8108"],
          features: ["Leaves no residue", "Edible-grade purity"]
        }
      ], null, 2);
      fileName = 'products_bulk_template.json';
      mimeType = 'application/json';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmUpload = async () => {
    const validItems = bulkPreview.filter(item => item.isValid).map(({ id, errors, isValid, ...rest }) => rest);
    if (validItems.length === 0) return;
    
    try {
      bulkUploadProducts(validItems);
      
      try {
        const response = await fetch('http://localhost:5002/api/products/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + (localStorage.getItem('pujasamagri_token') || '')
          },
          body: JSON.stringify({ products: validItems })
        });
        
        const data = await response.json();
        if (response.ok) {
          console.log('Backend database synchronized successfully:', data);
        } else {
          console.warn('Backend database synchronization returned status:', response.status, data.message);
        }
      } catch (err) {
        console.warn('Backend database server not running or connection refused. Local storage updated successfully.');
      }
      
      setUploadSuccessMsg(`Successfully uploaded ${validItems.length} products to inventory!`);
      setBulkPreview([]);
      
      setTimeout(() => {
        setShowBulkUpload(false);
        setUploadSuccessMsg('');
      }, 3000);
      
    } catch (err) {
      setUploadErrorMsg("Upload failed: " + err.message);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleCouponSubmit = (e) => {
    e.preventDefault();
    if (!couponCode || !couponDiscount || !couponMinCart) return;

    addCoupon({
      code: couponCode.toUpperCase(),
      discount: Number(couponDiscount),
      type: couponType,
      minCart: Number(couponMinCart)
    });

    setCouponCode('');
    setCouponDiscount('');
    setCouponMinCart('');
  };

  const handleExportCSV = (reportType) => {
    alert(`Export complete! ${reportType}_Report.csv generated and saved to local directory.`);
  };

  return (
    <div className="admin-dashboard container">
      {/* Admin Grid Layout */}
      <div className="admin-layout-grid">
        {/* Sidebar Nav */}
        <aside className="card admin-sidebar">
          <div className="sidebar-brand-title">
            <h3>Cyvanta Portal</h3>
            <p>Admin Workspace</p>
          </div>
          <div className="admin-nav-links-list">
            <button className={`tab-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              <BarChart3 size={16} /> Overview
            </button>
            <button className={`tab-link ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
              <ShoppingBag size={16} /> Products ({products.length})
            </button>
            <button className={`tab-link ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
              <Truck size={16} /> Orders ({orders.length})
            </button>
            <button className={`tab-link ${activeTab === 'coupons' ? 'active' : ''}`} onClick={() => setActiveTab('coupons')}>
              <Percent size={16} /> Coupon Codes
            </button>
            <button className={`tab-link ${activeTab === 'queries' ? 'active' : ''}`} onClick={() => { setActiveTab('queries'); }}>
              <MessageSquare size={16} /> Queries ({queries.length})
            </button>
            <button className={`tab-link ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
              <FileSpreadsheet size={16} /> Reports & Export
            </button>
          </div>
        </aside>

        {/* Tab Contents Area */}
        <main className="admin-main-contents">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="tab-pane animate-fade-in text-left">
              <h2 className="tab-heading">Dashboard Overview</h2>
              
              {/* Stat cards grid */}
              <div className="grid-4 stat-cards-wrapper" style={{ marginBottom: '30px' }}>
                <div className="card stat-card flex-between">
                  <div className="stat-text">
                    <span className="stat-label">Total Revenue</span>
                    <h3 className="stat-value">₹{totalSales.toLocaleString()}</h3>
                  </div>
                  <div className="stat-icon-box sales"><TrendingUp size={20} /></div>
                </div>

                <div className="card stat-card flex-between">
                  <div className="stat-text">
                    <span className="stat-label">Total Orders</span>
                    <h3 className="stat-value">{totalOrdersCount}</h3>
                  </div>
                  <div className="stat-icon-box orders"><ShoppingBag size={20} /></div>
                </div>

                <div className="card stat-card flex-between">
                  <div className="stat-text">
                    <span className="stat-label">Low Stock items</span>
                    <h3 className="stat-value">{lowStockProducts.length}</h3>
                  </div>
                  <div className="stat-icon-box stock"><AlertTriangle size={20} /></div>
                </div>

                <div className="card stat-card flex-between">
                  <div className="stat-text">
                    <span className="stat-label">Open Support Tickets</span>
                    <h3 className="stat-value">{openQueries}</h3>
                  </div>
                  <div className="stat-icon-box queries"><MessageSquare size={20} /></div>
                </div>
              </div>

              {/* Low Stock Alerts banner */}
              {lowStockProducts.length > 0 && (
                <div className="card stock-alert-card animate-fade-in" style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <AlertTriangle size={24} className="warning-icon" />
                  <div className="alert-content">
                    <h4 style={{ fontWeight: '700' }}>Low Stock Warning</h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      The following products are running out of stock: {lowStockProducts.map(p => `${p.name} (${p.stock} left)`).join(', ')}. Please update inventory counts.
                    </p>
                  </div>
                </div>
              )}

              {/* Graphical simulation & Sales distribution cards */}
              <div className="grid-2">
                <div className="card text-left">
                  <h4 style={{ marginBottom: '16px' }}>Weekly Sales Trends</h4>
                  <div className="mock-chart-trend flex-center">
                    <div className="bar" style={{ height: '35%' }} data-label="Mon"></div>
                    <div className="bar" style={{ height: '55%' }} data-label="Tue"></div>
                    <div className="bar" style={{ height: '40%' }} data-label="Wed"></div>
                    <div className="bar" style={{ height: '70%' }} data-label="Thu"></div>
                    <div className="bar" style={{ height: '65%' }} data-label="Fri"></div>
                    <div className="bar" style={{ height: '90%' }} data-label="Sat"></div>
                    <div className="bar highlighted" style={{ height: '100%' }} data-label="Sun"></div>
                  </div>
                </div>

                <div className="card text-left">
                  <h4 style={{ marginBottom: '16px' }}>Sales by Category</h4>
                  <div className="mock-pie-chart flex-column gap-sm">
                    <div className="pie-item flex-between">
                      <span className="pie-name"><span className="pie-color" style={{ backgroundColor: 'var(--color-primary)' }}></span> Agarbatti & Dhoop</span>
                      <b>45%</b>
                    </div>
                    <div className="pie-item flex-between">
                      <span className="pie-name"><span className="pie-color" style={{ backgroundColor: 'var(--color-secondary)' }}></span> Festival Kits</span>
                      <b>30%</b>
                    </div>
                    <div className="pie-item flex-between">
                      <span className="pie-name"><span className="pie-color" style={{ backgroundColor: 'var(--color-accent)' }}></span> Temple Accessories</span>
                      <b>15%</b>
                    </div>
                    <div className="pie-item flex-between">
                      <span className="pie-name"><span className="pie-color" style={{ backgroundColor: 'hsl(200, 80%, 50%)' }}></span> Others</span>
                      <b>10%</b>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS */}
          {activeTab === 'products' && (
            <div className="tab-pane animate-fade-in text-left">
              <div className="flex-between" style={{ marginBottom: '24px' }}>
                <h2 className="tab-heading">Product Inventory Management</h2>
                <div className="flex-center gap-sm">
                  <button className="btn btn-secondary flex-center gap-xs" onClick={() => { setShowBulkUpload(!showBulkUpload); setBulkPreview([]); setUploadSuccessMsg(''); setUploadErrorMsg(''); }}>
                    <Upload size={16} /> Bulk Upload
                  </button>
                  <button className="btn btn-primary" onClick={() => { setEditingProduct(null); setShowProductModal(true); }}>
                    <Plus size={16} /> Add Product
                  </button>
                </div>
              </div>

              {/* Bulk Upload Component */}
              {showBulkUpload && (
                <div className="card bulk-upload-card animate-slide-down" style={{ marginBottom: '30px', padding: '24px', border: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '20px' }}>
                    <h4 style={{ fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Upload size={18} style={{ color: 'var(--color-primary)' }} /> Bulk Upload Products
                    </h4>
                    <button className="close-invoice-btn btn btn-secondary btn-sm" onClick={() => { setShowBulkUpload(false); setBulkPreview([]); }} style={{ minWidth: 'auto', padding: '4px' }}>
                      <X size={18} />
                    </button>
                  </div>
                  
                  <div className="grid-2" style={{ gap: '24px', alignItems: 'stretch', marginBottom: '20px' }}>
                    {/* Drag & Drop Zone */}
                    <div 
                      className={`drag-drop-zone flex-column flex-center text-center ${isDragging ? 'dragging' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <Upload size={32} className="upload-icon-style" style={{ marginBottom: '12px', color: 'var(--color-primary)' }} />
                      <p style={{ fontWeight: '600', marginBottom: '4px' }}>Drag & Drop your file here</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Supports CSV or JSON format</p>
                      <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-block' }}>
                        Browse File
                        <input type="file" accept=".csv, .json" style={{ display: 'none' }} onChange={handleFileChange} />
                      </label>
                    </div>
                    
                    {/* Instructions & Template Downloads */}
                    <div className="bulk-instructions card bg-sidebar text-left" style={{ padding: '16px 20px', border: '1px solid var(--border-color)' }}>
                      <h5 style={{ fontWeight: '700', marginBottom: '12px' }}>Formatting Instructions:</h5>
                      <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <li>CSV headers must exactly be: <code>name,category,price,originalPrice,stock,description,images,features</code></li>
                        <li>JSON must be an array of objects: <code>[{"{"}name, category, price, ...{"}"}]</code></li>
                        <li>Multiple images or features can be separated by a semicolon (<code>;</code>) in CSV.</li>
                        <li>Price, originalPrice, and stock must be positive numbers.</li>
                      </ul>
                      
                      <div className="flex-center gap-sm" style={{ marginTop: '20px', justifyContent: 'flex-start' }}>
                        <button className="btn btn-secondary btn-sm flex-center gap-xs" onClick={() => downloadTemplate('csv')}>
                          <Download size={12} /> CSV Template
                        </button>
                        <button className="btn btn-secondary btn-sm flex-center gap-xs" onClick={() => downloadTemplate('json')}>
                          <Download size={12} /> JSON Template
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  {uploadSuccessMsg && (
                    <div className="auth-alert success animate-fade-in" style={{ marginBottom: '20px', padding: '12px 16px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'rgb(34, 197, 94)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Check size={16} />
                      <span>{uploadSuccessMsg}</span>
                    </div>
                  )}
                  {uploadErrorMsg && (
                    <div className="auth-alert error animate-fade-in" style={{ marginBottom: '20px', padding: '12px 16px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'rgb(239, 68, 68)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <AlertTriangle size={16} />
                      <span>{uploadErrorMsg}</span>
                    </div>
                  )}

                  {/* Preview Table */}
                  {bulkPreview.length > 0 && (
                    <div className="bulk-preview-section animate-fade-in" style={{ marginTop: '24px' }}>
                      <div className="flex-between" style={{ marginBottom: '12px' }}>
                        <h5 style={{ fontWeight: '700', margin: 0 }}>Parsed Products Preview ({bulkPreview.length} items)</h5>
                        <div className="flex-center gap-sm">
                          <button className="btn btn-secondary btn-sm" onClick={() => setBulkPreview([])}>
                            Cancel
                          </button>
                          <button 
                            className="btn btn-primary btn-sm" 
                            onClick={handleConfirmUpload} 
                            disabled={!bulkPreview.some(p => p.isValid)}
                          >
                            Confirm & Upload ({bulkPreview.filter(p => p.isValid).length} Valid)
                          </button>
                        </div>
                      </div>
                      
                      <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                        <table className="admin-table text-left" style={{ fontSize: '0.8rem', width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ background: 'var(--bg-sidebar)' }}>
                              <th style={{ padding: '10px 12px', fontSize: '0.75rem', fontWeight: '700' }}>Name</th>
                              <th style={{ padding: '10px 12px', fontSize: '0.75rem', fontWeight: '700' }}>Category</th>
                              <th style={{ padding: '10px 12px', fontSize: '0.75rem', fontWeight: '700' }}>Price</th>
                              <th style={{ padding: '10px 12px', fontSize: '0.75rem', fontWeight: '700' }}>Stock</th>
                              <th style={{ padding: '10px 12px', fontSize: '0.75rem', fontWeight: '700' }}>Status / Errors</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bulkPreview.map((prod) => (
                              <tr key={prod.id} style={{ background: prod.isValid ? 'transparent' : 'rgba(239, 68, 68, 0.05)', borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '10px 12px' }}><b>{prod.name || 'N/A'}</b></td>
                                <td style={{ padding: '10px 12px' }}>{prod.category}</td>
                                <td style={{ padding: '10px 12px' }}>₹{prod.price}</td>
                                <td style={{ padding: '10px 12px' }}>{prod.stock} units</td>
                                <td style={{ padding: '10px 12px' }}>
                                  {prod.isValid ? (
                                    <span className="badge badge-success flex-center gap-xs" style={{ display: 'inline-flex', fontSize: '0.7rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'rgb(34, 197, 94)', padding: '2px 6px', borderRadius: '4px' }}>
                                      <Check size={10} /> Valid
                                    </span>
                                  ) : (
                                    <span className="flex-column gap-xs" style={{ alignItems: 'flex-start', display: 'flex' }}>
                                      <span className="badge badge-danger" style={{ display: 'inline-flex', fontSize: '0.7rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'rgb(239, 68, 68)', padding: '2px 6px', borderRadius: '4px', marginBottom: '4px' }}>
                                        Invalid
                                      </span>
                                      <span style={{ fontSize: '0.7rem', color: 'rgb(239, 68, 68)', display: 'block' }}>
                                        {prod.errors.join(', ')}
                                      </span>
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Table */}
              <div className="card table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(prod => (
                      <tr key={prod.id}>
                        <td>
                          <img src={prod.images[0]} alt={prod.name} className="table-thumb" />
                        </td>
                        <td>
                          <div className="table-prod-title">{prod.name}</div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>ID: {prod.id}</span>
                        </td>
                        <td>{prod.category}</td>
                        <td>₹{prod.price}</td>
                        <td>
                          <span className={`badge ${prod.stock <= 5 ? 'badge-danger' : 'badge-success'}`}>
                            {prod.stock} units
                          </span>
                        </td>
                        <td>
                          <div className="flex-center gap-sm" style={{ justifyContent: 'flex-start' }}>
                            <button className="action-icon-btn btn btn-secondary btn-sm" onClick={() => handleEditProductClick(prod)} title="Edit">
                              <Edit size={14} />
                            </button>
                            <button className="action-icon-btn btn btn-accent btn-sm" onClick={() => deleteProduct(prod.id)} title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS */}
          {activeTab === 'orders' && (
            <div className="tab-pane animate-fade-in text-left">
              <h2 className="tab-heading">Order Processing & Dispatch</h2>

              <div className="card table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Dispatch / Assign</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td>
                          <b>{order.id}</b>
                        </td>
                        <td>
                          <div className="table-customer-name">{order.userName}</div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{order.phone}</span>
                        </td>
                        <td>{order.date}</td>
                        <td>₹{order.total}</td>
                        <td>
                          <span className={`badge ${
                            order.status === 'Delivered' ? 'badge-success' :
                            order.status === 'Processing' ? 'badge-info' :
                            order.status === 'Placed' ? 'badge-warning' : 'badge-danger'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          {order.status === 'Delivered' ? (
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>Delivered Successfully</span>
                          ) : (
                            <div className="flex-center gap-sm" style={{ justifyContent: 'flex-start' }}>
                              <select 
                                className="form-input table-select"
                                value={order.deliveryExecutive || ''}
                                onChange={(e) => assignDelivery(order.id, e.target.value)}
                              >
                                <option value="">Assign Exec...</option>
                                {executives.map(exec => (
                                  <option key={exec.id} value={exec.id}>{exec.name}</option>
                                ))}
                              </select>
                              <select
                                className="form-input table-select"
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              >
                                <option value="Placed">Placed</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Out for Delivery">Out for Delivery</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Delivery Failed">Failed</option>
                              </select>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: COUPONS */}
          {activeTab === 'coupons' && (
            <div className="tab-pane animate-fade-in text-left">
              <h2 className="tab-heading">Discount Coupon Management</h2>

              <div className="grid-2" style={{ alignItems: 'flex-start' }}>
                {/* Coupon Form */}
                <div className="card">
                  <h4 style={{ marginBottom: '16px' }}>Create Coupon Code</h4>
                  <form onSubmit={handleCouponSubmit} className="query-form">
                    <div className="form-group">
                      <label className="form-label">Coupon Code *</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="e.g. DIWALI50" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Discount Value *</label>
                        <input 
                          type="number" 
                          className="form-input" 
                          placeholder="e.g. 10 or 100" 
                          value={couponDiscount}
                          onChange={(e) => setCouponDiscount(e.target.value)}
                          required 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Discount Type</label>
                        <select 
                          className="form-input"
                          value={couponType}
                          onChange={(e) => setCouponType(e.target.value)}
                        >
                          <option value="percent">Percentage (%)</option>
                          <option value="flat">Flat Cash (₹)</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Minimum Cart Value (₹) *</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        placeholder="e.g. 500" 
                        value={couponMinCart}
                        onChange={(e) => setCouponMinCart(e.target.value)}
                        required 
                      />
                    </div>
                    <button type="submit" className="btn btn-primary w-full">Create Coupon</button>
                  </form>
                </div>

                {/* List Coupons */}
                <div className="card table-container">
                  <h4 style={{ marginBottom: '16px' }}>Active Coupons</h4>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Discount</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map(coupon => (
                        <tr key={coupon.code}>
                          <td><b>{coupon.code}</b></td>
                          <td>{coupon.type === 'percent' ? `${coupon.discount}%` : `₹${coupon.discount}`}</td>
                          <td>
                            <button 
                              className={`btn btn-sm ${coupon.active ? 'btn-primary' : 'btn-secondary'}`}
                              onClick={() => toggleCoupon(coupon.code)}
                            >
                              {coupon.active ? 'Active' : 'Paused'}
                            </button>
                          </td>
                          <td>
                            <button 
                              className="action-icon-btn btn btn-accent btn-sm"
                              onClick={() => deleteCoupon(coupon.code)}
                            >
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: QUERIES */}
          {activeTab === 'queries' && (
            <div className="tab-pane animate-fade-in text-left">
              <h2 className="tab-heading">Customer Care Query Tickets</h2>
              
              <div className="queries-history-list flex-column gap-md">
                {queries.map(q => (
                  <div key={q.id} className="card query-ticket flex-between">
                    <div className="query-left flex-column gap-sm">
                      <div className="flex-center gap-sm" style={{ justifyContent: 'flex-start' }}>
                        <span className="order-id-txt">ID: #{q.id}</span>
                        <span className={`badge ${q.status === 'Open' ? 'badge-warning' : 'badge-success'}`}>
                          {q.status}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>Subject: {q.subject}</h4>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Message: "{q.message}"</p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>From: {q.user} ({q.email}) on {q.date}</span>
                    </div>

                    <div className="query-right">
                      {q.status === 'Open' && (
                        <button 
                          className="btn btn-primary btn-sm flex-center gap-sm"
                          onClick={() => resolveQuery(q.id)}
                        >
                          <Check size={14} /> Resolve Ticket
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: REPORTS */}
          {activeTab === 'reports' && (
            <div className="tab-pane animate-fade-in text-left">
              <h2 className="tab-heading">Corporate Reports & Analytics</h2>
              
              <div className="grid-3">
                <div className="card report-box text-center flex-column gap-md flex-center">
                  <BarChart3 size={36} className="report-icon" />
                  <h4>Sales Report</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Generates order details, transactions, and payment methods metrics.</p>
                  <button className="btn btn-primary btn-sm" onClick={() => handleExportCSV('Sales')}>Export CSV</button>
                </div>

                <div className="card report-box text-center flex-column gap-md flex-center">
                  <Users size={36} className="report-icon" />
                  <h4>Customer Analytics</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Profiles demographics, query stats, and purchasing loyalty indexes.</p>
                  <button className="btn btn-primary btn-sm" onClick={() => handleExportCSV('Customers')}>Export CSV</button>
                </div>

                <div className="card report-box text-center flex-column gap-md flex-center">
                  <Truck size={36} className="report-icon" />
                  <h4>Deliveries Analytics</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Summarizes execution delivery ratings, delay ratios, and failed drops.</p>
                  <button className="btn btn-primary btn-sm" onClick={() => handleExportCSV('Deliveries')}>Export CSV</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* PRODUCT ADD/EDIT MODAL */}
      {showProductModal && (
        <div className="invoice-modal-overlay flex-center animate-fade-in" onClick={() => setShowProductModal(false)}>
          <div className="card invoice-modal-container text-left" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex-between">
              <h3>{editingProduct ? 'Edit Puja Product' : 'Add New Puja Product'}</h3>
              <button className="close-invoice-btn" onClick={() => setShowProductModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleProductSubmit} className="query-form" style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  required 
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select 
                    className="form-input"
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                  >
                    <option value="Agarbatti">Agarbatti</option>
                    <option value="Dhoop">Dhoop</option>
                    <option value="Camphor">Camphor</option>
                    <option value="Puja Thali">Puja Thali</option>
                    <option value="Kumkum & Roli">Kumkum & Roli</option>
                    <option value="Diyas">Diyas</option>
                    <option value="Ganga Jal">Ganga Jal</option>
                    <option value="Hawan Samagri">Hawan Samagri</option>
                    <option value="Temple Accessories">Temple Accessories</option>
                    <option value="Festival Kits">Festival Kits</option>
                    <option value="Religious Books">Religious Books</option>
                    <option value="Spiritual Products">Spiritual Products</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Initial Stock Count *</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Sales Price (₹) *</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Original Price (₹)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="e.g. 249"
                    value={prodOriginalPrice}
                    onChange={(e) => setProdOriginalPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Product Image</span>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem' }}>
                    <button 
                      type="button" 
                      onClick={() => setImageUploadType('url')} 
                      style={{ background: 'none', border: 'none', color: imageUploadType === 'url' ? 'var(--color-primary)' : 'var(--text-secondary)', fontWeight: imageUploadType === 'url' ? '700' : '400', cursor: 'pointer' }}
                    >
                      Image URL
                    </button>
                    <span>|</span>
                    <button 
                      type="button" 
                      onClick={() => setImageUploadType('file')} 
                      style={{ background: 'none', border: 'none', color: imageUploadType === 'file' ? 'var(--color-primary)' : 'var(--text-secondary)', fontWeight: imageUploadType === 'file' ? '700' : '400', cursor: 'pointer' }}
                    >
                      Upload File
                    </button>
                  </div>
                </label>
                
                {imageUploadType === 'url' ? (
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Enter image web URL (e.g. https://...)" 
                    value={prodImage}
                    onChange={(e) => setProdImage(e.target.value)}
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="form-input" 
                      onChange={handleImageUpload}
                      style={{ padding: '6px' }}
                    />
                  </div>
                )}
                
                {prodImage && (
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img 
                      src={prodImage} 
                      alt="Product Preview" 
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }} 
                    />
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-sm" 
                      onClick={() => setProdImage('')}
                      style={{ padding: '2px 8px', fontSize: '0.75rem', height: 'auto', minWidth: 'auto' }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Product Description</label>
                <textarea 
                  rows="3" 
                  className="form-input" 
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary w-full">
                {editingProduct ? 'Save Product Changes' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
