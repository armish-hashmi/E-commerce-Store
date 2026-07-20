import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/data/mockData';

export default function HomePage() {
  const featured = MOCK_PRODUCTS.filter((p) => p.isFeatured);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Banner */}
      <section className="relative bg-indigo-900 py-24 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center md:text-left">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
              Elevate Your Everyday Style.
            </h1>
            <p className="mt-4 text-lg text-indigo-200">
              Discover curated premium products built for durability, modern aesthetics, and ultimate everyday comfort.
            </p>
            <div className="mt-8 flex justify-center md:justify-start space-x-4">
              <Link href="/products" className="rounded-lg bg-white px-6 py-3 font-semibold text-indigo-900 shadow hover:bg-gray-100">
                Shop Collection
              </Link>
              <Link href="/categories" className="rounded-lg border border-indigo-400 px-6 py-3 font-semibold text-white hover:bg-indigo-800">
                Browse Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Featured Categories</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {MOCK_CATEGORIES.map((cat) => (
            <Link key={cat.id} href={`/products?category=${cat.name}`} className="group relative overflow-hidden rounded-xl h-48 bg-gray-900">
              <img src={cat.image} alt={cat.name} className="h-full w-full object-cover opacity-60 group-hover:scale-105 transition" />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3 className="text-xl font-bold text-white">{cat.name}</h3>
                <p className="text-sm text-gray-300">{cat.itemCount} Items</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Trending Now</h2>
          <Link href="/products" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
            View all &rarr;
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}