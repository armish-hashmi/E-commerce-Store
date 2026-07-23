'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ui/ProductCard';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/data/mockData';

const FALLBACK_CATEGORY_NAMES = ['Electronics', 'Accessories', 'Furniture'];

function ProductListingContent() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get('category');

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || 'All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>(MOCK_PRODUCTS);
  const [categoryNames, setCategoryNames] = useState<string[]>(
    MOCK_CATEGORIES.map((c) => c.name)
  );

  useEffect(() => {
    setSelectedCategory(categoryFromUrl || 'All');
  }, [categoryFromUrl]);

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
            setCategoryNames(dbCategories.map((c: any) => c.name));
            return;
          }
        }
        setCategoryNames(FALLBACK_CATEGORY_NAMES);
      } catch (error) {
        console.error('Failed to fetch categories from DB, falling back to mock data', error);
        setCategoryNames(FALLBACK_CATEGORY_NAMES);
      }
    }

    fetchProducts();
    fetchCategories();
  }, []);

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

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-white shadow-xl transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <h1 className="text-3xl font-bold tracking-tight text-gray-900">All Products</h1>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />

        <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0">
          {['All', ...categoryNames].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={() => handleAddToCart(product)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center text-gray-500">No products match your criteria.</div>
      )}
    </div>
  );
}

export default function ProductListingPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-24 text-center text-gray-500">Loading products...</div>
      }
    >
      <ProductListingContent />
    </Suspense>
  );
}

