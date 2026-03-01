'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/home');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-[#131921] rounded-full animate-spin"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
