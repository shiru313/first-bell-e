'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { collection, getDocs } from 'firebase/firestore';
import { db, slugify } from '@/lib/firebase';
import { trackProductView } from '@/lib/personalization';
import { getFromCache, saveToCache } from '@/lib/cache';
import { ProductDetail } from '@/components/ProductDetail';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { MobileHeader } from '@/components/MobileHeader';

interface Product {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  brand?: string;
  stock: number;
  description?: string;
  thumbnail: string;
  images?: string[];
  slug: string;
  variants?: any[];
  mainCategory?: {
    categoryId: string;
  };
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        // Try cache first
        let allProducts = getFromCache<Product[]>('products');

        if (!allProducts) {
          // Load all products from Firebase
          const prodSnap = await getDocs(collection(db, 'products'));
          allProducts = prodSnap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              ...data,
              slug: data.slug || slugify(data.name),
            } as Product;
          });
          saveToCache('products', allProducts);
        }

        // Find current product
        const currentProduct = allProducts?.find((p) => p.slug === params.slug);
        if (!currentProduct) {
          router.push('/store');
          return;
        }

        // Track product view for personalization
        trackProductView(currentProduct.id);
        setProduct(currentProduct);

        // Find related products (same category)
        const related = allProducts.filter(
          (p) =>
            p.mainCategory?.categoryId ===
              currentProduct.mainCategory?.categoryId && p.id !== currentProduct.id
        );
        setRelatedProducts(related.slice(0, 6));
      } catch (error) {
        console.error('Error loading product:', error);
        router.push('/store');
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [params.slug, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-[#131921] rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Product not found</p>
          <Link href="/store">
            <Button>Back to Store</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
     <MobileHeader />  

      {/* Product Detail */}
      <main className="p-4 md:p-6 max-w-2xl mx-auto">
        <ProductDetail product={product} relatedProducts={relatedProducts} />

        {/* Back Button */}
        <div className="mt-6 flex gap-3">
          <Link href="/store" className="flex-1">
            <img src="/smile.png" alt=""  className='w-9'/>
          </Link>
        </div>
      </main>
    </div>
  );
}
