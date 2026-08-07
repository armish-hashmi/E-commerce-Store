'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from '@/lib/useSession';

interface ProductCardProps {
  product: any;
  onAddToCart?: (quantity: number) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, isAdmin } = useSession();

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkWishlist = () => {
      const savedWishlist: any[] = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const exists = savedWishlist.some((item) =>
        typeof item === 'string' ? item === product.id : item.id === product.id
      );
      setIsWishlisted(exists);
    };

    checkWishlist();
    window.addEventListener('storage', checkWishlist);
    return () => window.removeEventListener('storage', checkWishlist);
  }, [product.id]);

  useEffect(() => {
    if (!blockedMessage) return;
    const timer = setTimeout(() => setBlockedMessage(null), 2500);
    return () => clearTimeout(timer);
  }, [blockedMessage]);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    const savedWishlist: any[] = JSON.parse(localStorage.getItem('wishlist') || '[]');
    let updatedWishlist: any[];

    if (isWishlisted) {
      updatedWishlist = savedWishlist.filter((item) =>
        typeof item === 'string' ? item !== product.id : item.id !== product.id
      );
    } else {
      updatedWishlist = [
        ...savedWishlist,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          rating: product.rating,
        },
      ];
    }

    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    window.dispatchEvent(new Event('storage'));
    setIsWishlisted(!isWishlisted);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAdmin) {
      setBlockedMessage('Admin accounts cannot make purchases.');
      return;
    }

    onAddToCart?.(quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  const adjustQuantity = (e: React.MouseEvent, delta: number) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      {blockedMessage && (
        <div className="absolute inset-x-3 top-3 z-20 rounded-lg bg-gray-900 px-3 py-2 text-center text-xs font-medium text-white shadow-lg">
          {blockedMessage}
        </div>
      )}

      <button
        type="button"
        onClick={handleToggleWishlist}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        className="absolute right-6 top-6 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-110"
      >
        <svg
          className={`h-5 w-5 transition-colors ${isWishlisted ? 'text-red-500' : 'text-gray-400'}`}
          fill={isWishlisted ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={isWishlisted ? 0 : 2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>

      <Link href={`/products/${product.id}`} className="group block flex-1">
        <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-105"
          />
        </div>
        <div className="mt-4">
          <span className="text-xs font-medium uppercase tracking-wider text-indigo-600">
            {product.category}
          </span>
          <h3 className="text-base font-semibold text-gray-900 transition group-hover:text-indigo-600">
            {product.name}
          </h3>
          <p className="mt-1 text-sm font-bold text-gray-900">${product.price}</p>
        </div>
      </Link>

      <div className="mt-4 flex items-center gap-2">
        <div className="flex items-center rounded-lg border border-gray-300">
          <button
            type="button"
            onClick={(e) => adjustQuantity(e, -1)}
            disabled={isAdmin}
            className="px-2.5 py-2 text-gray-600 hover:bg-gray-100 text-sm font-medium disabled:opacity-40 disabled:hover:bg-transparent"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="min-w-[1.5rem] text-center text-sm font-semibold text-gray-800">
            {quantity}
          </span>
          <button
            type="button"
            onClick={(e) => adjustQuantity(e, 1)}
            disabled={isAdmin}
            className="px-2.5 py-2 text-gray-600 hover:bg-gray-100 text-sm font-medium disabled:opacity-40 disabled:hover:bg-transparent"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isAdmin}
          className={`flex-1 rounded-lg py-2.5 text-xs font-semibold text-white transition active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${
            isAdded ? 'bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isAdmin ? 'Not Available for Admins' : isAdded ? 'Added!' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}