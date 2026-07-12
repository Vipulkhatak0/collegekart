import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Product from '../models/Product.js';

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB Connected');

  const existingAdmin = await User.findOne({ email: 'admin@collegekart.com' });
  let admin = existingAdmin;
  if (!admin) {
    const hashed = await bcrypt.hash('Admin@12345', 10);
    admin = await User.create({
      name: 'CollegeKart Admin', email: 'admin@collegekart.com', password: hashed,
      isVerified: true, role: 'admin', phone: '9999999999', hostel: 'Admin Block'
    });
    console.log('Admin created: admin@collegekart.com / Admin@12345');
  }

  const existingDemo = await User.findOne({ email: 'demo@collegekart.com' });
  let demo = existingDemo;
  if (!demo) {
    const hashed = await bcrypt.hash('Demo@12345', 10);
    demo = await User.create({
      name: 'Ananya Rao', email: 'demo@collegekart.com', password: hashed,
      isVerified: true, phone: '9876543210', hostel: 'Block C'
    });
    console.log('Demo seller created: demo@collegekart.com / Demo@12345');
  }

  // Sample coordinates spread around a single campus (~1-3km apart) so "Near Me" has something to show.
  const sampleProducts = [
    {
      title: 'TI-84 Plus Graphing Calculator', description: 'Gently used, all accessories included.',
      price: 1800, originalPrice: 3200, category: 'calculators', condition: 'Like New',
      phone: '9876543210', location: { address: 'Block C Hostel, Main Campus', lat: 28.6139, lng: 77.209 }
    },
    {
      title: 'Engineering Mechanics Notes (Sem 2)', description: 'Complete handwritten notes, clean copy.',
      price: 250, originalPrice: 500, category: 'notes', condition: 'Good',
      phone: '9876543210', location: { address: 'Block A Hostel, Main Campus', lat: 28.62, lng: 77.215 }
    },
    {
      title: 'Dell Inspiron 15 (i5, 8GB)', description: 'Great condition, light use.',
      price: 28000, originalPrice: 45000, category: 'laptops', condition: 'Good',
      phone: '9876543210', location: { address: 'Block D Hostel, Main Campus', lat: 28.618, lng: 77.212 }
    }
  ];

  for (const p of sampleProducts) {
    const exists = await Product.findOne({ title: p.title });
    if (!exists) {
      await Product.create({ ...p, images: ['https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600'], seller: demo._id });
    }
  }
  console.log(`Seeded ${sampleProducts.length} sample products (skipping existing).`);

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => { console.error(err); process.exit(1); });
