import ProductCard from '@/components/ui/ProductCard';
import { MOCK_PRODUCTS } from '@/data/mockData';

export default function WishlistPage() {
  const wishlistItems = MOCK_PRODUCTS.slice(0, 2);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Your Saved Wishlist</h1>
        <p className="mt-1 text-sm text-gray-500">Items saved for quick checkout later.</p>
      </div>

      {wishlistItems.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {wishlistItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-gray-500">Your wishlist is currently empty.</p>
        </div>
      )}
    </div>
  );
}