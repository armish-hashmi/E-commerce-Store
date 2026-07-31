'use client';

import Link from 'next/link';

export default function SubscribeSuccessPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6 lg:px-8">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
        <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        Welcome to Premium!
      </h1>
      <p className="mt-2 text-gray-500">
        Your subscription is active. Your member discount will now apply automatically at checkout.
      </p>
      <Link
        href="/products"
        className="mt-8 inline-block rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white shadow hover:bg-indigo-700 transition"
      >
        Start Shopping
      </Link>
    </div>
  );
}
