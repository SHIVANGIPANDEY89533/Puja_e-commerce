import React, { useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import ProductCard from '../../components/user/ProductCard';
import { SlidersHorizontal, Search, RotateCcw, X } from 'lucide-react';
import './Shop.css';

export default function Shop() {
  const { products } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Get search params
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get('category') || '';
  const searchParam = queryParams.get('search') || '';

  // Local filter states
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [priceRange, setPriceRange] = useState(2000);
  const [sortBy, setSortBy] = useState('featured');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Synchronize URL search params with local states when location changes
  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    setSearchQuery(searchParam);
  }, [searchParam]);

  const categories = [
    'Agarbatti',
    'Dhoop',
    'Camphor',
    'Puja Thali',
    'Kumkum & Roli',
    'Diyas',
    'Ganga Jal',
    'Hawan Samagri',
    'Temple Accessories',
    'Festival Kits',
    'Religious Books',
    'Spiritual Products'
  ];

  // Filter and Sort Logic
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    const matchesSearch = searchQuery
      ? product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesPrice = product.price <= priceRange;
    return matchesCategory && matchesSearch && matchesPrice;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0; // Default Featured (raw list)
  });

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setPriceRange(2000);
    setSortBy('featured');
    navigate('/shop');
  };

  const handleCategorySelect = (category) => {
    const newCat = selectedCategory === category ? '' : category;
    setSelectedCategory(newCat);
    if (newCat) {
      navigate(`/shop?category=${encodeURIComponent(newCat)}`);
    } else {
      navigate('/shop');
    }
  };

  return (
    <div className="shop-page container">
      {/* Search Header */}
      <div className="shop-header flex-between">
        <div className="shop-title-box text-left">
          <h1 className="title-lg">Spiritual Collection</h1>
          <p className="shop-subtitle">
            Showing {sortedProducts.length} of {products.length} sacred items
          </p>
        </div>

        <div className="shop-sorting-options flex-center gap-md">
          <select 
            className="form-input sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="featured">Featured Picks</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
          <button 
            className="btn btn-secondary mobile-filter-toggle"
            onClick={() => setShowMobileFilters(true)}
          >
            <SlidersHorizontal size={18} /> Filters
          </button>
        </div>
      </div>

      <div className="shop-main-layout">
        {/* Sidebar Filters */}
        <aside className={`shop-sidebar-filters ${showMobileFilters ? 'mobile-show' : ''}`}>
          <div className="sidebar-header flex-between">
            <h3>Filters</h3>
            <button className="close-filters-btn" onClick={() => setShowMobileFilters(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Search box */}
          <div className="filter-group-box">
            <h4 className="filter-title">Search Products</h4>
            <div className="search-input-wrapper">
              <input 
                type="text" 
                className="form-input search-input" 
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search size={18} className="search-icon" />
            </div>
          </div>

          {/* Categories */}
          <div className="filter-group-box">
            <h4 className="filter-title">Categories</h4>
            <div className="category-links-list">
              {categories.map((cat, idx) => (
                <button
                  key={idx}
                  className={`category-filter-item ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(cat)}
                >
                  <span className="bullet"></span>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="filter-group-box">
            <h4 className="filter-title">Price Filter</h4>
            <div className="price-slider-box">
              <input 
                type="range" 
                min="50" 
                max="2000" 
                step="50"
                value={priceRange} 
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="price-range-input"
              />
              <div className="price-labels flex-between">
                <span>Min: ₹50</span>
                <span>Max: <b>₹{priceRange}</b></span>
              </div>
            </div>
          </div>

          {/* Reset button */}
          <button className="btn btn-secondary w-full reset-btn" onClick={handleResetFilters}>
            <RotateCcw size={16} /> Reset All Filters
          </button>
        </aside>

        {/* Product Grid Area */}
        <main className="shop-product-grid-area">
          {sortedProducts.length === 0 ? (
            <div className="no-products-found card glass text-center">
              <h2>Auspicious items not found</h2>
              <p>No products match your current filters. Try relaxing the search parameters or resetting the filters.</p>
              <button className="btn btn-primary" onClick={handleResetFilters}>
                View All Products
              </button>
            </div>
          ) : (
            <div className="grid-3">
              {sortedProducts.map(prod => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
