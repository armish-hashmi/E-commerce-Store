'use client';

import { useState, useEffect } from 'react';

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'replied';
  adminReply?: string;
  repliedAt?: string;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMessage, setActiveMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch('/api/admin/contact');

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned HTML (${res.status} ${res.statusText}). Check API route file location.`);
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load messages');
      
      setMessages(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const openMessage = (msg: ContactMessage) => {
    setActiveMessage(msg);
    setReplyText(msg.adminReply || '');
    setReplyError(null);
  };

  const closeMessage = () => {
    setActiveMessage(null);
    setReplyText('');
    setReplyError(null);
  };

  const handleSendReply = async () => {
    if (!activeMessage) return;
    if (!replyText.trim()) {
      setReplyError('Please write a reply before sending.');
      return;
    }

    setSending(true);
    setReplyError(null);

    try {
      const res = await fetch(`/api/admin/contact/${activeMessage._id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyText.trim() }),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned non-JSON response (${res.status}).`);
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reply');

      setMessages((prev) => prev.map((m) => (m._id === data._id ? data : m)));
      closeMessage();
    } catch (err: any) {
      setReplyError(err.message);
    } finally {
      setSending(false);
    }
  };

  const newCount = messages.filter((m) => m.status === 'new').length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Messages</h1>
        <p className="text-sm text-gray-500">
          {loading ? 'Loading...' : `${newCount} unreplied of ${messages.length} total`}
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
                <th className="px-6 py-3">From</th>
                <th className="px-6 py-3">Subject</th>
                <th className="px-6 py-3">Received</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8">Loading messages...</td></tr>
              ) : messages.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8">No messages yet.</td></tr>
              ) : (
                messages.map((msg) => (
                  <tr key={msg._id} className="hover:bg-gray-50 align-top">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{msg.name}</div>
                      <div className="text-xs text-gray-400">{msg.email}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate">{msg.subject}</td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                          msg.status === 'replied'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {msg.status === 'replied' ? 'Replied' : 'New'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openMessage(msg)}
                        className="text-indigo-600 hover:underline font-medium"
                      >
                        {msg.status === 'replied' ? 'View' : 'Reply'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {activeMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{activeMessage.subject}</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  From {activeMessage.name} &lt;{activeMessage.email}&gt;
                </p>
              </div>
              <button onClick={closeMessage} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className="mt-4 rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm text-gray-700 whitespace-pre-wrap">
              {activeMessage.message}
            </div>

            {activeMessage.status === 'replied' && activeMessage.adminReply && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-700 mb-1">
                  Your reply (sent {activeMessage.repliedAt ? new Date(activeMessage.repliedAt).toLocaleString() : ''})
                </p>
                <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-3 text-sm text-gray-700 whitespace-pre-wrap">
                  {activeMessage.adminReply}
                </div>
              </div>
            )}

            {replyError && (
              <div className="mt-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                {replyError}
              </div>
            )}

            <div className="mt-4">
              <label className="block text-xs font-semibold text-gray-700">
                {activeMessage.status === 'replied' ? 'Send another reply' : 'Your reply'}
              </label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={5}
                placeholder="Type your reply — this will be emailed to the customer."
                className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm"
              />
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeMessage}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSendReply}
                disabled={sending}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}