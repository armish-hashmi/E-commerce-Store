'use client';

import { useState, useEffect } from 'react';

interface Subscription {
  _id: string;
  userEmail: string;
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  createdAt: string;
}

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  trialing: 'bg-blue-50 text-blue-700 border border-blue-200',
  past_due: 'bg-amber-50 text-amber-700 border border-amber-200',
  canceled: 'bg-gray-100 text-gray-600 border border-gray-200',
  unpaid: 'bg-red-50 text-red-700 border border-red-200',
};

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const res = await fetch('/api/admin/subscriptions');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load subscriptions');
        setSubscriptions(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSubscriptions();
  }, []);

  const activeCount = subscriptions.filter((s) =>
    ['active', 'trialing'].includes(s.status)
  ).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Subscriptions</h1>
        <p className="text-sm text-gray-500">
          {loading ? 'Loading...' : `${activeCount} active subscriber${activeCount !== 1 ? 's' : ''} of ${subscriptions.length} total`}
        </p>
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
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Renews / Ends</th>
                <th className="px-6 py-3">Subscribed Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={4} className="text-center py-8">Loading subscriptions...</td></tr>
              ) : subscriptions.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8">No subscriptions yet.</td></tr>
              ) : (
                subscriptions.map((sub) => (
                  <tr key={sub._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">{sub.userEmail}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[sub.status] || 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                        {sub.status.replace('_', ' ')}
                      </span>
                      {sub.cancelAtPeriodEnd && (
                        <span className="ml-2 text-xs text-amber-600">(cancels at period end)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(sub.createdAt).toLocaleDateString()}
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