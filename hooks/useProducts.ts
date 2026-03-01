'use client';

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getFromCache, saveToCache } from "@/lib/cache";

export function useProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = getFromCache<any[]>("products");
    if (cached) {
      setProducts(cached);
    }

    const unsubscribe = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(data);
        saveToCache("products", data);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { products, loading };
}