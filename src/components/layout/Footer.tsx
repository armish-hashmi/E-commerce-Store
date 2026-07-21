'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';



export default function Footer() {
 const pathname = usePathname();
 const getLinkClass = (path: string) =>
    `transition-colors ${
      pathname === path
        ? 'font-medium text-indigo-600'
        : 'text-gray-500 hover:text-indigo-600'
    }`;
  
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <span className="text-xl font-bold text-indigo-600">OnlineStore</span>
          </div>
        <div>
        <h3 className="text-sm font-semibold text-gray-900">Shop</h3>
        <ul className="mt-4 space-y-2 text-sm">
          <li>
            <Link href="/products" className={getLinkClass('/products')}>
              All Products
            </Link>
          </li>
          <li>
            <Link href="/categories" className={getLinkClass('/categories')}>
              Categories
            </Link>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900">Account</h3>
        <ul className="mt-4 space-y-2 text-sm">
          <li>
            <Link href="/login" className={getLinkClass('/login')}>
              Login
            </Link>
          </li>
          <li>
            <Link href="/cart" className={getLinkClass('/cart')}>
              View Cart
            </Link>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900">Company</h3>
        <ul className="mt-4 space-y-2 text-sm">
          <li>
            <Link href="/contact" className={getLinkClass('/contact')}>
              Contact Us
            </Link>
          </li>
        </ul>
      </div>
        </div>
      </div>
    </footer>
  );
}