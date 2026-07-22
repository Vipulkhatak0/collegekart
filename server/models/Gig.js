import mongoose from 'mongoose';

const gigSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['assignment', 'project', 'presentation', 'typing', 'design', 'coding', 'other']
    },
    price: { type: Number, required: true },
    deliveryDays: { type: Number, required: true },
    portfolioImage: { type: String },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['active', 'paused'], default: 'active' }
  },
  { timestamps: true }
);

export default mongoose.model('Gig', gigSchema);