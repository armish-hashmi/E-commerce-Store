import Link from 'next/link';
import { Product } from '@/types';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group relative rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover object-center transition group-hover:scale-105"
        />
        {product.originalPrice && (
          <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2.5 py-1 text-xs font-semibold text-white">
            Sale
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-col justify-between">
        <div>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{product.category}</span>
          <Link href={`/products/${product.id}`} className="mt-1 block font-semibold text-gray-800 hover:text-indigo-600 line-clamp-1">
            {product.name}
          </Link>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="text-lg font-bold text-gray-900">${product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
            )}
          </div>
          <button className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}