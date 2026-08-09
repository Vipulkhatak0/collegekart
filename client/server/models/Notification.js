import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['new_product', 'message', 'offer', 'new_bid', 'bid_accepted', 'system'], default: 'system' },
    text: { type: String, required: true },
    link: { type: String },
    meta: { type: mongoose.Schema.Types.Mixed },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);