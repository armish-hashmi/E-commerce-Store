'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlistItems(savedWishlist);
    setLoading(false);

    const handleStorageChange = () => {
      const updated = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlistItems(updated);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-gray-500">
        Loading saved items...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Your Saved Wishlist</h1>
        <p className="mt-1 text-sm text-gray-500">Items saved for quick checkout later.</p>
      </div>

      {wishlistItems.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {wishlistItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-gray-500">Your wishlist is currently empty.</p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Explore Products
          </Link>
        </div>
      )}
    </div>
  );
}