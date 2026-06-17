import mongoose from 'mongoose';

const seoSchema = mongoose.Schema(
  {
    homeTitle: {
      type: String,
      required: true,
      default: 'Puja Samagri Online - Buy Authentic Spiritual Ritual Items'
    },
    homeMetaDesc: {
      type: String,
      required: true,
      default: 'Browse and purchase premium quality puja samagri online. Agarbatti, Dhoop, Diyas, Hawan Samagri delivered to your door.'
    },
    sitemapUrl: {
      type: String,
      default: 'https://cyvantapujasamagri.com/sitemap.xml'
    },
    schemaMarkupEnabled: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Seo = mongoose.model('Seo', seoSchema);

export default Seo;
