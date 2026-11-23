import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    type: {
      type: String,
      required: true,
      enum: ['notes', 'pyq', 'study_material'],
      default: 'notes'
    },
    college: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    course: { type: String, required: true, trim: true },
    semester: {
      type: String,
      required: true,
      enum: ['1', '2', '3', '4', '5', '6', '7', '8']
    },
    fileUrl: { type: String, required: true },
    fileType: { type: String, required: true },
    price: { type: Number, default: 0 },
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    downloadCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

noteSchema.index({ title: 'text', subject: 'text', course: 'text', college: 'text' });

export default mongoose.model('Note', noteSchema);