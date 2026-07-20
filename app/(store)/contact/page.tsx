'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Get in Touch</h1>
        <p className="mt-2 text-gray-500">Have questions regarding an order or product? Drop us a line.</p>
      </div>

      <div className="mt-12 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        {submitted ? (
          <div className="py-12 text-center text-indigo-600 font-semibold">
            Thank you! Your message has been submitted.
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input required type="text" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input required type="text" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input required type="email" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Message</label>
              <textarea required rows={4} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>

            <button type="submit" className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white shadow hover:bg-indigo-700">
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
}