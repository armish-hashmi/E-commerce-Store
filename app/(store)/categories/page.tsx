import Link from 'next/link';
import { MOCK_CATEGORIES } from '@/data/mockData';

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Browse Categories</h1>
        <p className="mt-2 text-gray-500">Explore items grouped by specialized styles and utility.</p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.name}`}
            className="group relative overflow-hidden rounded-2xl bg-gray-900 shadow-md transition hover:shadow-xl"
          >
            <img
              src={cat.image}
              alt={cat.name}
              className="h-64 w-full object-cover opacity-70 transition duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
              <h2 className="text-2xl font-bold text-white">{cat.name}</h2>
              <p className="mt-1 text-sm text-gray-300">{cat.itemCount} Products Available</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}