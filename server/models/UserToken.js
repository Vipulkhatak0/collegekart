import mongoose from 'mongoose';

const userTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fcmToken: { type: String, required: true }
}, { timestamps: true });

userTokenSchema.index({ userId: 1 }, { unique: true });

export default mongoose.model('UserToken', userTokenSchema);