'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isDisabled?: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set('q', search.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load users');
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timeout = setTimeout(fetchUsers, 300); // debounce search typing
    return () => clearTimeout(timeout);
  }, [fetchUsers]);

  const handleToggle = async (user: UserItem) => {
    const action = user.isDisabled ? 'enable' : 'disable';
    if (!confirm(`Are you sure you want to ${action} ${user.email}?`)) return;

    setActioningId(user._id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDisabled: !user.isDisabled }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${action} user`);
      setUsers((prev) => prev.map((u) => (u._id === user._id ? data : u)));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Users</h1>
        <p className="text-sm text-gray-500">View, search, and manage customer accounts.</p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />

        <div className="flex items-center gap-2">
          {(['all', 'active', 'disabled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status}
            </button>
          ))}
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
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8">No users found.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      <Link href={`/admin/users/${user._id}`} className="hover:underline hover:text-indigo-600">
                        {user.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4 capitalize">{user.role}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                          user.isDisabled
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {user.isDisabled ? 'Disabled' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <Link
                        href={`/admin/users/${user._id}`}
                        className="text-indigo-600 hover:underline font-medium"
                      >
                        View
                      </Link>
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleToggle(user)}
                          disabled={actioningId === user._id}
                          className={`font-medium hover:underline disabled:opacity-50 ${
                            user.isDisabled ? 'text-emerald-600' : 'text-red-500'
                          }`}
                        >
                          {user.isDisabled ? 'Enable' : 'Disable'}
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
