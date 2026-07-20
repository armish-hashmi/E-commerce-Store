import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <span className="text-xl font-bold text-indigo-600">OnlineStore</span>
            <p className="mt-2 text-sm text-gray-500">
              Modern e-commerce platform.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Shop</h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-500">
              <li><Link href="/products" className="hover:text-indigo-600">All Products</Link></li>
              <li><Link href="/categories" className="hover:text-indigo-600">Categories</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Account</h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-500">
              <li><Link href="/login" className="hover:text-indigo-600">Login</Link></li>
              <li><Link href="/cart" className="hover:text-indigo-600">View Cart</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Company</h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-500">
              <li><Link href="/contact" className="hover:text-indigo-600">Contact Us</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}