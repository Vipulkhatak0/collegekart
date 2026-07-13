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



const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: allowedOrigins } });

app.set('io', io);

const allowedOrigins = [
  'https://collegekart.shop',
  'https://www.collegekart.shop',
  'http://localhost:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like curl, Postman, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => res.json({ status: 'CollegeKart API is running' }));

// Real-time chat: each user joins a room keyed by their own userId
io.on('connection', (socket) => {
  socket.on('join', (userId) => socket.join(userId));
  socket.on('sendMessage', (message) => {
    io.to(message.receiverId).emit('newMessage', message);
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
