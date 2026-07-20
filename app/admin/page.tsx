export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-sm font-medium text-gray-500">Total Revenue</span>
          <p className="text-2xl font-bold text-gray-900 mt-2">$24,500.00</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-sm font-medium text-gray-500">Total Orders</span>
          <p className="text-2xl font-bold text-gray-900 mt-2">1,240</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-sm font-medium text-gray-500">Active Products</span>
          <p className="text-2xl font-bold text-gray-900 mt-2">84</p>
        </div>
      </div>
    </div>
  );
}