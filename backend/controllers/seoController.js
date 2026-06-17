import Seo from '../models/Seo.js';

// @desc    Get SEO configs
// @route   GET /api/seo
// @access  Public
const getSEOConfig = async (req, res) => {
  try {
    let seo = await Seo.findOne({});
    
    // Seed initial SEO if missing
    if (!seo) {
      seo = await Seo.create({
        homeTitle: 'Puja Samagri Online - Buy Authentic Spiritual Ritual Items | Cyvanta',
        homeMetaDesc: 'Browse and purchase premium quality puja samagri online. Agarbatti, Dhoop, Diyas, Hawan Samagri, Temple Accessories delivered to your door.',
        sitemapUrl: 'https://cyvantapujasamagri.com/sitemap.xml',
        schemaMarkupEnabled: true
      });
    }
    
    res.json(seo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update SEO Configs (Admin only)
// @route   PUT /api/seo
// @access  Private/Admin
const updateSEOConfig = async (req, res) => {
  const { homeTitle, homeMetaDesc, sitemapUrl, schemaMarkupEnabled } = req.body;

  try {
    let seo = await Seo.findOne({});

    if (seo) {
      seo.homeTitle = homeTitle !== undefined ? homeTitle : seo.homeTitle;
      seo.homeMetaDesc = homeMetaDesc !== undefined ? homeMetaDesc : seo.homeMetaDesc;
      seo.sitemapUrl = sitemapUrl !== undefined ? sitemapUrl : seo.sitemapUrl;
      seo.schemaMarkupEnabled = schemaMarkupEnabled !== undefined ? schemaMarkupEnabled : seo.schemaMarkupEnabled;
      
      const updatedSeo = await seo.save();
      res.json(updatedSeo);
    } else {
      const newSeo = await Seo.create({
        homeTitle,
        homeMetaDesc,
        sitemapUrl,
        schemaMarkupEnabled
      });
      res.json(newSeo);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getSEOConfig,
  updateSEOConfig
};
