import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AffiliateProductDetail from './pages/AffiliateProductDetail.jsx';

import Home from './pages/Home.jsx';
import BrowseProducts from './pages/BrowseProducts.jsx';
import Categories from './pages/Categories.jsx';
import StudentEssentials from './pages/StudentEssentials.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import SellProduct from './pages/SellProduct.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Chat from './pages/Chat.jsx';
import Orders from './pages/Orders.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import Notifications from './pages/Notifications.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import HelpCenter from './pages/HelpCenter.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import Notes from './pages/Notes.jsx';
import UploadNote from './pages/UploadNote.jsx';
import NoteDetail from './pages/NoteDetail.jsx';
import ServiceRequests from './pages/ServiceRequests.jsx';
import PostServiceRequest from './pages/PostServiceRequest.jsx';
import ServiceRequestDetail from './pages/ServiceRequestDetail.jsx';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-light dark:bg-surface-dark">
      <Toaster position="top-center" />
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<BrowseProducts />} />
          <Route path="/categories" element={<Categories />} />
         
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/notes" element={<Notes />} />
<Route path="/notes/:id" element={<NoteDetail />} />
<Route path="/services" element={<ServiceRequests />} />
<Route path="/services/:id" element={<ServiceRequestDetail />} />

          {/* Protected Routes (Require Login) */}
          <Route path="/notes/upload" element={<UploadNote />} />
<Route path="/services/post" element={<PostServiceRequest />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/sell" element={<SellProduct />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </div>
  );
}