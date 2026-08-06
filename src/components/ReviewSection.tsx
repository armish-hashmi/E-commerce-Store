'use client';

import { useState, useEffect } from 'react';

interface Review {
  _id: string;
  productId: string;
  orderId: string;
  userEmail: string;
  userName?: string;
  rating: number;
  comment: string;
  helpfulCount: number;
  createdAt: string;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'highest', label: 'Highest Rating' },
  { value: 'lowest', label: 'Lowest Rating' },
  { value: 'helpful', label: 'Most Helpful' },
];

function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 'text-lg',
}: {
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
  size?: string;
}) {
  return (
    <div className={`flex ${size}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          className={`${readOnly ? 'cursor-default' : 'cursor-pointer'} ${
            star <= value ? 'text-amber-400' : 'text-gray-300'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [sort, setSort] = useState('newest');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [eligibleOrderId, setEligibleOrderId] = useState<string | null>(null);
  const [myReview, setMyReview] = useState<Review | null>(null);

  const [formRating, setFormRating] = useState(0);
  const [formComment, setFormComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ productId, sort });
      if (ratingFilter) params.set('rating', String(ratingFilter));

      const res = await fetch(`/api/reviews?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setReviews(data.reviews || []);
        setAverageRating(data.averageRating || 0);
        setTotalReviews(data.totalReviews || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEligibility = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (!meData.user) return;
      setCurrentUser(meData.user);

      const ordersRes = await fetch('/api/orders');
      if (!ordersRes.ok) return;
      const orders = await ordersRes.json();

      const eligibleOrder = (Array.isArray(orders) ? orders : []).find(
        (o: any) => o.status === 'delivered' && o.items?.some((item: any) => item.productId === productId)
      );
      if (eligibleOrder) setEligibleOrderId(eligibleOrder._id);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchEligibility();
  }, [productId, sort, ratingFilter]);

  useEffect(() => {
    if (currentUser && reviews.length > 0) {
      const own = reviews.find((r) => r.userEmail?.toLowerCase() === currentUser.email?.toLowerCase());
      if (own) {
        setMyReview(own);
        setFormRating(own.rating);
        setFormComment(own.comment);
      }
    }
  }, [currentUser, reviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!eligibleOrderId) return;
    if (formRating < 1) {
      setFormError('Please select a star rating.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, orderId: eligibleOrderId, rating: formRating, comment: formComment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review');
      await fetchReviews();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!myReview) return;
    if (!confirm('Delete your review?')) return;
    try {
      const res = await fetch(`/api/reviews/${myReview._id}`, { method: 'DELETE' });
      if (res.ok) {
        setMyReview(null);
        setFormRating(0);
        setFormComment('');
        await fetchReviews();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      const res = await fetch(`/api/reviews/${reviewId}/helpful`, { method: 'POST' });
      if (res.ok) await fetchReviews();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mt-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
          <div className="mt-1 flex items-center gap-2">
            <StarRating value={Math.round(averageRating)} readOnly />
            <span className="text-sm font-semibold text-gray-900">{averageRating.toFixed(1)}</span>
            <span className="text-sm text-gray-500">
              ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm">
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            value={ratingFilter ?? ''}
            onChange={(e) => setRatingFilter(e.target.value ? Number(e.target.value) : null)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="">All ratings</option>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>{r} stars</option>
            ))}
          </select>
        </div>
      </div>

      {eligibleOrderId && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-900">{myReview ? 'Edit your review' : 'Write a review'}</h3>
          <form onSubmit={handleSubmitReview} className="mt-3 space-y-3">
            {formError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{formError}</div>
            )}
            <StarRating value={formRating} onChange={setFormRating} size="text-2xl" />
            <textarea
              value={formComment}
              onChange={(e) => setFormComment(e.target.value)}
              rows={3}
              placeholder="Share your thoughts about this product..."
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : myReview ? 'Update Review' : 'Submit Review'}
              </button>
              {myReview && (
                <button
                  type="button"
                  onClick={handleDeleteReview}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Delete Review
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="mt-6 divide-y divide-gray-200">
        {loading ? (
          <p className="py-6 text-sm text-gray-500">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="py-6 text-sm text-gray-500">No reviews yet.</p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="py-5">
              <p className="text-sm font-semibold text-gray-900">{review.userName || 'Anonymous'}</p>
              <div className="mt-1 flex items-center gap-2">
                <StarRating value={review.rating} readOnly size="text-sm" />
                <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              {review.comment && <p className="mt-2 text-sm text-gray-700">{review.comment}</p>}
              <button
                onClick={() => handleMarkHelpful(review._id)}
                className="mt-2 text-xs font-medium text-gray-500 hover:text-indigo-600"
              >
                Helpful ({review.helpfulCount || 0})
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}