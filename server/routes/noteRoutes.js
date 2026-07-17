import express from 'express';
import Note from '../models/Note.js';
import { protect } from '../middleware/auth.js';
import { uploadNote } from '../config/cloudinary.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { college, type, subject, course, semester, search } = req.query;
    const filter = {};
    if (college && college !== 'all') filter.college = college;
    if (type && type !== 'all') filter.type = type;
    if (subject) filter.subject = subject;
    if (course) filter.course = course;
    if (semester) filter.semester = semester;
    if (search) filter.$text = { $search: search };

    const notes = await Note.find(filter).populate('uploader', 'name avatar college').sort({ createdAt: -1 });
    res.json({ notes });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notes.', error: err.message });
  }
});

router.get('/colleges/list', async (req, res) => {
  try {
    const colleges = await Note.distinct('college');
    res.json({ colleges: colleges.filter(Boolean).sort() });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch colleges.', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate('uploader', 'name avatar college');
    if (!note) return res.status(404).json({ message: 'Note not found.' });
    res.json({ note });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch note.', error: err.message });
  }
});

router.post('/', protect, uploadNote.single('file'), async (req, res) => {
  try {
    if (!req.user.college) {
      return res.status(400).json({ message: 'Please add your college to your profile before uploading.' });
    }

    const { title, description, type, subject, course, semester, price } = req.body;
    if (!req.file) return res.status(400).json({ message: 'A file is required.' });

    const fileType = req.file.originalname.split('.').pop().toLowerCase();

    const note = await Note.create({
      title, description, type, subject, course, semester,
      college: req.user.college,
      price: price ? Number(price) : 0,
      fileUrl: req.file.path,
      fileType,
      uploader: req.user._id
    });

    res.status(201).json({ note });
  } catch (err) {
    res.status(500).json({ message: 'Failed to upload note.', error: err.message });
  }
});

router.post('/:id/download', protect, async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(req.params.id, { $inc: { downloadCount: 1 } }, { new: true });
    if (!note) return res.status(404).json({ message: 'Note not found.' });
    res.json({ fileUrl: note.fileUrl });
  } catch (err) {
    res.status(500).json({ message: 'Failed to process download.', error: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found.' });
    if (String(note.uploader) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this note.' });
    }
    await note.deleteOne();
    res.json({ message: 'Note removed.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete note.', error: err.message });
  }
});

export default router;