import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 p-6 flex-shrink-0">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            A
          </div>
          <span className="text-xl font-bold text-gray-900">Admin Control</span>
        </div>

        <nav className="space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/products"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
          >
            Products Management
          </Link>
          <Link
            href="/admin/categories"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
          >
            Categories
          </Link>
          <hr className="my-4 border-gray-200" />
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-100 transition"
          >
            Back to Store
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-4 sm:p-8 lg:p-10 overflow-y-auto">{children}</main>
    </div>
  );
}