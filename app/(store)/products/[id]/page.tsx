'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MOCK_PRODUCTS } from '@/data/mockData';

export default async function ProductDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) { 
  const resolvedParams = await params;
  const product = MOCK_PRODUCTS.find((p) => p.id === resolvedParams.id) || MOCK_PRODUCTS[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb Navigation */}
      <nav className="mb-8 flex items-center space-x-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-indigo-600">Products</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Gallery Preview */}
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
            
            {/* Rating */}
            <div className="mt-3 flex items-center space-x-2">
              <div className="flex text-amber-400">
                {'★'.repeat(Math.floor(product.rating))}
              </div>
              <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
              <span className="text-sm text-gray-400">({product.reviewsCount} customer reviews)</span>
            </div>

            {/* Price */}
            <div className="mt-6 flex items-baseline space-x-3">
              <span className="text-3xl font-bold text-gray-900">${product.price}</span>
              {product.originalPrice && (
                <span className="text-lg text-gray-400 line-through">${product.originalPrice}</span>
              )}
            </div>

            <p className="mt-4 text-gray-600 leading-relaxed">{product.description}</p>

            {/* Quantity Selector */}
            <div className="mt-6 flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center rounded-lg border border-gray-300">
                <button
                  onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-4 py-1 font-semibold text-gray-800">{selectedQuantity}</span>
                <button
                  onClick={() => setSelectedQuantity(selectedQuantity + 1)}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button className="flex-1 rounded-xl bg-indigo-600 px-6 py-3.5 font-semibold text-white shadow-md transition hover:bg-indigo-700">
              Add to Cart
            </button>
            <button className="rounded-xl border border-gray-300 px-6 py-3.5 font-semibold text-gray-700 hover:bg-gray-50">
              ♥ Wishlist
            </button>
          </div>
        </div>
      </div>

      <div className="mt-16 border-t border-gray-200 pt-8">
        <div className="flex space-x-8 border-b border-gray-200">
          <button
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
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 text-sm font-semibold ${
              activeTab === 'reviews'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Reviews ({product.reviewsCount})
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
                  <span className="text-xs text-gray-400">Verified Buyer</span>
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