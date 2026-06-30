// components/Footer.tsx
import React from 'react';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8 mt-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <BookOpen size={16} />
          <span>© {new Date().getFullYear()} ED-Library Platform</span>
        </div>
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-gray-900 dark:text-white dark:hover:text-white">Privacy</Link>
          <Link href="/terms" className="hover:text-gray-900 dark:text-white dark:hover:text-white">Terms</Link>
          <Link href="/help" className="hover:text-gray-900 dark:text-white dark:hover:text-white">Help Center</Link>
          <Link href="/contact" className="hover:text-gray-900 dark:text-white dark:hover:text-white">Contact</Link>
        </div>
      </div>
    </footer>
  );
}