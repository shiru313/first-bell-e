'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCart } from '@/lib/cart';

export function BottomNav() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // 1. Define routes where the nav should be completely hidden
  const isCheckoutPage = pathname.startsWith('/checkout');
  const isPaymentPage = pathname.startsWith('/payment');
  const isCheckoutOrPaymentPage = isCheckoutPage || isPaymentPage;
  
  // 2. Logic for Home Page scroll-hide behavior
  const isHomePage = pathname === '/home';

  // 🔥 Scroll hide ONLY on home, but ALWAYS hide on checkout
  useEffect(() => {
    // If it's checkout, keep it hidden (though we handle this in the return too)
    if (isCheckoutPage || isPaymentPage) {
      setIsVisible(false);
      return;
    }

    // If it's NOT the home page, it should always be visible
    if (!isHomePage) {
      setIsVisible(true);
      return;
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const pageHeight = document.body.scrollHeight;
      const hideTriggerPoint = pageHeight - 80;

      if (scrollPosition >= hideTriggerPoint) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname, isHomePage, isCheckoutPage]);

  // 🔥 Cart Count
  useEffect(() => {
    const updateCartCount = () => {
      setCartCount(getCart().length);
    };
    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    window.addEventListener('storage', updateCartCount);
    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

  // 3. Prevent rendering entirely if on checkout page
  if (isCheckoutPage) return null;

  const navItems = [
    { icon: Home, label: 'Home', href: '/home' },
    { icon: Search, label: 'Search', href: '/store' },
    { icon: ShoppingCart, label: 'My Basket', href: '/orders' },
  ];

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="flex items-center justify-around max-w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-3 px-4 flex-1 transition-colors ${
                isActive
                  ? 'text-[#005F5F] border-t-2 border-[#005F5F]'
                  : 'text-gray-600 hover:text-[#005F5F]'
              }`}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {item.label === 'My Basket' && cartCount > 0 && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}