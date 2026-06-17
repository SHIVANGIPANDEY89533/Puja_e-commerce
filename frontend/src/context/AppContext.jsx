import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

// Mock Initial Products
const initialProducts = [
  {
    id: 1,
    name: 'Premium Sandalwood Agarbatti',
    category: 'Agarbatti',
    price: 199,
    originalPrice: 249,
    stock: 45,
    rating: 4.8,
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop&q=60'
    ],
    description: 'Slow-burning, hand-rolled sandalwood incense sticks designed to create a calm, soothing atmosphere for meditation and daily prayers. Clean burn, low smoke.',
    features: ['100% Natural Ingredients', 'Burn time: 45 mins per stick', 'Eco-friendly packaging']
  },
  {
    id: 2,
    name: 'Natural Loban Dhoop Cups',
    category: 'Dhoop',
    price: 149,
    originalPrice: 199,
    stock: 30,
    rating: 4.6,
    images: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&auto=format&fit=crop&q=60'
    ],
    description: 'Traditional charcoal-free Loban cups filled with high-grade resins that purify the air, repel insects, and release a rich, warm, traditional fragrance.',
    features: ['Purifying properties', 'Non-toxic, safe formulation', 'Includes metal holder']
  },
  {
    id: 3,
    name: 'Pure Bhimseni Camphor (Kapur)',
    category: 'Camphor',
    price: 299,
    originalPrice: 349,
    stock: 12, // Low stock to trigger alert!
    rating: 4.9,
    images: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop&q=60'
    ],
    description: '100% pure Bhimseni camphor crystals. Free from chemicals and additives. Ideal for Puja, Aarti, and diffusing for an invigorating aromatic experience.',
    features: ['Edible-grade purity', 'Leaves no residue upon burning', 'Perfect for diffuser/kapoordan']
  },
  {
    id: 4,
    name: 'Premium Brass Puja Thali Set (11 pcs)',
    category: 'Puja Thali',
    price: 1299,
    originalPrice: 1599,
    stock: 20,
    rating: 4.7,
    images: [
      'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=500&auto=format&fit=crop&q=60'
    ],
    description: 'Beautifully engraved brass Puja plate containing diya, incense holder, kumkum wati, bell, and spoon. Handcrafted by local artisans for a majestic altar appearance.',
    features: ['High-quality brass material', 'Sturdy and durable design', 'Ideal gift for housewarming & festivals']
  },
  {
    id: 5,
    name: 'Shuddh Roli Kumkum Powder',
    category: 'Kumkum & Roli',
    price: 89,
    originalPrice: 99,
    stock: 150,
    rating: 4.5,
    images: [
      'https://images.unsplash.com/photo-1617791160536-598cf32026fb?w=500&auto=format&fit=crop&q=60'
    ],
    description: 'Traditional, non-toxic, skin-friendly Roli Kumkum made from turmeric and lime. Perfect for Tilak, festive occasions, and daily rituals.',
    features: ['Chemical-free', 'Deep red color', 'Gentle on skin']
  },
  {
    id: 6,
    name: 'Handcrafted Clay Diyas (Pack of 12)',
    category: 'Diyas',
    price: 119,
    originalPrice: 149,
    stock: 80,
    rating: 4.7,
    images: [
      'https://images.unsplash.com/photo-1605847444195-223040b5d97d?w=500&auto=format&fit=crop&q=60'
    ],
    description: 'Eco-friendly, terracotta clay diyas handmade by local potters. Perfect for lighting up your home during Diwali and auspicious festivals.',
    features: ['100% natural clay', 'Holds oil/ghee for long hours', 'Traditional design']
  },
  {
    id: 7,
    name: 'Gangotri Ganga Jal (500ml)',
    category: 'Ganga Jal',
    price: 150,
    originalPrice: 180,
    stock: 5, // Low stock to trigger alert!
    rating: 4.9,
    images: [
      'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?w=500&auto=format&fit=crop&q=60'
    ],
    description: 'Sterilized, sealed holy Gangajal sourced directly from Gangotri. Bottled with utmost hygiene to preserve its sacred healing properties.',
    features: ['Untouched by hands', 'Leak-proof food-grade bottle', 'Auspicious for all home rituals']
  },
  {
    id: 8,
    name: 'Sacred Hawan Samagri Mix (500g)',
    category: 'Hawan Samagri',
    price: 249,
    originalPrice: 299,
    stock: 60,
    rating: 4.6,
    images: [
      'https://images.unsplash.com/photo-1534080391025-a77d612e4f0a?w=500&auto=format&fit=crop&q=60'
    ],
    description: 'A rich mixture of sacred herbs, roots, dry leaves, sandalwood sawdust, loban, and camphor, curated for Yajna, Hawan, and Griha Pravesh.',
    features: ['Blend of 51 natural herbs', 'Pleasant woodsy aroma', 'Purifies environmental atmosphere']
  },
  {
    id: 9,
    name: 'Brass Pooja Hand Bell (Ganti)',
    category: 'Temple Accessories',
    price: 349,
    originalPrice: 449,
    stock: 25,
    rating: 4.8,
    images: [
      'https://images.unsplash.com/photo-1609137144813-f92e01df222d?w=500&auto=format&fit=crop&q=60'
    ],
    description: 'Classic polished brass hand bell that produces a clear, melodious, and resonant sound to keep negative energies away during prayers.',
    features: ['Solid brass casting', 'Intricate carvings on handle', 'High resonance tone']
  },
  {
    id: 10,
    name: 'Complete Diwali Lakshmi Puja Kit',
    category: 'Festival Kits',
    price: 999,
    originalPrice: 1299,
    stock: 15,
    rating: 4.9,
    images: [
      'https://images.unsplash.com/photo-1545224933-73c73716613e?w=500&auto=format&fit=crop&q=60'
    ],
    description: 'An all-in-one Puja kit containing all essentials required for Lakshmi Puja, including Laxmi Ganesh photos, roli, moli, supari, honey, gangajal, dhoop, agarbatti, clay diyas, and cotton wicks.',
    features: ['Over 30 essential items included', 'Step-by-step guidebook included', 'Saves hours of shopping prep']
  },
  {
    id: 11,
    name: 'Bhagavad Gita As It Is',
    category: 'Religious Books',
    price: 280,
    originalPrice: 350,
    stock: 40,
    rating: 5.0,
    images: [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=60'
    ],
    description: 'The largest selling edition of Bhagavad Gita. Contains original Sanskrit texts, transliterations, English translations, and detailed purports by A.C. Bhaktivedanta Swami Prabhupada.',
    features: ['Hardbound premium print', 'Full illustrations inside', 'Available in multiple languages']
  },
  {
    id: 12,
    name: 'Original 108 Beads Rudraksha Mala',
    category: 'Spiritual Products',
    price: 499,
    originalPrice: 699,
    stock: 18,
    rating: 4.7,
    images: [
      'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=60'
    ],
    description: 'Authentic 5-Mukhi Rudraksha mala consisting of 108 + 1 beads, knotted traditionally. Best suited for mantra chanting, Japa, and spiritual healing.',
    features: ['Sourced from Himalayan region', 'Lab certified authentic beads', 'Red tassel decoration']
  }
];

// Initial mock reviews
const initialReviews = {
  1: [
    { id: 101, user: 'Aman Sharma', rating: 5, comment: 'The aroma is so pure and stays for hours. High quality sandalwood!', date: '2026-06-01' },
    { id: 102, user: 'Sita Verma', rating: 4, comment: 'Very pleasant, low smoke as advertised. Highly recommend it.', date: '2026-06-05' }
  ],
  2: [
    { id: 201, user: 'Rajesh K.', rating: 5, comment: 'Smells exactly like temple Loban. Creates a perfect meditative environment.', date: '2026-05-28' }
  ],
  3: [
    { id: 301, user: 'Geeta Patel', rating: 5, comment: 'Purest camphor I have ever purchased. Burns completely without leaving a trace!', date: '2026-06-10' }
  ]
};

// Initial Mock Orders
const initialOrders = [
  {
    id: 'ORD-9872',
    date: '2026-06-12',
    userId: 'cust-1',
    userName: 'Rahul Dev',
    email: 'rahul.dev@gmail.com',
    address: '102, Shanti Kunj, Park Street, New Delhi - 110001',
    phone: '9876543210',
    items: [
      { id: 1, name: 'Premium Sandalwood Agarbatti', price: 199, qty: 2 },
      { id: 3, name: 'Pure Bhimseni Camphor (Kapur)', price: 299, qty: 1 }
    ],
    total: 697,
    status: 'Delivered',
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    deliveryExecutive: 'exec-1',
    deliveryNotes: 'Left at reception'
  },
  {
    id: 'ORD-5431',
    date: '2026-06-15',
    userId: 'cust-1',
    userName: 'Rahul Dev',
    email: 'rahul.dev@gmail.com',
    address: '102, Shanti Kunj, Park Street, New Delhi - 110001',
    phone: '9876543210',
    items: [
      { id: 4, name: 'Premium Brass Puja Thali Set (11 pcs)', price: 1299, qty: 1 }
    ],
    total: 1299,
    status: 'Processing',
    paymentMethod: 'Credit Card',
    paymentStatus: 'Paid',
    deliveryExecutive: null,
    deliveryNotes: ''
  },
  {
    id: 'ORD-1090',
    date: '2026-06-16',
    userId: 'cust-2',
    userName: 'Priya Sen',
    email: 'priya.sen@yahoo.com',
    address: 'Flat 4B, Sunrise Heights, Sector 62, Noida - 201301',
    phone: '9123456789',
    items: [
      { id: 10, name: 'Complete Diwali Lakshmi Puja Kit', price: 999, qty: 1 },
      { id: 6, name: 'Handcrafted Clay Diyas (Pack of 12)', price: 119, qty: 2 }
    ],
    total: 1237,
    status: 'Placed',
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Pending',
    deliveryExecutive: null,
    deliveryNotes: ''
  }
];

// Initial mock coupons
const initialCoupons = [
  { code: 'WELCOME10', discount: 10, type: 'percent', active: true, minCart: 500 },
  { code: 'FESTIVAL20', discount: 20, type: 'percent', active: true, minCart: 1000 },
  { code: 'PUJA100', discount: 100, type: 'flat', active: true, minCart: 800 }
];

// Initial campaigns
const initialCampaigns = [
  {
    id: 'CAMP-01',
    name: 'Diwali Festive Launch Campaign',
    type: 'Email',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    status: 'Running',
    sent: 1200,
    opened: 850,
    clicked: 320,
    conversions: 45
  },
  {
    id: 'CAMP-02',
    name: 'Sandalwood Incense Stick Promo',
    type: 'WhatsApp',
    startDate: '2026-06-10',
    endDate: '2026-06-20',
    status: 'Running',
    sent: 500,
    opened: 480,
    clicked: 190,
    conversions: 22
  },
  {
    id: 'CAMP-03',
    name: 'Cart Recovery Automation',
    type: 'Email',
    startDate: '2026-05-01',
    endDate: '2026-08-30',
    status: 'Scheduled',
    sent: 0,
    opened: 0,
    clicked: 0,
    conversions: 0
  }
];

// Support Queries
const initialQueries = [
  { id: 1001, user: 'Karan Mehra', email: 'karan@gmail.com', subject: 'Late delivery request', message: 'Can my order be delivered after 6 PM?', status: 'Open', date: '2026-06-15' },
  { id: 1002, user: 'Suman Rao', email: 'suman@outlook.com', subject: 'Damaged item received', message: 'One clay diya was chipped. Can I get a replacement?', status: 'Resolved', date: '2026-06-14' }
];

export const AppProvider = ({ children }) => {
  // Active App Mode/Role Selector (Simulates multi-panel entry)
  // Options: 'customer', 'admin', 'delivery'
  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem('pujasamagri_role') || 'customer';
  });

  // State Declarations
  const [products, setProducts] = useState(() => {
    const local = localStorage.getItem('pujasamagri_products');
    return local ? JSON.parse(local) : initialProducts;
  });

  const [reviews, setReviews] = useState(() => {
    const local = localStorage.getItem('pujasamagri_reviews');
    return local ? JSON.parse(local) : initialReviews;
  });

  const [orders, setOrders] = useState(() => {
    const local = localStorage.getItem('pujasamagri_orders');
    return local ? JSON.parse(local) : initialOrders;
  });

  const [coupons, setCoupons] = useState(() => {
    const local = localStorage.getItem('pujasamagri_coupons');
    return local ? JSON.parse(local) : initialCoupons;
  });

  const [campaigns, setCampaigns] = useState(() => {
    const local = localStorage.getItem('pujasamagri_campaigns');
    return local ? JSON.parse(local) : initialCampaigns;
  });

  const [queries, setQueries] = useState(() => {
    const local = localStorage.getItem('pujasamagri_queries');
    return local ? JSON.parse(local) : initialQueries;
  });

  // Customer Shopping State
  const [cart, setCart] = useState(() => {
    const local = localStorage.getItem('pujasamagri_cart');
    return local ? JSON.parse(local) : [];
  });

  const [wishlist, setWishlist] = useState(() => {
    const local = localStorage.getItem('pujasamagri_wishlist');
    return local ? JSON.parse(local) : [];
  });

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    const local = localStorage.getItem('pujasamagri_user');
    return local && local !== 'null' ? JSON.parse(local) : null;
  });

  // SEO configuration state
  const [seoConfig, setSeoConfig] = useState(() => {
    const local = localStorage.getItem('pujasamagri_seo');
    return local ? JSON.parse(local) : {
      homeTitle: 'Puja Samagri Online - Buy Authentic Spiritual Ritual Items | Cyvanta',
      homeMetaDesc: 'Browse and purchase premium quality puja samagri online. Agarbatti, Dhoop, Diyas, Hawan Samagri, Temple Accessories & custom Festival Kits delivered to your door.',
      sitemapUrl: 'https://cyvantapujasamagri.com/sitemap.xml',
      schemaMarkupEnabled: true
    };
  });

  // Synchronize with LocalStorage on state changes
  useEffect(() => {
    localStorage.setItem('pujasamagri_role', activeRole);
  }, [activeRole]);

  useEffect(() => {
    localStorage.setItem('pujasamagri_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('pujasamagri_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('pujasamagri_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('pujasamagri_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('pujasamagri_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  useEffect(() => {
    localStorage.setItem('pujasamagri_queries', JSON.stringify(queries));
  }, [queries]);

  useEffect(() => {
    localStorage.setItem('pujasamagri_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('pujasamagri_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('pujasamagri_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('pujasamagri_seo', JSON.stringify(seoConfig));
  }, [seoConfig]);

  // --- ACTIONS ---

  // Role Switcher
  const switchRole = (role) => {
    setActiveRole(role);
  };

  // Auth Operations
  const loginUser = (user, role = 'customer') => {
    setCurrentUser(user);
    setActiveRole(role);
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setCart([]);
    setWishlist([]);
    setActiveRole('customer');
  };

  const updateProfile = (data) => {
    setCurrentUser(prev => ({ ...prev, ...data }));
  };

  // Cart Operations
  const addToCart = (productId, qty = 1, saveLater = false) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing) {
        return prev.map(item => 
          item.id === productId 
            ? { ...item, qty: Math.min(item.qty + qty, product.stock), saveLater } 
            : item
        );
      }
      return [...prev, { id: productId, name: product.name, price: product.price, image: product.images[0], qty, saveLater }];
    });
  };

  const updateCartQty = (productId, qty) => {
    setCart(prev => 
      prev.map(item => item.id === productId ? { ...item, qty: Math.max(1, qty) } : item)
    );
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const toggleSaveLater = (productId) => {
    setCart(prev => 
      prev.map(item => item.id === productId ? { ...item, saveLater: !item.saveLater } : item)
    );
  };

  // Wishlist Operations
  const toggleWishlist = (productId) => {
    setWishlist(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  // Checkout & Ordering
  const placeOrder = (shippingDetails, paymentMethod, discountAmount = 0, customItems = null) => {
    const cartItems = customItems || cart.filter(item => !item.saveLater);
    if (cartItems.length === 0) return null;

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const total = Math.max(0, subtotal - discountAmount);

    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      userId: currentUser?.id || 'guest',
      userName: shippingDetails.name,
      email: currentUser?.email || shippingDetails.email,
      address: `${shippingDetails.address}, ${shippingDetails.city} - ${shippingDetails.pincode}`,
      phone: shippingDetails.phone,
      items: cartItems.map(item => ({ id: item.id, name: item.name, price: item.price, qty: item.qty })),
      total: total,
      status: 'Placed',
      paymentMethod: paymentMethod,
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
      deliveryExecutive: null,
      deliveryNotes: ''
    };

    // Update orders state
    setOrders(prev => [newOrder, ...prev]);

    // Reduce product stock levels
    setProducts(prev => 
      prev.map(p => {
        const orderItem = cartItems.find(item => item.id === p.id);
        return orderItem ? { ...p, stock: Math.max(0, p.stock - orderItem.qty) } : p;
      })
    );

    // Clear cart (only active items, and only if not custom direct buy)
    if (!customItems) {
      setCart(prev => prev.filter(item => item.saveLater));
    }

    return newOrder;
  };

  // Admin / Delivery Operations
  const updateOrderStatus = (orderId, status) => {
    setOrders(prev => 
      prev.map(o => o.id === orderId ? { ...o, status } : o)
    );
  };

  const assignDelivery = (orderId, executiveId) => {
    setOrders(prev => 
      prev.map(o => o.id === orderId ? { ...o, deliveryExecutive: executiveId, status: 'Processing' } : o)
    );
  };

  const updateDeliveryStatus = (orderId, status, notes = '') => {
    setOrders(prev => 
      prev.map(o => {
        if (o.id === orderId) {
          const paymentStatus = status === 'Delivered' ? 'Paid' : o.paymentStatus;
          return { ...o, status, deliveryNotes: notes, paymentStatus };
        }
        return o;
      })
    );
  };

  // Product CRUD
  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
      rating: 5.0,
      images: product.images && product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1605847444195-223040b5d97d?w=500&auto=format&fit=crop&q=60']
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (updatedProd) => {
    setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const bulkUploadProducts = (newProds) => {
    let currentMaxId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 0;
    const formattedProds = newProds.map((p, idx) => {
      return {
        ...p,
        id: currentMaxId + idx + 1,
        rating: Number(p.rating) || 5.0,
        price: Number(p.price) || 0,
        originalPrice: Number(p.originalPrice || p.price) || 0,
        stock: Number(p.stock) || 0,
        images: p.images && p.images.length > 0 ? (Array.isArray(p.images) ? p.images : [p.images]) : ['https://images.unsplash.com/photo-1605847444195-223040b5d97d?w=500&auto=format&fit=crop&q=60'],
        features: p.features || ['Premium Quality', 'Handcrafted', 'Divine Aroma']
      };
    });
    setProducts(prev => [...prev, ...formattedProds]);
    return formattedProds;
  };

  // Reviews CRUD
  const addReview = (productId, rating, comment) => {
    const newReview = {
      id: Math.floor(Math.random() * 100000),
      user: currentUser?.name || 'Anonymous',
      rating: Number(rating),
      comment,
      date: new Date().toISOString().split('T')[0]
    };
    setReviews(prev => ({
      ...prev,
      [productId]: prev[productId] ? [...prev[productId], newReview] : [newReview]
    }));
  };

  // Coupon Operations
  const addCoupon = (coupon) => {
    setCoupons(prev => [...prev, { ...coupon, active: true }]);
  };

  const deleteCoupon = (code) => {
    setCoupons(prev => prev.filter(c => c.code !== code));
  };

  const toggleCoupon = (code) => {
    setCoupons(prev => prev.map(c => c.code === code ? { ...c, active: !c.active } : c));
  };

  // Campaign Operations
  const addCampaign = (campaign) => {
    const newCamp = {
      ...campaign,
      id: `CAMP-${Math.floor(10 + Math.random() * 90)}`,
      sent: campaign.status === 'Running' ? 100 : 0,
      opened: 0,
      clicked: 0,
      conversions: 0
    };
    setCampaigns(prev => [...prev, newCamp]);
  };

  const updateCampaignStatus = (campaignId, status) => {
    setCampaigns(prev => 
      prev.map(c => c.id === campaignId ? { ...c, status } : c)
    );
  };

  // Support tickets
  const addQuery = (query) => {
    setQueries(prev => [...prev, {
      ...query,
      id: prev.length > 0 ? Math.max(...prev.map(q => q.id)) + 1 : 1001,
      status: 'Open',
      date: new Date().toISOString().split('T')[0]
    }]);
  };

  const resolveQuery = (id) => {
    setQueries(prev => prev.map(q => q.id === id ? { ...q, status: 'Resolved' } : q));
  };

  return (
    <AppContext.Provider
      value={{
        activeRole,
        switchRole,
        products,
        reviews,
        orders,
        coupons,
        campaigns,
        queries,
        cart,
        wishlist,
        currentUser,
        seoConfig,
        setSeoConfig,
        loginUser,
        logoutUser,
        updateProfile,
        addToCart,
        updateCartQty,
        removeFromCart,
        toggleSaveLater,
        toggleWishlist,
        placeOrder,
        updateOrderStatus,
        assignDelivery,
        updateDeliveryStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        bulkUploadProducts,
        addReview,
        addCoupon,
        deleteCoupon,
        toggleCoupon,
        addCampaign,
        updateCampaignStatus,
        addQuery,
        resolveQuery
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
