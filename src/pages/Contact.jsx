import toast from 'react-hot-toast';
import { HiOutlineEnvelope, HiOutlinePhone, HiOutlineMapPin } from 'react-icons/hi2';

export default function Contact() {
  const handleSubmit = (e) => { e.preventDefault(); toast.success('Message sent! We\'ll get back to you soon.'); e.target.reset(); };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-14 grid gap-10 md:grid-cols-2">
      <div>
        <span className="section-eyebrow">Get in touch</span>
        <h1 className="mt-2 font-display text-2xl font-bold">Contact Us</h1>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          CollegeKart is built and maintained by a single student developer, so every message actually gets read personally. Found a bug, have a feature idea, spotted a suspicious listing, or just want to say hi — reach out below and I'll get back to you, usually within a day or two.
        </p>

        <div className="mt-6 space-y-4 text-sm">
          <p className="flex items-center gap-2"><HiOutlineEnvelope className="h-4 w-4 text-primary-500" /> collegekart394@gmail.com</p>
          <p className="flex items-center gap-2"><HiOutlinePhone className="h-4 w-4 text-primary-500" /> +91 81950 52708</p>
          <p className="flex items-center gap-2"><HiOutlineMapPin className="h-4 w-4 text-primary-500" /> Ludhiana, Punjab, India</p>
        </div>

        <p className="mt-6 text-xs text-slate-400">
          For account or listing issues, you can also use the "Report" button directly on any listing for the fastest response.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card space-y-4 p-6">
        <input placeholder="Your Name" className="input-field" required />
        <input type="email" placeholder="Your Email" className="input-field" required />
        <textarea placeholder="Your Message" rows={4} className="input-field" required />
        <button className="btn-primary w-full">Send Message</button>
      </form>
    </div>
  );
}