'use client';

import { useState, useEffect } from 'react';

interface CouponItem {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  expiryDate: string | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

function getCouponStatus(coupon: CouponItem): { label: string; className: string } {
  if (!coupon.isActive) {
    return { label: 'Disabled', className: 'bg-gray-100 text-gray-600 border border-gray-200' };
  }
  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
    return { label: 'Expired', className: 'bg-red-50 text-red-700 border border-red-200' };
  }
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return { label: 'Limit Reached', className: 'bg-amber-50 text-amber-700 border border-amber-200' };
  }
  return { label: 'Active', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' };
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [usageLimit, setUsageLimit] = useState('');

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load coupons');
      setCoupons(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const resetForm = () => {
    setCode('');
    setType('percentage');
    setValue('');
    setExpiryDate('');
    setUsageLimit('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!code.trim() || !value) {
      setError('Code and value are required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          type,
          value: Number(value),
          expiryDate: expiryDate || undefined,
          usageLimit: usageLimit ? Number(usageLimit) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create coupon');

      setSuccess(`Coupon "${data.code}" created successfully!`);
      resetForm();
      fetchCoupons();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (coupon: CouponItem) => {
    setActioningId(coupon._id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/coupons/${coupon._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update coupon');
      setCoupons((prev) => prev.map((c) => (c._id === coupon._id ? data : c)));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActioningId(null);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"? This cannot be undone.`)) return;

    setActioningId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete coupon');
      setCoupons((prev) => prev.filter((c) => c._id !== id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Coupons & Discounts</h1>
        <p className="text-sm text-gray-500 mt-1">Create and manage discount codes for your store.</p>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>
      )}
      {success && (
        <div className="p-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Form Section */}
        <div className="lg:col-span-1 bg-white p-5 sm:p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Create New Coupon</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Coupon Code *</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="SUMMER25"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Discount Type *</label>
              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => setType('percentage')}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                    type === 'percentage'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Percentage
                </button>
                <button
                  type="button"
                  onClick={() => setType('fixed')}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                    type === 'fixed'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Fixed Amount
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {type === 'percentage' ? 'Percentage Off (%) *' : 'Amount Off ($) *'}
              </label>
              <input
                type="number"
                min="0"
                max={type === 'percentage' ? 100 : undefined}
                step={type === 'percentage' ? 1 : 0.01}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={type === 'percentage' ? '25' : '10.00'}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-400">Leave blank for no expiry.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Usage Limit</label>
              <input
                type="number"
                min="1"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="e.g. 100"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-400">Leave blank for unlimited uses.</p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 text-sm"
            >
              {submitting ? 'Creating...' : 'Create Coupon'}
            </button>
          </form>
        </div>

        {/* Coupons View Section */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Existing Coupons</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-gray-500">Loading coupons...</div>
          ) : coupons.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              No coupons yet. Create your first one using the form.
            </div>
          ) : (
            <>
              {/* Mobile Cards (Shown on small screens) */}
              <div className="block md:hidden divide-y divide-gray-100">
                {coupons.map((coupon) => {
                  const status = getCouponStatus(coupon);
                  return (
                    <div key={coupon._id} className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-gray-900 text-base">
                          {coupon.code}
                        </span>
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}>
                          {status.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div>
                          <span className="text-gray-400 block">Discount</span>
                          <span className="font-medium text-gray-800">
                            {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value.toFixed(2)}`}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">Expiry</span>
                          <span className="font-medium text-gray-800">
                            {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'Never'}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-400 block">Usage Count</span>
                          <span className="font-medium text-gray-800">
                            {coupon.usedCount} / {coupon.usageLimit ?? '∞'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-4 pt-2 border-t border-gray-50 text-sm">
                        <button
                          onClick={() => handleToggleActive(coupon)}
                          disabled={actioningId === coupon._id}
                          className="text-indigo-600 hover:underline font-medium disabled:opacity-50"
                        >
                          {coupon.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => handleDelete(coupon._id, coupon.code)}
                          disabled={actioningId === coupon._id}
                          className="text-red-500 hover:underline font-medium disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table (Shown on medium and larger screens) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-6 py-3">Code</th>
                      <th className="px-6 py-3">Discount</th>
                      <th className="px-6 py-3">Expiry</th>
                      <th className="px-6 py-3">Usage</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {coupons.map((coupon) => {
                      const status = getCouponStatus(coupon);
                      return (
                        <tr key={coupon._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-mono font-semibold text-gray-900">{coupon.code}</td>
                          <td className="px-6 py-4">
                            {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value.toFixed(2)}`}
                          </td>
                          <td className="px-6 py-4">
                            {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="px-6 py-4">
                            {coupon.usedCount} / {coupon.usageLimit ?? '∞'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                            <button
                              onClick={() => handleToggleActive(coupon)}
                              disabled={actioningId === coupon._id}
                              className="text-indigo-600 hover:underline font-medium disabled:opacity-50"
                            >
                              {coupon.isActive ? 'Disable' : 'Enable'}
                            </button>
                            <button
                              onClick={() => handleDelete(coupon._id, coupon.code)}
                              disabled={actioningId === coupon._id}
                              className="text-red-500 hover:underline font-medium disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}