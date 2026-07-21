'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { MOCK_PRODUCTS } from '@/data/mockData';

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${resolvedParams.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data._id) {
            setProduct({ ...data, id: data._id });
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error('Failed to fetch from DB, falling back to mock data', error);
      }

      const mockMatch = MOCK_PRODUCTS.find((p) => p.id === resolvedParams.id) || MOCK_PRODUCTS[0];
      setProduct(mockMatch);
      setLoading(false);
    }

    fetchProduct();
  }, [resolvedParams.id]);

  useEffect(() => {
    if (product) {
      const savedWishlist: any[] = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const exists = savedWishlist.some((item) =>
        typeof item === 'string' ? item === product.id : item.id === product.id
      );
      setIsWishlisted(exists);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;

    const savedCart: any[] = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = savedCart.findIndex((item) => item.id === product.id);

    let updatedCart: any[];
    if (existingIndex > -1) {
      updatedCart = [...savedCart];
      updatedCart[existingIndex].quantity = (updatedCart[existingIndex].quantity || 1) + selectedQuantity;
    } else {
      updatedCart = [
        ...savedCart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: selectedQuantity,
        },
      ];
    }

    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('storage'));

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  const handleToggleWishlist = () => {
    if (!product) return;

    const savedWishlist: any[] = JSON.parse(localStorage.getItem('wishlist') || '[]');
    let updatedWishlist: any[];

    if (isWishlisted) {
      updatedWishlist = savedWishlist.filter((item) =>
        typeof item === 'string' ? item !== product.id : item.id !== product.id
      );
    } else {
      const itemToAdd = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        rating: product.rating,
      };
      updatedWishlist = [...savedWishlist, itemToAdd];
    }

    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    window.dispatchEvent(new Event('storage'));
    setIsWishlisted(!isWishlisted);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <div className="text-gray-500 text-lg">Loading product details...</div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-8 flex items-center space-x-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-indigo-600">Products</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="aspect-square w-full overflow-hidden rounded-2xl bg-gray-100 border border-gray-200">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
              {product.category}
            </span>
            <h1 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">{product.name}</h1>
            
            <div className="mt-3 flex items-center space-x-2">
              <div className="flex text-amber-400">
                {'★'.repeat(Math.floor(product.rating || 5))}
              </div>
              <span className="text-sm font-semibold text-gray-700">{product.rating || 5}</span>
              <span className="text-sm text-gray-400">({product.reviewsCount || 0} customer reviews)</span>
            </div>

            <div className="mt-6 flex items-baseline space-x-3">
              <span className="text-3xl font-bold text-gray-900">${product.price}</span>
              {product.originalPrice && (
                <span className="text-lg text-gray-400 line-through">${product.originalPrice}</span>
              )}
            </div>

            <p className="mt-4 text-gray-600 leading-relaxed">{product.description}</p>

            <div className="mt-6 flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center rounded-lg border border-gray-300">
                <button
                  type="button"
                  onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-4 py-1 font-semibold text-gray-800">{selectedQuantity}</span>
                <button
                  type="button"
                  onClick={() => setSelectedQuantity(selectedQuantity + 1)}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleAddToCart}
              disabled={isAdded}
              className={`flex-1 rounded-xl px-6 py-3.5 font-semibold text-white shadow-md transition-all duration-200 ${
                isAdded
                  ? 'bg-emerald-600 hover:bg-emerald-600 cursor-default scale-95'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isAdded ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Added to Cart!
                </span>
              ) : (
                'Add to Cart'
              )}
            </button>

            <button
              onClick={handleToggleWishlist}
              className={`rounded-xl border px-6 py-3.5 font-semibold transition-all duration-200 active:scale-95 ${
                isWishlisted
                  ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {isWishlisted ? 'Saved to Wishlist' : 'Wishlist'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-16 border-t border-gray-200 pt-8">
        <div className="flex space-x-8 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab('description')}
            className={`pb-4 text-sm font-semibold ${
              activeTab === 'description'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Detailed Specifications
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 text-sm font-semibold ${
              activeTab === 'reviews'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Reviews ({product.reviewsCount || 0})
          </button>
        </div>

        <div className="py-6 text-gray-600">
          {activeTab === 'description' ? (
            <p>
              Engineered with premium materials designed for daily use. Includes standard 1-year limited warranty, high-grade finish, and tested compatibility across popular accessories.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-4 border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800">Sarah M.</span>
                </div>
                <p className="mt-2 text-sm">Exceeded my expectations! Build quality is top-notch and arrived fast.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}