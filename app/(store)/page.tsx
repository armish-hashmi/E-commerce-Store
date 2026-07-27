'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/data/mockData';


export default function HomePage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>(MOCK_PRODUCTS);
  const [categories, setCategories] = useState<any[]>(MOCK_CATEGORIES);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/admin/products');
        if (res.ok) {
          const dbProducts = await res.json();
          if (Array.isArray(dbProducts) && dbProducts.length > 0) {
            const mapped = dbProducts.map((p: any) => ({ ...p, id: p._id }));
            setProducts(mapped);
            return;
          }
        }
        setProducts(MOCK_PRODUCTS);
      } catch (error) {
        console.error('Failed to fetch products from DB, falling back to mock data', error);
        setProducts(MOCK_PRODUCTS);
      }
    }

    async function fetchCategories() {
      try {
        const res = await fetch('/api/admin/categories');
        if (res.ok) {
          const data = await res.json();
          const dbCategories = data.categories || [];
          if (dbCategories.length > 0) {
            const mapped = dbCategories.map((c: any) => ({
              id: c._id,
              name: c.name,
              image: c.image ,
              itemCount: c.itemCount,
            }));
            setCategories(mapped);
            return;
          }
        }
        setCategories(MOCK_CATEGORIES);
      } catch (error) {
        console.error('Failed to fetch categories from DB, falling back to mock data', error);
        setCategories(MOCK_CATEGORIES);
      }
    }

    fetchProducts();
    fetchCategories();
  }, []);

  const featured = products;

  const triggerToast = (itemTitle: string) => {
    setToastMessage(`"${itemTitle}" added to cart!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleAddToCart = (product: any) => {
    const savedCart: any[] = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = savedCart.findIndex((item) => item.id === product.id);

    let updatedCart: any[];
    if (existingIndex > -1) {
      updatedCart = [...savedCart];
      updatedCart[existingIndex].quantity = (updatedCart[existingIndex].quantity || 1) + 1;
    } else {
      updatedCart = [
        ...savedCart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          quantity: 1,
        },
      ];
    }

    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('storage'));

    triggerToast(product.name);
  };

  return (
    <div className="relative space-y-16 pb-16">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-white shadow-xl transition-all">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <section className="relative bg-indigo-900 py-24 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 md:text-left lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
              Elevate Your Everyday Style.
            </h1>
            <p className="mt-4 text-lg text-indigo-200">
              Discover curated premium products built for durability, modern aesthetics, and ultimate everyday comfort.
            </p>
            <div className="mt-8 flex justify-center space-x-4 md:justify-start">
              <Link
                href="/products"
                className="rounded-lg bg-white px-6 py-3 font-semibold text-indigo-900 shadow hover:bg-gray-100 transition"
              >
                Shop Collection
              </Link>
              <Link
                href="/categories"
                className="rounded-lg border border-indigo-400 px-6 py-3 font-semibold text-white hover:bg-indigo-800 transition"
              >
                Browse Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Featured Categories</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group relative h-48 overflow-hidden rounded-xl bg-gray-900 shadow-md transition hover:shadow-xl"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="h-full w-full object-cover opacity-60 transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                <h3 className="text-xl font-bold text-white">{cat.name}</h3>
                <p className="text-sm text-gray-300">
                  {cat.itemCount != null ? `${cat.itemCount} Items` : 'Explore Collection'}
                </p>
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
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={() => handleAddToCart(product)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}