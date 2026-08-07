'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import NotificationBell from '@/components/NotificationBell';
import ChatWidget from '@/components/ChatWidget';
import { clearGuestSession } from '@/lib/clearSession';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateCounts = () => {
      const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlistCount(savedWishlist.length);

      const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(savedCart.length);
    };

    updateCounts();

    window.addEventListener('storage', updateCounts);
    return () => window.removeEventListener('storage', updateCounts);
  }, []);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        setIsLoggedIn(!!data.user);
        setIsAdmin(data.user?.role === 'admin');
        setUserEmail(data.user?.email || null);

        if (data.user) {
          try {
            const subRes = await fetch('/api/subscription/status');
            const subData = await subRes.json();
            setIsSubscribed(!!subData.isSubscribed);
          } catch {
            setIsSubscribed(false);
          }
        } else {
          setIsSubscribed(false);
        }
      } catch (err) {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setUserEmail(null);
        setIsSubscribed(false);
      }
    }

    checkSession();
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Failed to log out', err);
    } finally {
      
      clearGuestSession();

      setIsLoggedIn(false);
      setIsAdmin(false);
      setIsSubscribed(false);
      setUserEmail(null);
      setLoggingOut(false);
      setIsOpen(false);
      router.push('/');
      router.refresh();
    }
  };

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return isActive
      ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
      : 'text-gray-600 hover:text-indigo-600';
  };

  const getMobileLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `block py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'text-indigo-600 font-semibold bg-indigo-50/50 px-3 rounded-lg'
        : 'text-gray-700 hover:text-indigo-600 px-3'
    }`;
  };

  return (
    <>
    <header ref={navRef} className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          onClick={() => setIsOpen(false)}
          className="text-2xl font-bold tracking-tight text-indigo-600"
        >
          Online<span className="text-gray-900">Store</span>
        </Link>

        <nav className="hidden space-x-8 md:flex font-medium text-sm">
          <Link href="/" className={getLinkClass('/')}>
            Home
          </Link>
          <Link href="/products" className={getLinkClass('/products')}>
            Shop
          </Link>
          <Link href="/categories" className={getLinkClass('/categories')}>
            Categories
          </Link>
          <Link href="/contact" className={getLinkClass('/contact')}>
            Contact
          </Link>
        </nav>

        <div className="hidden items-center space-x-5 md:flex">
          <Link
            href="/wishlist"
            className={`text-sm transition-colors ${
              pathname === '/wishlist'
                ? 'font-semibold text-indigo-600'
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            Wishlist ({wishlistCount})
          </Link>

          <Link
            href="/cart"
            className={`text-sm transition-colors flex items-center ${
              pathname === '/cart'
                ? 'font-semibold text-indigo-600'
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            Cart
            <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
              {cartCount}
            </span>
          </Link>

          {isLoggedIn && !isAdmin && (
            <Link
              href="/subscribe"
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold shadow-sm transition-all ${
                isSubscribed
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white hover:shadow-md'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-md hover:from-indigo-500 hover:to-purple-500'
              }`}
            >
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 00-.363 1.118l1.287 3.957c.3.922-.755 1.688-1.54 1.118l-3.367-2.447a1 1 0 00-1.176 0l-3.367 2.447c-.784.57-1.838-.196-1.539-1.118l1.286-3.957a1 1 0 00-.363-1.118L2.062 9.385c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.958z" />
              </svg>
              {isSubscribed ? 'Premium' : 'Go Premium'}
            </Link>
          )}

          {isLoggedIn && <NotificationBell recipientType="user" recipientEmail={userEmail} />}

          {isLoggedIn && (
            <Link
              href="/orders"
              className={`text-sm transition-colors ${
                pathname === '/orders'
                  ? 'font-semibold text-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              My Orders
            </Link>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className={`text-sm font-semibold transition-colors ${
                pathname.startsWith('/admin')
                  ? 'text-indigo-600'
                  : 'text-gray-700 hover:text-indigo-600'
              }`}
            >
              Admin Panel
            </Link>
          )}

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors disabled:opacity-50"
            >
              {loggingOut ? 'Logging out...' : 'Logout'}
            </button>
          ) : (
            <Link
              href="/login"
              className={`text-sm font-semibold transition-colors ${
                pathname === '/login'
                  ? 'text-indigo-600'
                  : 'text-gray-700 hover:text-indigo-600'
              }`}
            >
              Log in
            </Link>
          )}
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Navigation Menu"
          className="md:hidden text-gray-600 focus:outline-none"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden space-y-2 shadow-lg">
          {isLoggedIn && (
            <div className="flex justify-end pb-1">
              <NotificationBell recipientType="user" recipientEmail={userEmail} />
            </div>
          )}
          <Link href="/" onClick={() => setIsOpen(false)} className={getMobileLinkClass('/')}>
            Home
          </Link>
          <Link href="/products" onClick={() => setIsOpen(false)} className={getMobileLinkClass('/products')}>
            Shop
          </Link>
          <Link href="/categories" onClick={() => setIsOpen(false)} className={getMobileLinkClass('/categories')}>
            Categories
          </Link>
          <Link href="/contact" onClick={() => setIsOpen(false)} className={getMobileLinkClass('/contact')}>
            Contact
          </Link>
          <Link href="/cart" onClick={() => setIsOpen(false)} className={getMobileLinkClass('/cart')}>
            Cart ({cartCount})
          </Link>
          <Link href="/wishlist" onClick={() => setIsOpen(false)} className={getMobileLinkClass('/wishlist')}>
            Wishlist ({wishlistCount})
          </Link>
          {isLoggedIn && !isAdmin && (
            <Link
              href="/subscribe"
              onClick={() => setIsOpen(false)}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold shadow-sm transition ${
                isSubscribed
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
              }`}
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 00-.363 1.118l1.287 3.957c.3.922-.755 1.688-1.54 1.118l-3.367-2.447a1 1 0 00-1.176 0l-3.367 2.447c-.784.57-1.838-.196-1.539-1.118l1.286-3.957a1 1 0 00-.363-1.118L2.062 9.385c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.958z" />
              </svg>
              {isSubscribed ? 'Premium Member' : 'Go Premium — Get a Discount'}
            </Link>
          )}
          {isLoggedIn && (
            <Link href="/orders" onClick={() => setIsOpen(false)} className={getMobileLinkClass('/orders')}>
              My Orders
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin" onClick={() => setIsOpen(false)} className={getMobileLinkClass('/admin')}>
              Admin Panel
            </Link>
          )}
          <div className="pt-3 border-t border-gray-100">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="block w-full text-center rounded-lg bg-indigo-600 py-2.5 text-white font-medium hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loggingOut ? 'Logging out...' : 'Logout'}
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="block text-center rounded-lg bg-indigo-600 py-2.5 text-white font-medium hover:bg-indigo-700 transition"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
    {isLoggedIn && !isAdmin && <ChatWidget isLoggedIn={isLoggedIn} />}
    </>
  );
}