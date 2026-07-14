import mongoose from 'mongoose';

const affiliateProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    price: { type: String, required: true },
    rating: { type: Number, default: 4.5 },
    category: {
      type: String,
      required: true,
      enum: ['books', 'notes', 'electronics', 'laptops', 'mobiles', 'hostel', 'furniture', 'fashion', 'sports', 'calculators', 'cycles', 'gaming', 'accessories', 'others']
    },
    affiliateLink: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model('AffiliateProduct', affiliateProductSchema);