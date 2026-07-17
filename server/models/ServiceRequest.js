import mongoose from 'mongoose';

const serviceRequestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['assignment', 'project', 'presentation', 'typing', 'design', 'coding', 'other']
    },
    budget: { type: Number },
    deadline: { type: Date },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['open', 'assigned', 'completed', 'cancelled'], default: 'open' },
    acceptedBid: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid', default: null }
  },
  { timestamps: true }
);

export default mongoose.model('ServiceRequest', serviceRequestSchema);