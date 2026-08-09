import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    category: {
      type: String,
      required: true,
      enum: ['books', 'notes', 'electronics', 'laptops', 'mobiles', 'hostel', 'furniture', 'fashion', 'sports', 'calculators', 'cycles', 'gaming', 'accessories', 'others']
    },
    condition: { type: String, enum: ['Like New', 'Good', 'Fair'], default: 'Good' },
    images: [{ type: String, required: true }],
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Contact + location, shown on the listing like OLX ("post with number and location")
    phone: { type: String, required: true },
    location: {
      address: { type: String, required: true }, // e.g. "Block C Hostel, XYZ University"
      lat: { type: Number },
      lng: { type: Number }
    },

    allowCOD: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'sold', 'reported', 'removed'], default: 'active' },
    reportCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 }
  },
  { timestamps: true }
);

productSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Product', productSchema);
