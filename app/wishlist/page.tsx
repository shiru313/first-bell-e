import { MobileHeader } from '@/components/MobileHeader';

export default function WishlistPage() {
  return (
    <main className="min-h-screen bg-white">
      <MobileHeader />
      <div className="p-4 pt-20">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">My Wishlist</h1>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-2">Your wishlist is empty</p>
          <p className="text-sm text-gray-500">Products you like will appear here</p>
        </div>
      </div>
    </main>
  );
}
