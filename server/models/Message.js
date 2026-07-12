import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    isOffer: { type: Boolean, default: false },
    offerAmount: { type: Number },
    readAt: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model('Message', messageSchema);
