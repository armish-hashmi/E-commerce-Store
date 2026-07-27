'use client';

import { useState, useEffect } from 'react';

interface OrderItem {
  name: string;
  quantity: number;
  amount: number;
}

interface Order {
  _id: string;
  stripeSessionId: string;
  paymentIntentId?: string;
  customerEmail?: string;
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load orders');
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'accepted' | 'rejected') => {
    setActioningId(id);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update order');
      setOrders((prev) => prev.map((o) => (o._id === id ? data : o)));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActioningId(null);
    }
  };

  const handleRefund = async (id: string) => {
    if (!confirm('Refund this order? This will issue a real refund through Stripe.')) return;

    setActioningId(id);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${id}/refund`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process refund');
      setOrders((prev) => prev.map((o) => (o._id === id ? data : o)));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Orders</h1>
          <p className="text-sm text-gray-500">Review, accept, reject, or refund customer orders.</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Items</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8">Loading orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8">No orders yet.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 align-top">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">
                        {order.customerEmail || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <ul className="space-y-1">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="text-xs text-gray-600">
                            {item.name} <span className="text-gray-400">x{item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      ${order.amountTotal.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                      {order.status === 'paid' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'accepted')}
                            disabled={actioningId === order._id}
                            className="text-emerald-600 hover:underline font-medium disabled:opacity-50"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'rejected')}
                            disabled={actioningId === order._id}
                            className="text-red-500 hover:underline font-medium disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {order.status !== 'refunded' && (
                        <button
                          onClick={() => handleRefund(order._id)}
                          disabled={actioningId === order._id}
                          className="text-gray-600 hover:underline font-medium disabled:opacity-50"
                        >
                          Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
