'use client';

import { useState, useEffect } from 'react';

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description?: string;
}

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

interface Order {
  _id: string;
  amountTotal: number;
  status: string;
  createdAt?: string;
}

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchOrders();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      const contentType = res.headers.get('content-type') || '';

      if (!res.ok || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error(
          `Expected JSON from /api/admin/products but got status ${res.status}. Response body:`,
          text.slice(0, 500)
        );
        setProducts([]);
        return;
      }

      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      if (!res.ok) throw new Error('Failed to load categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Failed to load orders');
      const data = await res.json();
      setOrders(data.orders || data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const totalRevenue = orders.reduce((sum, order) => sum + (order.amountTotal || 0), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div className="space-y-10">
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Dashboard</h1>
            <p className="text-sm text-gray-500">Store performance overview and catalog listings.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Revenue</p>
            <p className="text-2xl font-extrabold text-indigo-600 mt-2">
              {loadingOrders ? '...' : `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Orders</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-2">
              {loadingOrders ? '...' : totalOrders}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg. Order Value</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-2">
              {loadingOrders ? '...' : `$${avgOrderValue.toFixed(2)}`}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Products</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-2">
              {loadingProducts ? '...' : products.length}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">Products</h2>
          <p className="text-sm text-gray-500">All products currently live on the store.</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden mb-10">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loadingProducts ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8">Loading products...</td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8">No products found.</td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <span className="font-semibold text-gray-900">{product.name}</span>
                      </td>
                      <td className="px-6 py-4">{product.category}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">${product.price.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">Categories</h2>
          <p className="text-sm text-gray-500">All categories currently live on the store.</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Slug</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loadingCategories ? (
                  <tr>
                    <td colSpan={2} className="text-center py-8">Loading categories...</td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="text-center py-8">No categories found.</td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 flex items-center gap-3">
                        {category.image && (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="h-8 w-8 rounded-lg object-cover"
                          />
                        )}
                        <span className="font-semibold text-gray-900">{category.name}</span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">{category.slug}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}