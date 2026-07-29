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
  statusReason?: string;
  items: OrderItem[];
  createdAt: string;
}

const statusStyles: Record<string, string> = {
  paid: 'bg-amber-50 text-amber-700 border border-amber-200',
  accepted: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
  refunded: 'bg-gray-100 text-gray-600 border border-gray-200',
};

const ORDERS_PER_PAGE = 10;

type PendingAction = { type: 'reject' | 'refund'; orderId: string } | null;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [reasonInput, setReasonInput] = useState('');
  const [reasonError, setReasonError] = useState<string | null>(null);

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

  const handleAccept = async (id: string) => {
    setActioningId(id);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted' }),
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

  const openReasonModal = (type: 'reject' | 'refund', orderId: string) => {
    setPendingAction({ type, orderId });
    setReasonInput('');
    setReasonError(null);
  };

  const closeReasonModal = () => {
    setPendingAction(null);
    setReasonInput('');
    setReasonError(null);
  };

  const submitReasonAction = async () => {
    if (!pendingAction) return;

    if (!reasonInput.trim()) {
      setReasonError('Please provide a reason.');
      return;
    }

    const { type, orderId } = pendingAction;
    setActioningId(orderId);
    setError(null);

    try {
      const url =
        type === 'reject' ? `/api/orders/${orderId}` : `/api/orders/${orderId}/refund`;
      const method = type === 'reject' ? 'PATCH' : 'POST';
      const body =
        type === 'reject'
          ? { status: 'rejected', reason: reasonInput.trim() }
          : { reason: reasonInput.trim() };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${type} order`);

      setOrders((prev) => prev.map((o) => (o._id === orderId ? data : o)));
      closeReasonModal();
    } catch (err: any) {
      setReasonError(err.message);
    } finally {
      setActioningId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(orders.length / ORDERS_PER_PAGE));
  const paginatedOrders = orders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

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
                paginatedOrders.map((order) => (
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
                      {order.statusReason && (
                        <p className="mt-1 text-xs text-gray-400 max-w-[180px]">
                          {order.statusReason}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                      {order.status === 'paid' && (
                        <>
                          <button
                            onClick={() => handleAccept(order._id)}
                            disabled={actioningId === order._id}
                            className="text-emerald-600 hover:underline font-medium disabled:opacity-50"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => openReasonModal('reject', order._id)}
                            disabled={actioningId === order._id}
                            className="text-red-500 hover:underline font-medium disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {order.status !== 'refunded' && (
                        <button
                          onClick={() => openReasonModal('refund', order._id)}
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

        {!loading && orders.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
            <p className="text-xs text-gray-500">
              Showing {(currentPage - 1) * ORDERS_PER_PAGE + 1}–
              {Math.min(currentPage * ORDERS_PER_PAGE, orders.length)} of {orders.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">
              {pendingAction.type === 'reject' ? 'Reject Order' : 'Refund Order'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {pendingAction.type === 'reject'
                ? 'The customer will be notified and their payment will be automatically refunded within 5–10 business days.'
                : 'This issues a real refund through Stripe. The customer will be notified and funds will return to their original payment method within 5–10 business days.'}
            </p>

            {reasonError && (
              <div className="mt-3 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                {reasonError}
              </div>
            )}

            <div className="mt-4">
              <label className="block text-xs font-semibold text-gray-700">
                Reason (shown to the customer)
              </label>
              <textarea
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                rows={3}
                placeholder={
                  pendingAction.type === 'reject'
                    ? 'e.g. Item is currently out of stock'
                    : 'e.g. Customer requested a refund due to shipping delay'
                }
                className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm"
              />
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeReasonModal}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitReasonAction}
                disabled={actioningId === pendingAction.orderId}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {actioningId === pendingAction.orderId
                  ? 'Processing...'
                  : pendingAction.type === 'reject'
                  ? 'Reject Order'
                  : 'Issue Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}