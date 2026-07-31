'use client';

import { useState, useEffect } from 'react';

export default function SubscribePage() {
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const discountPercent = process.env.NEXT_PUBLIC_SUBSCRIPTION_DISCOUNT_PERCENT || '15';

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch('/api/subscription/status');
        const data = await res.json();
        setIsSubscribed(!!data.isSubscribed);
        setStatus(data.status);
        setCurrentPeriodEnd(data.currentPeriodEnd);
      } catch (err) {
        console.error('Failed to fetch subscription status', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, []);

  const handleSubscribe = async () => {
    setError(null);
    setSubscribing(true);
    try {
      const res = await fetch('/api/subscribe', { method: 'POST' });
      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to start subscription checkout');
      }

      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setSubscribing(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
          Membership
        </span>
        <h1 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Premium Membership
        </h1>
        <p className="mt-3 text-gray-500">
          Subscribe for {discountPercent}% off every order, automatically applied at checkout.
        </p>
      </div>

      <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        {loading ? (
          <div className="text-center text-gray-500">Loading your membership status...</div>
        ) : isSubscribed ? (
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-7 w-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900">You're a Premium Member!</h2>
            <p className="mt-2 text-gray-500">
              Your {discountPercent}% member discount is automatically applied at checkout.
            </p>
            {currentPeriodEnd && (
              <p className="mt-2 text-sm text-gray-400">
                Renews on {new Date(currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
          </div>
        ) : (
          <>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-center gap-3">
                <span className="text-indigo-600">✓</span>
                {discountPercent}% off every product, every order
              </li>
              <li className="flex items-center gap-3">
                <span className="text-indigo-600">✓</span>
                Discount applied automatically — no codes needed
              </li>
              <li className="flex items-center gap-3">
                <span className="text-indigo-600">✓</span>
                Cancel anytime
              </li>
            </ul>

            {error && (
              <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              onClick={handleSubscribe}
              disabled={subscribing}
              className="mt-8 w-full rounded-lg bg-indigo-600 py-3.5 font-semibold text-white shadow hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {subscribing ? 'Redirecting to checkout...' : 'Subscribe Now'}
            </button>

            {status && status !== 'active' && (
              <p className="mt-4 text-center text-sm text-gray-400">
                Previous subscription status: {status}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
