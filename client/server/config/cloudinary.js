import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Product Images Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'collegekart/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, crop: 'limit' }]
  }
});

export const upload = multer({ 
  storage, 
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB per image
});

// 3. Notes & Documents Storage
const notesStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'collegekart/notes',
    resource_type: 'auto',
    allowed_formats: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'webp']
  }
});

export const uploadNote = multer({ 
  storage: notesStorage, 
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB for documents
});

// 4. Gig Portfolio Images Storage
const gigStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'collegekart/gigs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, crop: 'limit' }]
  }
});

export const uploadGigImages = multer({ 
  storage: gigStorage, 
  limits: { fileSize: 5 * 1024 * 1024 } 
});

// 5. Default Export
export default cloudinary;