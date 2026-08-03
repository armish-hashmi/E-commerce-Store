'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import NotificationBell from '@/components/NotificationBell';

const baseNavLinkClass =
  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition';
const activeNavLinkClass = 'bg-indigo-100 text-indigo-700';
const inactiveNavLinkClass = 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600';

const secondaryLinkClass =
  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-100 transition';

const logoutButtonClass =
  'flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition text-left';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Failed to log out', err);
    } finally {
      closeMenu();
      router.push('/login');
      router.refresh();
    }
  };

  const isActive = (path: string) => {
    if (path === '/admin') return pathname === '/admin';
    return pathname.startsWith(path);
  };

  const NavLinks = () => (
    <div className="flex flex-col h-full">
      <nav className="space-y-1">
        <Link
          href="/admin"
          onClick={closeMenu}
          className={`${baseNavLinkClass} ${isActive('/admin') && pathname === '/admin' ? activeNavLinkClass : inactiveNavLinkClass}`}
        >
          Dashboard
        </Link>
        <Link
          href="/admin/orders"
          onClick={closeMenu}
          className={`${baseNavLinkClass} ${isActive('/admin/orders') ? activeNavLinkClass : inactiveNavLinkClass}`}
        >
          Orders Management
        </Link>
        <Link
          href="/admin/products"
          onClick={closeMenu}
          className={`${baseNavLinkClass} ${isActive('/admin/products') ? activeNavLinkClass : inactiveNavLinkClass}`}
        >
          Products Management
        </Link>
        <Link
          href="/admin/categories"
          onClick={closeMenu}
          className={`${baseNavLinkClass} ${isActive('/admin/categories') ? activeNavLinkClass : inactiveNavLinkClass}`}
        >
          Categories
        </Link>
        <Link
          href="/admin/subscriptions"
          onClick={closeMenu}
          className={`${baseNavLinkClass} ${isActive('/admin/subscriptions') ? activeNavLinkClass : inactiveNavLinkClass}`}
        >
          Subscriptions
        </Link>
      </nav>

      <div className="mt-auto pt-4 space-y-1 border-t border-gray-200">
        <Link href="/" onClick={closeMenu} className={secondaryLinkClass}>
          Back to Store
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className={`${logoutButtonClass} disabled:opacity-50`}
        >
          {loggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            A
          </div>
          <span className="text-lg font-bold text-gray-900">Admin Control</span>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell recipientType="admin" />
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={closeMenu}
            aria-hidden="true"
          />
          <aside className="relative w-164 max-w-[80%] bg-white h-full p-6 shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  A
                </div>
                <span className="text-xl font-bold text-gray-900">Admin Control</span>
              </div>
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close menu"
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <NavLinks />
          </aside>
        </div>
      )}

      <aside className="hidden md:flex md:w-64 md:sticky md:top-0 md:h-screen bg-white border-r border-gray-200 p-6 flex-shrink-0 flex-col overflow-y-auto">
        <div className="flex items-center justify-between gap-2 mb-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              A
            </div>
            <span className="text-xl font-bold text-gray-900">Admin Control</span>
          </div>
          <NotificationBell recipientType="admin" />
        </div>
        <NavLinks />
      </aside>

      <main className="flex-1 p-4 sm:p-8 lg:p-10 overflow-y-auto">{children}</main>
    </div>
  );
}
