import mongoose from 'mongoose';

const settingSchema = mongoose.Schema(
  {
    storeName: { type: String, default: 'Puja Ecommerce' },
    storeLogo: { type: String, default: '' },
    contactEmail: { type: String, default: 'support@example.com' },
    phoneNumber: { type: String, default: '' },
    whatsappNumber: { type: String, default: '' },
    storeAddress: { type: String, default: '' },
    
    deliveryCharges: { type: Number, default: 0 },
    freeDeliveryThreshold: { type: Number, default: 0 },
    taxGst: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    timeZone: { type: String, default: 'Asia/Kolkata' },

    razorpayEnabled: { type: Boolean, default: true },
    stripeEnabled: { type: Boolean, default: false },
    codEnabled: { type: Boolean, default: true },
    
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: false },
    whatsappNotifications: { type: Boolean, default: false },

    theme: { type: String, default: 'light' },
    maintenanceMode: { type: Boolean, default: false },
    supportContact: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

const Setting = mongoose.model('Setting', settingSchema);
export default Setting;
