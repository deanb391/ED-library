"use client";

import React, { useState } from "react";
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  MapPin, 
  Send, 
  Instagram, 
  Twitter, 
  Linkedin,
  Clock,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      alert("Message sent! We'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col text-gray-900 font-sans">
      
      {/* --- HERO SECTION --- */}
      <section className="bg-white border-b border-gray-100 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            We're here to help
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900">
            Get in touch with us
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Have questions about ED-Library? Whether you're a student or a contributor, 
            our team is ready to assist you with anything you need.
          </p>
        </div>
      </section>

      {/* --- CONTACT METHODS --- */}
      <section className="py-12 -mt-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ContactCard 
              icon={<Phone size={24} />}
              title="Call Us"
              value="+234 810 000 0000"
              desc="Mon - Fri, 9am - 5pm"
              link="tel:+2348100000000"
              actionText="Call now"
            />
            <ContactCard 
              icon={<MessageCircle size={24} />}
              title="WhatsApp"
              value="Chat with us"
              desc="Average response: 15 mins"
              link="https://wa.me/2348100000000"
              actionText="Open WhatsApp"
            />
            <ContactCard 
              icon={<Mail size={24} />}
              title="Email Support"
              value="support@edlibrary.com"
              desc="For detailed inquiries"
              link="mailto:support@edlibrary.com"
              actionText="Send email"
            />
            <ContactCard 
              icon={<MapPin size={24} />}
              title="Our Office"
              value="Lagos, Nigeria"
              desc="Academic Board HQ"
              link="#"
              actionText="View on map"
            />
          </div>
        </div>
      </section>

      {/* --- FORM & SOCIALS --- */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Left: Contact Info & Socials */}
            <div className="space-y-12">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-900">Connect with us</h2>
                <p className="text-gray-500 leading-relaxed max-w-md">
                  Follow us on social media for the latest updates on courses, 
                  new features, and academic resources.
                </p>
              </div>

              <div className="flex gap-4">
                <SocialLink icon={<Instagram size={20} />} href="#" label="Instagram" color="bg-pink-50 text-pink-600 hover:bg-pink-600 hover:text-white" />
                <SocialLink icon={<Twitter size={20} />} href="#" label="Twitter" color="bg-blue-50 text-blue-400 hover:bg-blue-400 hover:text-white" />
                <SocialLink icon={<Linkedin size={20} />} href="#" label="LinkedIn" color="bg-blue-100 text-blue-700 hover:bg-blue-700 hover:text-white" />
              </div>

              <div className="p-8 rounded-3xl bg-blue-600 text-white relative overflow-hidden shadow-2xl shadow-blue-200">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="relative z-10 space-y-4">
                  <Clock className="text-blue-200" size={32} />
                  <h3 className="text-xl font-bold">Support Hours</h3>
                  <div className="space-y-2 opacity-90 text-sm">
                    <div className="flex justify-between">
                      <span>Monday - Friday</span>
                      <span className="font-semibold">9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday</span>
                      <span className="font-semibold">10:00 AM - 2:00 PM</span>
                    </div>
                    <div className="flex justify-between border-t border-white/20 pt-2 mt-2">
                      <span>Sunday</span>
                      <span className="font-semibold italic">Closed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-gray-100">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Your Name</label>
                    <input 
                      required
                      type="text"
                      placeholder="John Doe"
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all duration-300"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                    <input 
                      required
                      type="email"
                      placeholder="john@example.com"
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all duration-300"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Subject</label>
                  <input 
                    required
                    type="text"
                    placeholder="How can we help?"
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all duration-300"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Message</label>
                  <textarea 
                    required
                    rows={5}
                    placeholder="Tell us more about your inquiry..."
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all duration-300 resize-none"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                </div>

                <button 
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submitting ? "Sending..." : (
                    <>
                      Send Message
                      <Send size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className="py-20 bg-gray-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-6 space-y-8">
          <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
          <p className="text-gray-400">
            Maybe the answer you're looking for is already in our documentation.
          </p>
          <Link href="/faq">
            <button className="inline-flex items-center gap-2 text-blue-400 font-bold hover:text-blue-300 transition-colors">
              Visit FAQ Center
              <ChevronRight size={20} />
            </button>
          </Link>
        </div>
      </section>

    </div>
  );
}

function ContactCard({ 
  icon, 
  title, 
  value, 
  desc, 
  link, 
  actionText 
}: { 
  icon: React.ReactNode; 
  title: string; 
  value: string; 
  desc: string; 
  link: string;
  actionText: string;
}) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg shadow-gray-100 border border-gray-100 group hover:border-blue-200 transition-all duration-500">
      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</h3>
      <div className="text-lg font-bold text-gray-900 mb-2 truncate">{value}</div>
      <p className="text-sm text-gray-500 mb-6">{desc}</p>
      <Link href={link} className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:gap-2 transition-all">
        {actionText}
        <ChevronRight size={16} />
      </Link>
    </div>
  );
}

function SocialLink({ icon, href, label, color }: { icon: React.ReactNode; href: string; label: string; color: string }) {
  return (
    <Link 
      href={href} 
      title={label}
      className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 ${color}`}
    >
      {icon}
    </Link>
  );
}
