'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify([]));
    window.dispatchEvent(new Event('storage'));

    async function fetchOrder() {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/checkout/session?session_id=${sessionId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to load order details');
        }

        setOrder(data);
      } catch (err: any) {
        setError(err.message || 'Something went wrong loading your order.');
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [sessionId]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
        <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="mt-6 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        Thank you for your order!
      </h1>
      <p className="mt-2 text-gray-500">
        A confirmation has been sent to your email. We'll notify you once your order ships.
      </p>

      {loading ? (
        <div className="mt-10 text-sm text-gray-500">Loading order details...</div>
      ) : error ? (
        <div className="mt-10 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Your payment was successful, but we couldn't load the order summary here: {error}
        </div>
      ) : order ? (
        <div className="mt-10 rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>

          <ul className="mt-4 divide-y divide-gray-200">
            {order.items.map((item: any, idx: number) => (
              <li key={idx} className="flex justify-between py-3 text-sm">
                <span className="text-gray-700">
                  {item.name} <span className="text-gray-400">x{item.quantity}</span>
                </span>
                <span className="font-semibold text-gray-900">${item.amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex justify-between border-t border-gray-200 pt-4 text-base font-bold text-gray-900">
            <span>Total</span>
            <span>${order.amountTotal.toFixed(2)}</span>
          </div>

          {order.customerEmail && (
            <p className="mt-4 text-xs text-gray-500">Receipt sent to {order.customerEmail}</p>
          )}
        </div>
      ) : null}

      <Link
        href="/products"
        className="mt-10 inline-block rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white shadow hover:bg-indigo-700 transition"
      >
        Continue Shopping
      </Link>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-4 py-24 text-center text-gray-500">Loading...</div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}