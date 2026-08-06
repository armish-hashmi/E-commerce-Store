'use client';

import { useState, useEffect } from 'react';

interface Review {
  _id: string;
  productId: string;
  userEmail: string;
  userName?: string;
  rating: number;
  comment: string;
  hidden: boolean;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load reviews');
      setReviews(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const toggleHidden = async (id: string, hidden: boolean) => {
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hidden: !hidden }),
    });
    const data = await res.json();
    if (res.ok) setReviews((prev) => prev.map((r) => (r._id === id ? data : r)));
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review permanently?')) return;
    const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
    if (res.ok) setReviews((prev) => prev.filter((r) => r._id !== id));
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Reviews</h1>
        <p className="text-sm text-gray-500">Moderate customer reviews across all products.</p>
      </div>

      {error && <div className="mb-4 p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Rating</th>
                <th className="px-6 py-3">Comment</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8">Loading reviews...</td></tr>
              ) : reviews.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8">No reviews yet.</td></tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review._id} className="hover:bg-gray-50 align-top">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{review.userName || 'Anonymous'}</div>
                      <div className="text-xs text-gray-400">{review.userEmail}</div>
                    </td>
                    <td className="px-6 py-4">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</td>
                    <td className="px-6 py-4 max-w-xs">{review.comment || <span className="text-gray-400">No comment</span>}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${review.hidden ? 'bg-gray-100 text-gray-600' : 'bg-emerald-50 text-emerald-700'}`}>
                        {review.hidden ? 'Hidden' : 'Visible'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                      <button onClick={() => toggleHidden(review._id, review.hidden)} className="text-indigo-600 hover:underline font-medium">
                        {review.hidden ? 'Unhide' : 'Hide'}
                      </button>
                      <button onClick={() => deleteReview(review._id)} className="text-red-500 hover:underline font-medium">
                        Delete
                      </button>
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