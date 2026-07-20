export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Shopping Cart</h1>

      <div className="mt-8 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12">
        {/* Cart Items List */}
        <section className="lg:col-span-7 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <ul className="divide-y divide-gray-200">
            <li className="flex py-4 space-x-4">
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"
                alt="Product"
                className="h-20 w-20 rounded-lg object-cover"
              />
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">Wireless Noise-Canceling Headphones</h3>
                  <p className="text-sm text-gray-500">Electronics</p>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-900">Qty: 1</span>
                  <button className="text-red-500 hover:underline">Remove</button>
                </div>
              </div>
              <span className="font-bold text-gray-900">$299</span>
            </li>
          </ul>
        </section>

        <section className="mt-8 rounded-xl bg-gray-100 p-6 lg:col-span-5 lg:mt-0">
          <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>

          <div className="mt-4 space-y-2 border-b border-gray-200 pb-4 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">$299.00</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Estimated Shipping</span>
              <span className="font-semibold text-gray-900">$15.00</span>
            </div>
          </div>

          <div className="mt-4 flex justify-between font-bold text-gray-900 text-lg">
            <span>Total</span>
            <span>$314.00</span>
          </div>

          <button className="mt-6 w-full rounded-lg bg-indigo-600 py-3 text-white font-semibold shadow hover:bg-indigo-700 transition">
            Proceed to Checkout
          </button>
        </section>
      </div>
    </div>
  );
}