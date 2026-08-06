'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';

interface OrderItem {
  name: string;
  quantity: number;
  amount: number;
}

interface OrderRecord {
  _id: string;
  amountTotal: number;
  status: string;
  items: OrderItem[];
  createdAt: string;
}

interface UserDetail {
  _id: string;
  name: string;
  email: string;
  role: string;
  isDisabled?: boolean;
  createdAt: string;
}

const statusStyles: Record<string, string> = {
  paid: 'bg-amber-50 text-amber-700 border border-amber-200',
  accepted: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
  refunded: 'bg-gray-100 text-gray-600 border border-gray-200',
};

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [user, setUser] = useState<UserDetail | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load user');
      setUser(data.user);
      setOrders(data.orders);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleToggle = async () => {
    if (!user) return;
    const action = user.isDisabled ? 'enable' : 'disable';
    if (!confirm(`Are you sure you want to ${action} ${user.email}?`)) return;

    setToggling(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDisabled: !user.isDisabled }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${action} user`);
      setUser(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-gray-500">Loading user...</div>;
  }

  if (error && !user) {
    return (
      <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>
    );
  }

  if (!user) return null;

  const totalSpent = orders
    .filter((o) => o.status !== 'refunded' && o.status !== 'rejected')
    .reduce((sum, o) => sum + o.amountTotal, 0);

  return (
    <div>
      <Link href="/admin/users" className="text-sm text-indigo-600 hover:underline">
        &larr; Back to Users
      </Link>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{user.name}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        {user.role !== 'admin' && (
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-50 ${
              user.isDisabled ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {toggling ? 'Updating...' : user.isDisabled ? 'Enable Account' : 'Disable Account'}
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-gray-400">Status</p>
          <span
            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
              user.isDisabled
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {user.isDisabled ? 'Disabled' : 'Active'}
          </span>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-gray-400">Total Orders</p>
          <p className="mt-2 text-xl font-bold text-gray-900">{orders.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-gray-400">Total Spent</p>
          <p className="mt-2 text-xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-gray-900">Order History</h2>
        <div className="mt-4 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {orders.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">No orders placed yet.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {orders.map((order) => (
                <li key={order._id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <ul className="mt-1 text-sm text-gray-700">
                        {order.items.map((item, idx) => (
                          <li key={idx}>
                            {item.name} <span className="text-gray-400">x{item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${order.amountTotal.toFixed(2)}</p>
                      <span
                        className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                          statusStyles[order.status] || statusStyles.paid
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
