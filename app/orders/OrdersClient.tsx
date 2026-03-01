'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrdersClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [example, setExample] = useState("");

  useEffect(() => {
    const value = searchParams.get("id");
    if (value) setExample(value);
  }, [searchParams]);

  return (
    <div>
      Orders Page
    </div>
  );
}