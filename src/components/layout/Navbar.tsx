'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateCounts = () => {
      const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlistCount(savedWishlist.length);

      const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(savedCart.length);
    };

    updateCounts();

    window.addEventListener('storage', updateCounts);
    return () => window.removeEventListener('storage', updateCounts);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return isActive
      ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
      : 'text-gray-600 hover:text-indigo-600';
  };

  const getMobileLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `block py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'text-indigo-600 font-semibold bg-indigo-50/50 px-3 rounded-lg'
        : 'text-gray-700 hover:text-indigo-600 px-3'
    }`;
  };

  return (
    <header ref={navRef} className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          onClick={() => setIsOpen(false)}
          className="text-2xl font-bold tracking-tight text-indigo-600"
        >
          Online<span className="text-gray-900">Store</span>
        </Link>

        <nav className="hidden space-x-8 md:flex font-medium text-sm">
          <Link href="/" className={getLinkClass('/')}>
            Home
          </Link>
          <Link href="/products" className={getLinkClass('/products')}>
            Shop
          </Link>
          <Link href="/categories" className={getLinkClass('/categories')}>
            Categories
          </Link>
          <Link href="/contact" className={getLinkClass('/contact')}>
            Contact
          </Link>
        </nav>

        <div className="hidden items-center space-x-5 md:flex">
          <Link
            href="/wishlist"
            className={`text-sm transition-colors ${
              pathname === '/wishlist'
                ? 'font-semibold text-indigo-600'
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            Wishlist ({wishlistCount})
          </Link>

          <Link
            href="/cart"
            className={`text-sm transition-colors flex items-center ${
              pathname === '/cart'
                ? 'font-semibold text-indigo-600'
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            Cart
            <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
              {cartCount}
            </span>
          </Link>
          <Link
            href="/login"
            className={`text-sm font-semibold transition-colors ${
              pathname === '/login'
                ? 'text-indigo-600'
                : 'text-gray-700 hover:text-indigo-600'
            }`}
          >
            Log in
          </Link>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Navigation Menu"
          className="md:hidden text-gray-600 focus:outline-none"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden space-y-2 shadow-lg">
          <Link href="/" onClick={() => setIsOpen(false)} className={getMobileLinkClass('/')}>
            Home
          </Link>
          <Link href="/products" onClick={() => setIsOpen(false)} className={getMobileLinkClass('/products')}>
            Shop
          </Link>
          <Link href="/categories" onClick={() => setIsOpen(false)} className={getMobileLinkClass('/categories')}>
            Categories
          </Link>
          <Link href="/contact" onClick={() => setIsOpen(false)} className={getMobileLinkClass('/contact')}>
            Contact
          </Link>
          <Link href="/cart" onClick={() => setIsOpen(false)} className={getMobileLinkClass('/cart')}>
            Cart ({cartCount})
          </Link>
          <Link href="/wishlist" onClick={() => setIsOpen(false)} className={getMobileLinkClass('/wishlist')}>
            Wishlist ({wishlistCount})
          </Link>
          <div className="pt-3 border-t border-gray-100">
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="block text-center rounded-lg bg-indigo-600 py-2.5 text-white font-medium hover:bg-indigo-700 transition"
            >
              Log in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}