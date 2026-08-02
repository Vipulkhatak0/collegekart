import "dotenv/config";
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import userRoutes from './routes/userRoutes.js';

import serviceRequestRoutes from './routes/serviceRequestRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import gigRoutes from './routes/gigRoutes.js';
import premiumRoutes from './routes/premiumRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

const allowedOrigins = [
  'https://collegekart.shop',
  'https://www.collegekart.shop',
  'http://localhost:5173'
];

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: allowedOrigins } });

app.set('io', io);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json());

app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);

app.use('/api/notes', noteRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/premium', premiumRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => res.json({ status: 'CollegeKart API is running' }));

io.on('connection', (socket) => {
  // Join user's personal room for targeted notifications & messages
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(String(userId));
    }
  });

  socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    server.listen(PORT, () => console.log(`CollegeKart server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err.message));