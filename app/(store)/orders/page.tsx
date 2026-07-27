'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface OrderItem {
  name: string;
  quantity: number;
  amount: number;
}

interface Order {
  _id: string;
  amountTotal: number;
  currency: string;
  status: 'paid' | 'accepted' | 'rejected' | 'refunded';
  items: OrderItem[];
  createdAt: string;
}

const statusStyles: Record<string, string> = {
  paid: 'bg-amber-50 text-amber-700 border border-amber-200',
  accepted: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
  refunded: 'bg-gray-100 text-gray-600 border border-gray-200',
};

const statusLabels: Record<string, string> = {
  paid: 'Processing',
  accepted: 'Accepted',
  rejected: 'Rejected',
  refunded: 'Refunded',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();

        if (res.status === 401) {
          setError('unauthorized');
          return;
        }

        if (!res.ok) {
          throw new Error(data.error || 'Failed to load orders');
        }

        setOrders(data);
      } catch (err: any) {
        setError(err.message || 'Something went wrong loading your orders.');
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">My Orders</h1>

      {loading ? (
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-500 shadow-sm">
          Loading your orders...
        </div>
      ) : error === 'unauthorized' ? (
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-8 sm:p-12 text-center shadow-sm">
          <p className="text-base sm:text-lg text-gray-500">Please log in to view your orders.</p>
          <Link
            href="/login"
            className="mt-4 inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
          >
            Log In
          </Link>
        </div>
      ) : error ? (
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-8 sm:p-12 text-center shadow-sm">
          <p className="text-base sm:text-lg text-gray-500">You haven't placed any orders yet.</p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="text-xs text-gray-400">
                    Placed on {new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="mt-0.5 font-semibold text-gray-900">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <span
                  className={`self-start sm:self-auto inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[order.status]}`}
                >
                  {statusLabels[order.status]}
                </span>
              </div>

              <ul className="mt-4 divide-y divide-gray-100 border-t border-gray-100">
                {order.items.map((item, idx) => (
                  <li key={idx} className="flex justify-between py-2.5 text-sm">
                    <span className="text-gray-700">
                      {item.name} <span className="text-gray-400">x{item.quantity}</span>
                    </span>
                    <span className="font-medium text-gray-900">${item.amount.toFixed(2)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex justify-between border-t border-gray-100 pt-4 text-sm font-bold text-gray-900">
                <span>Total</span>
                <span>${order.amountTotal.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
