import express from 'express';
import Note from '../models/Note.js';
import { protect } from '../middleware/auth.js';
import { uploadNote } from '../config/cloudinary.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { Readable } from 'node:stream';

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
      fileName: req.file.originalname,
      fileSize: req.file.size,
      uploader: req.user._id
    });

    const admins = await User.find({ role: 'admin' }).select('_id');
    const notifDocs = await Notification.insertMany(
      admins.map((a) => ({
        recipient: a._id,
        type: 'new_product',
        text: `${req.user.name} (${req.user.email}) uploaded to Library: "${title}"`,
        link: `/notes/${note._id}`,
        meta: { posterId: req.user._id, posterName: req.user.name, posterEmail: req.user.email, noteId: note._id, type, college: req.user.college }
      }))
    );

    const io = req.app.get('io');
    notifDocs.forEach((n) => io.to(String(n.recipient)).emit('newNotification', n));
    io.emit('newListing', { productId: note._id, title: note.title, category: 'Library' });

    res.status(201).json({ note });
  } catch (err) {
    res.status(500).json({ message: 'Failed to upload note.', error: err.message });
  }
});

router.post('/:id/download', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found.' });
    if (note.price > 0) return res.status(403).json({ message: 'This resource is not available for free download.' });
    if (!note.fileUrl) return res.status(404).json({ message: 'The file is unavailable.' });

    let fileUrl;
    try {
      fileUrl = new URL(note.fileUrl);
    } catch {
      return res.status(404).json({ message: 'The file URL is invalid.' });
    }
    if (!/^([a-z0-9-]+\.)*cloudinary\.com$/i.test(fileUrl.hostname) || fileUrl.protocol !== 'https:') {
      return res.status(502).json({ message: 'The stored file provider is not supported.' });
    }

    const upstream = await fetch(fileUrl, { redirect: 'error' });
    if (!upstream.ok || !upstream.body) {
      return res.status(502).json({ message: 'The file could not be retrieved. Please try again later.' });
    }

    const originalName = note.fileName || `${note.title}.${note.fileType || 'file'}`;
    const safeName = originalName.replace(/[\\/\r\n"\0]/g, '_').trim() || `collegekart-note.${note.fileType || 'file'}`;
    const fallbackName = safeName.replace(/[^\x20-\x7E]/g, '_').replace(/"/g, "'");
    res.setHeader('Content-Disposition', `attachment; filename="${fallbackName}"; filename*=UTF-8''${encodeURIComponent(safeName)}`);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/octet-stream');
    const contentLength = upstream.headers.get('content-length');
    if (contentLength) res.setHeader('Content-Length', contentLength);

    await Note.updateOne({ _id: note._id }, { $inc: { downloadCount: 1 } });
    Readable.fromWeb(upstream.body).on('error', () => res.destroy()).pipe(res);
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ message: 'Failed to prepare the download. Please try again.' });
    else res.destroy(err);
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
