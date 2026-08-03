'use client';

import { useState, useEffect } from 'react';

interface SubscriptionDoc {
  _id: string;
  userEmail: string;
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  createdAt: string;
}

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  trialing: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  past_due: 'bg-amber-50 text-amber-700 border border-amber-200',
  canceled: 'bg-gray-100 text-gray-600 border border-gray-200',
  unpaid: 'bg-red-50 text-red-700 border border-red-200',
  incomplete: 'bg-gray-100 text-gray-500 border border-gray-200',
};

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/subscriptions');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load subscriptions');
      setSubscriptions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this subscription at the end of the current billing period?')) return;

    setActioningId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/subscriptions/${id}/cancel`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel subscription');
      setSubscriptions((prev) => prev.map((s) => (s._id === id ? data : s)));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Subscriptions</h1>
        <p className="text-sm text-gray-500">All premium memberships and their status.</p>
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
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Renews / Ends</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8">Loading subscriptions...</td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8">No subscriptions yet.</td>
                </tr>
              ) : (
                subscriptions.map((sub) => (
                  <tr key={sub._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">{sub.userEmail}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                          statusStyles[sub.status] || statusStyles.incomplete
                        }`}
                      >
                        {sub.status.replace('_', ' ')}
                      </span>
                      {sub.cancelAtPeriodEnd && sub.status !== 'canceled' && (
                        <span className="ml-2 text-xs text-amber-600">(ending)</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {sub.currentPeriodEnd
                        ? new Date(sub.currentPeriodEnd).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {sub.status !== 'canceled' && !sub.cancelAtPeriodEnd && (
                        <button
                          onClick={() => handleCancel(sub._id)}
                          disabled={actioningId === sub._id}
                          className="text-red-500 hover:underline font-medium disabled:opacity-50"
                        >
                          Cancel
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
