'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string, isHashLink: boolean = false) => {
    if (path === '/') {
      // Home is active only when pathname is exactly '/' and it's not a hash link
      return pathname === '/' && !isHashLink;
    }
    if (isHashLink) {
      // Hash links like /#about should not be marked as active based on pathname alone
      // They would need hash detection which is complex, so we'll keep them inactive
      return false;
    }
    return pathname?.startsWith(path);
  };

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/#about', label: 'About' },
    { href: '/rickshaw', label: 'Rickshaw Portal' },
    { href: '/admin', label: 'Admin Dashboard' },
  ];

  return (
    <header className="fixed top-0 w-full bg-black/80 backdrop-blur-md border-b border-white/5 z-50">
      <nav className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        {/* Logo - Rounded rectangular outline */}
        <Link 
          href="/" 
          className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-1.5 sm:py-2 border border-white/20 rounded-full hover:border-green-400/50 transition-colors"
        >
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center">
            <span className="text-xs sm:text-sm font-bold text-black">A</span>
          </div>
          <span className="text-base sm:text-lg font-bold text-green-400">AERAS</span>
        </Link>

        {/* Hamburger Menu Button - Mobile */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden px-3 py-2 border border-white/20 rounded-full hover:border-green-400/50 transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Desktop Navigation - Rounded rectangular items */}
        <div className="hidden lg:flex items-center gap-2">
          {navItems.map((item) => {
            const isAbout = item.href === '/#about';
            const active = isActive(isAbout ? '/' : item.href, isAbout);
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
                  active
                    ? 'bg-green-500/20 text-green-400 border border-green-400/30'
                    : 'border border-white/20 hover:border-green-400/50 hover:text-green-400'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-white/10 bg-black/95 backdrop-blur-md"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const isAbout = item.href === '/#about';
                const active = isActive(isAbout ? '/' : item.href, isAbout);
                return (
                  <Link 
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2 rounded-full font-semibold text-sm text-center transition-colors ${
                      active
                        ? 'bg-green-500/20 text-green-400 border border-green-400/30'
                        : 'border border-white/20 hover:border-green-400/50 hover:text-green-400'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

