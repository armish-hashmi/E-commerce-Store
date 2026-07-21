'use client';

import Link from 'next/link';

interface ProductCardProps {
  product: any;
  onAddToCart?: () => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
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

      <button
        type="button"
        onClick={onAddToCart}
        className="mt-4 w-full rounded-lg bg-indigo-600 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700 active:scale-95"
      >
        Add to Cart
      </button>
    </div>
  );
}