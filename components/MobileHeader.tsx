'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, X } from 'lucide-react';



import { usePathname } from 'next/navigation';
import { useProducts } from "@/hooks/useProducts";

interface Variant {
  color?: string;
  size?: string;
  unit?: string;
  quantity?: string;
}

interface Product {
  id: string;
  name: string;
  thumbnail: string;
  price: number;
  slug: string;
  brand?: string;
  searchKeywords?: string[];
  variants?: Variant[];
}
export function MobileHeader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pathname = usePathname();
const [isVisible, setIsVisible] = useState(true);

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { products } = useProducts();
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  /* ================= LOAD PRODUCTS ================= */




  useEffect(() => {
  if (pathname !== '/home') {
    setIsVisible(true);
    return;
  }

  const handleScroll = () => {
    const scrollPosition = window.scrollY + window.innerHeight;
    const pageHeight = document.body.scrollHeight;

    const hideTriggerPoint = pageHeight - 80; // near footer

    if (scrollPosition >= hideTriggerPoint) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, [pathname]);



function hexToColorName(hex: string) {
  if (!hex) return "";

  const h = hex.replace("#", "").toLowerCase();

  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);

  if (r > 200 && g < 80 && b < 80) return "red";
  if (g > 200 && r < 80 && b < 80) return "green";
  if (b > 200 && r < 80 && g < 80) return "blue";
  if (r > 200 && g > 200 && b < 100) return "yellow";
  if (r > 200 && g > 100 && b < 80) return "orange";
  if (r > 180 && g < 80 && b > 180) return "purple";
  if (r < 50 && g < 50 && b < 50) return "black";
  if (r > 220 && g > 220 && b > 220) return "white";

  return "";
}


function levenshtein(a: string, b: string) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}




function simplePhonetic(word: string) {
  return word
    .toLowerCase()
    .replace(/[aeiou]/g, "")
    .replace(/(.)\1+/g, "$1");
}



function normalizeNumbers(text: string) {
  return text.replace(/\s+/g, " ").toLowerCase();
}


  /* ================= SEARCH FILTER ================= */

useEffect(() => {
  if (!query.trim()) {
    setFiltered([]);
    return;
  }

  const timer = setTimeout(() => {
    const searchWords = query.toLowerCase().split(" ").filter(Boolean);

    const results = products
      .map((product) => {
        const name = product.name?.toLowerCase() || "";
        const brand = product.brand?.toLowerCase() || "";
        const keywords = (product.searchKeywords || []).join(" ").toLowerCase();
        const variants = product.variants || [];

        let score = 0;

        const variantText = variants
          .map((v) => {
            const colorName = hexToColorName(v.color || "");
            return `
              ${v.color || ""}
              ${colorName}
              ${v.size || ""}
              ${v.unit || ""}
              ${v.quantity || ""}
            `.toLowerCase();
          })
          .join(" ");

        const fullText = `
          ${name}
          ${brand}
          ${keywords}
          ${variantText}
        `.toLowerCase();

        let matched = true;

        searchWords.forEach((word) => {
          if (fullText.includes(word)) {
            score += 5;
          } else {
            const words = fullText.split(" ");
            const fuzzyMatch = words.some((w) =>
              levenshtein(w, word) <= 1 ||
              simplePhonetic(w) === simplePhonetic(word)
            );

            if (fuzzyMatch) {
              score += 3;
            } else {
              matched = false;
            }
          }
        });

        if (!matched) return null;

        return { ...product, score };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 6);

    setFiltered(results as Product[]);
  }, 200);

  return () => clearTimeout(timer);
}, [query, products]);
  /* ================= HANDLERS ================= */

  const handleSubmit = (value: string) => {
    if (!value.trim()) return;
    router.push(`/search?q=${encodeURIComponent(value)}`);
    setSearchOpen(false);
    setQuery('');
    setFiltered([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!filtered.length) return;

    if (e.key === 'ArrowDown') {
      setActiveIndex((prev) =>
        prev < filtered.length - 1 ? prev + 1 : prev
      );
    }

    if (e.key === 'ArrowUp') {
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
    }

    if (e.key === 'Enter') {
      if (activeIndex >= 0) {
        handleSubmit(filtered[activeIndex].name);
      } else {
        handleSubmit(query);
      }
    }
  };

  /* ================= HIGHLIGHT MATCH ================= */

  const highlightText = (text: string) => {
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;

    const before = text.slice(0, index);
    const match = text.slice(index, index + query.length);
    const after = text.slice(index + query.length);

    return (
      <>
        {before}
        <span className="font-bold text-black">{match}</span>
        {after}
      </>
    );
  };

  function AnimatedTagline() {
  const words = ['Play', 'Fun', 'Learn'];
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const sequence = [1, 2, 3, 4, 5, 6, 0];
    let step = 0;

    const interval = setInterval(() => {
      setStage(sequence[step]);
      step = (step + 1) % sequence.length;
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getClass = (index: number) => {
    // ENTER PHASE
    if (stage >= index + 1 && stage <= 3) {
      return 'translate-x-0 opacity-100';
    }

    // EXIT PHASE (sequential)
    if (stage === 4 && index === 0) {
      return '-translate-x-full opacity-0';
    }

    if (stage === 5 && index === 1) {
      return '-translate-x-full opacity-0';
    }

    if (stage === 6 && index === 2) {
      return '-translate-x-full opacity-0';
    }

    return 'translate-x-full opacity-0';
  };

return (
  <div className="flex overflow-hidden h-5 mt-1 ml-5">
    {words.map((word, i) => (
      <span
        key={word}
        className={`
          mr-3 
          font-medium 
          text-green-900 
          transition-all 
          duration-300 
          ease-in-out
          ${getClass(i)}
          ${searchOpen ? 'text-[10px]' : 'text-xs'}
        `}
      >
        {word}
      </span>
    ))}
  </div>
);
}

  /* ================= UI ================= */

  return (
    <header
  className={`sticky top-0 z-50 bg-white border-b h-20 border-gray-200 transition-transform duration-300 ${
    isVisible ? 'translate-y-0' : '-translate-y-full'
  }`}
>
      <div className="flex items-center gap-3 px-4 py-3">

        {/* LOGO + TAGLINE */}
     <div className="flex flex-col transition-all duration-300">
  <Link href="/home">
    <img
      src="/logo.png"
      alt="FirstBell"
      className={`transition-all duration-300 ${
        searchOpen ? 'h-7 w-auto' : 'h-10 w-auto'
      }`}
    />
  </Link>

  <AnimatedTagline />
  </div>

        {/* SEARCH BUTTON */}
        {!searchOpen && (
          <button
            onClick={() => {
              setSearchOpen(true);
              setTimeout(() => inputRef.current?.focus(), 50);
            }}
            className="flex-1 mb-5 flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg"
          >
            <Search className="w-4  h-4 text-gray-500" />
            <span className="text-sm text-gray-500">
              Search products...
            </span>
          </button>
        )}

        {/* SEARCH INPUT */}
        {searchOpen && (
          <div className="flex-1 relative">

            <div className="flex items-center bg-gray-100 rounded-lg px-3 h-9">
              <Search className="w-4 h-4 text-gray-500" />

              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search products..."
                className="flex-1 bg-transparent ml-2 outline-none text-sm"
              />

              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="ml-2"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>

            {/* AMAZON STYLE DROPDOWN */}
            {filtered.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">

                {filtered.map((product, index) => (
                  <button
                    key={product.id}
                    onClick={() =>
                      handleSubmit(product.name)
                    }
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${
                      index === activeIndex
                        ? 'bg-gray-100'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <img
                      src={product.thumbnail}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded-md"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate">
                        {highlightText(product.name)}
                      </p>
                      <p className="text-xs text-green-700 font-semibold">
                       
                      </p>
                    </div>
                  </button>
                ))}

                {/* SEE ALL */}
                <button
                  onClick={() => handleSubmit(query)}
                  className="w-full text-left px-4 py-3 bg-gray-50 text-sm font-medium text-blue-600"
                >
                  See all results for "{query}"
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}