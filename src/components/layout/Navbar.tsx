'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-2xl font-bold tracking-tight text-indigo-600">
          Online<span className="text-gray-900">Store</span>
        </Link>

        <nav className="hidden space-x-8 md:flex font-medium text-sm text-gray-600">
          <Link href="/" className="hover:text-indigo-600">Home</Link>
          <Link href="/products" className="hover:text-indigo-600">Shop</Link>
          <Link href="/categories" className="hover:text-indigo-600">Categories</Link>
          <Link href="/contact" className="hover:text-indigo-600">Contact</Link>
        </nav>

        <div className="hidden items-center space-x-5 md:flex">
          <Link href="/wishlist" className="text-gray-600 hover:text-indigo-600 text-sm">Wishlist (0)</Link>
          <Link href="/cart" className="relative rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Cart <span className="ml-1 rounded-full bg-indigo-800 px-2 py-0.5 text-xs">2</span>
          </Link>
          <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-indigo-600">Log in</Link>
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-gray-600">
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
        <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden space-y-3">
          <Link href="/" className="block text-gray-700 hover:text-indigo-600">Home</Link>
          <Link href="/products" className="block text-gray-700 hover:text-indigo-600">Shop</Link>
          <Link href="/categories" className="block text-gray-700 hover:text-indigo-600">Categories</Link>
          <Link href="/cart" className="block text-gray-700 hover:text-indigo-600">Cart (2)</Link>
          <Link href="/wishlist" className="block text-gray-700 hover:text-indigo-600">Wishlist</Link>
          <div className="pt-2 border-t">
            <Link href="/login" className="block text-center rounded-lg bg-indigo-600 py-2 text-white font-medium">Log in</Link>
          </div>
        </div>
      )}
    </header>
  );
}