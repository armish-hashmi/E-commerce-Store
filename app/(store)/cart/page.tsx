'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('Cart updated!');
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

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

  const handleCheckout = async () => {
    setCheckoutError(null);
    setCheckingOut(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to start checkout');
      }

      window.location.href = data.url;
    } catch (err: any) {
      setCheckoutError(err.message || 'Something went wrong. Please try again.');
      setCheckingOut(false);
    }
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
    0
  );
  const shipping = cartItems.length > 0 ? 15.0 : 0.0;
  const total = subtotal + shipping;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-12 lg:px-8">
      {showBanner && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-5 sm:max-w-sm z-50 flex items-center justify-center sm:justify-start gap-2 rounded-lg bg-green-600 px-4 py-3 text-white shadow-xl transition-all">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">{bannerMessage}</span>
        </div>
      )}

      <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        Shopping Cart
      </h1>

      {cartItems.length === 0 ? (
        <div className="mt-6 sm:mt-8 rounded-xl border border-gray-200 bg-white p-8 sm:p-12 text-center shadow-sm">
          <p className="text-base sm:text-lg text-gray-500">Your cart is currently empty.</p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 sm:mt-8 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12">
          <section className="lg:col-span-7 rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
            <ul className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col sm:flex-row py-4 sm:py-6 gap-4 sm:gap-6"
                >
                  <div className="flex items-center gap-4 sm:block">
                    <img
                      src={ item.image }
                      alt={item.name}
                      className="h-20 w-20 sm:h-24 sm:w-24 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="sm:hidden flex-1">
                      <h3 className="font-semibold text-gray-800 text-sm leading-tight">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">{item.category || 'Product'}</p>
                      <p className="text-sm font-bold text-gray-900 mt-1">
                        ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between w-full">
                    <div className="hidden sm:block">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-800 text-base">{item.name}</h3>
                        <span className="font-bold text-gray-900 ml-4">
                          ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{item.category || 'Product'}</p>
                    </div>

                    <div className="flex justify-between items-center mt-3 sm:mt-4 text-sm">
                      <div className="flex items-center rounded-lg border border-gray-300 bg-gray-50">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 transition rounded-l-lg font-medium"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="px-3 py-1.5 font-semibold text-gray-800 min-w-[2rem] text-center">
                          {item.quantity || 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 transition rounded-r-lg font-medium"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 hover:underline text-xs sm:text-sm font-medium transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 lg:mt-0 rounded-xl bg-gray-100 p-5 sm:p-6 lg:col-span-5 lg:sticky lg:top-6">
            <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>

            <div className="mt-4 space-y-3 border-b border-gray-200 pb-4 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-gray-900">${shipping.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 flex justify-between font-bold text-gray-900 text-base sm:text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            {checkoutError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {checkoutError}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="mt-6 w-full rounded-lg bg-indigo-600 py-3 sm:py-3.5 text-white font-semibold text-sm sm:text-base shadow hover:bg-indigo-700 active:scale-[0.99] transition disabled:opacity-50"
            >
              {checkingOut ? 'Redirecting to checkout...' : 'Proceed to Checkout'}
            </button>
          </section>
        </div>
      )}
    </div>
  );
}