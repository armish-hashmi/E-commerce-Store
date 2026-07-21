'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('Cart updated!');

  useEffect(() => {
    const loadCart = () => {
      const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(savedCart);
    };

    loadCart();

    const handleStorageChange = () => {
      loadCart();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const triggerBanner = (message: string) => {
    setBannerMessage(message);
    setShowBanner(true);
    setTimeout(() => {
      setShowBanner(false);
    }, 1000);
  };

  const updateCart = (newCart: any[]) => {
    setCartItems(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('storage'));
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    const updated = cartItems
      .map((item) => {
        if (item.id === id) {
          const newQty = (item.quantity || 1) + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean);

    updateCart(updated);
  };

  const handleRemoveItem = (id: string) => {
    const updated = cartItems.filter((item) => item.id !== id);
    updateCart(updated);
    triggerBanner('Item removed from cart');
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
    0
  );
  const shipping = cartItems.length > 0 ? 15.0 : 0.0;
  const total = subtotal + shipping;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {showBanner && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-white shadow-lg transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">{bannerMessage}</span>
        </div>
      )}

      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <p className="text-lg text-gray-500">Your cart is currently empty.</p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12">
          <section className="lg:col-span-7 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <ul className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <li key={item.id} className="flex py-4 space-x-4">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'}
                    alt={item.name}
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.category || 'Product'}</p>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center rounded-lg border border-gray-300">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          className="px-2.5 py-0.5 text-gray-600 hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="px-3 py-0.5 font-semibold text-gray-800">
                          {item.quantity || 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          className="px-2.5 py-0.5 text-gray-600 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:underline text-xs font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">
                    ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8 rounded-xl bg-gray-100 p-6 lg:col-span-5 lg:mt-0">
            <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>

            <div className="mt-4 space-y-2 border-b border-gray-200 pb-4 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-gray-900">${shipping.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 flex justify-between font-bold text-gray-900 text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button className="mt-6 w-full rounded-lg bg-indigo-600 py-3 text-white font-semibold shadow hover:bg-indigo-700 transition">
              Proceed to Checkout
            </button>
          </section>
        </div>
      )}
    </div>
  );
}