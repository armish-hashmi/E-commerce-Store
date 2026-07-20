import Link from 'next/link';
import './globals.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-6 space-y-6">
        <Link href="/admin" className="text-xl font-bold tracking-wide text-indigo-400">
          Admin Portal
        </Link>
        <nav className="flex-1 space-y-2 text-sm font-medium">
          <Link href="/admin" className="block px-3 py-2 rounded bg-slate-800 text-white">Dashboard</Link>
          <Link href="/admin/products" className="block px-3 py-2 rounded hover:bg-slate-800 text-slate-300">Products</Link>
          <Link href="/admin/orders" className="block px-3 py-2 rounded hover:bg-slate-800 text-slate-300">Orders</Link>
        </nav>

        {/* Back to Store */}
        <Link href="/" className="text-xs text-slate-400 hover:text-white">&larr; Back to Main Store</Link>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-500">Role: <span className="text-indigo-600">Administrator</span></span>
          <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">AD</div>
        </header>
        <main className="p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}