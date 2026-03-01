'use client';

import { useEffect, useState } from 'react';
import { getCart, saveCart, CartItem } from '@/lib/cart';
import { ChevronDown, Trash2 , Gift } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import nextDynamic from "next/dynamic"




import { addToCart, updateCartQuantity } from '@/lib/cart';

interface SuggestedProduct {
  id: string; 
  name: string;
  thumbnail: string;
  price?: number;
  comboProducts?: any[];
}

export default function OrdersPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [slideValue, setSlideValue] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [suggested, setSuggested] = useState<SuggestedProduct[]>([]);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const searchParams = useSearchParams();
  const focusId = searchParams.get("focus");
  const focusVariant = searchParams.get("variant");
  const [activeFocus, setActiveFocus] = useState<string | null>(null);  
  const router = useRouter();

 useEffect(() => {
  const loadCartAndSuggestions = async () => {
    const cartData = getCart();
    setCart(cartData);

    //  Collect Firestore combo IDs
    const comboDocIds: string[] = [];

    cartData.forEach((item: any) => {
      if (item.comboProducts && item.comboProducts.length > 0) {
        item.comboProducts.forEach((combo: any) => {
          if (!comboDocIds.includes(combo.id)) {
            comboDocIds.push(combo.id);  // this is Firestore doc id
          }
        });
      }
    });

    if (comboDocIds.length === 0) {
      setSuggested([]);
      return;
    }

    const snap = await getDocs(collection(db, 'products'));

    const matchedProducts: SuggestedProduct[] = snap.docs
  .filter((doc) => comboDocIds.includes(doc.id))
  .map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      thumbnail: data.thumbnail,
      price: data.price,
      comboProducts: data.comboProducts || [],
    };
  });

    setSuggested(matchedProducts);
  };

  loadCartAndSuggestions();
}, []);


useEffect(() => {
  const handleBackButton = (event: PopStateEvent) => {
    if (acceptedTerms) {
      event.preventDefault();
      setAcceptedTerms(false);

      // Push state again so user doesn't leave
      window.history.pushState(null, "", window.location.href);
    }
  };

  if (acceptedTerms) {
    // Push fake state when terms accepted
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBackButton);
  }

  return () => {
    window.removeEventListener("popstate", handleBackButton);
  };
}, [acceptedTerms]);

 const subtotal = cart.reduce((total, item) => {
  const base = item.price * item.quantity;

  const gift =
    item.giftPacking?.enabled && item.giftPacking?.charge
      ? item.giftPacking.charge * item.quantity
      : 0;

  return total + base + gift;
}, 0);
  const shortenName = (name: string) =>
    name.length > 15 ? name.slice(0, 15) + '...' : name;

  const shortenSmallName = (name: string) =>
    name.length > 10 ? name.slice(0, 10) + '...' : name;

 

useEffect(() => {
  if (!focusId) return;

  const focusKey = `${focusId}-${focusVariant || "default"}`;
  setActiveFocus(focusKey);

  const timer = setTimeout(() => {
    setActiveFocus(null);
  }, 1000); // 👈 disappears after 1 second

  return () => clearTimeout(timer);
}, [focusId, focusVariant]);

/* ================= REMOVE ITEM ================= */
const removeItem = (id: string, variantKey?: string) => {
  const updated = cart.filter(
    (item) =>
      !(
        item.id === id &&
        (item.variant?.key || "") === (variantKey || "")
      )
  );

  setCart(updated);
  saveCart(updated);

  //  Recalculate suggestions immediately
  setTimeout(() => {
    loadSuggestions();
  }, 0);
};


/* ================= HANDLE SLIDE ================= */
const handleSlide = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = Number(e.target.value);
  setSlideValue(value);

if (value >= 70) {
  router.push("/checkout");
  setSlideValue(90);
}
};
const resetSlider = () => {
  setTimeout(() => {
    setSlideValue(0);
  }, 150);
};

/* ================= UPDATE QUANTITY ================= */
const updateQuantity = (
  id: string,
  variantKey: string | undefined,
  amount: number
) => {
  const updated = updateCartQuantity(id, variantKey, amount);
  setCart(updated);

  //  Keep suggestions synced
  loadSuggestions();
};


/* ================= LOAD SUGGESTIONS ================= */
const loadSuggestions = async () => {
  const cartData = getCart();
  setCart(cartData);

  const comboDocIds: string[] = [];

  cartData.forEach((item: any) => {
    if (item.comboProducts && item.comboProducts.length > 0) {
      item.comboProducts.forEach((combo: any) => {
        if (!comboDocIds.includes(combo.id)) {
          comboDocIds.push(combo.id);
        }
      });
    }
  });

  if (comboDocIds.length === 0) {
    setSuggested([]);
    return;
  }

  const snap = await getDocs(collection(db, 'products'));

  const matchedProducts: SuggestedProduct[] = snap.docs
    .filter((doc) => comboDocIds.includes(doc.id))
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        thumbnail: data.thumbnail,
        price: data.price,
        comboProducts: data.comboProducts || [],
      };
    });

  setSuggested(matchedProducts);
};


/* ================= CART SUMMARY ================= */
const summary = cart.reduce(
  (acc, item) => {
    const quantity = item.quantity;

    const mrp =
      item.mrp && item.mrp > item.price
        ? item.mrp * quantity
        : item.price * quantity;

    const sale = item.price * quantity;

    const gift =
      item.giftPacking?.enabled && item.giftPacking?.charge
        ? item.giftPacking.charge * quantity
        : 0;

    acc.totalMrp += mrp;
    acc.totalSale += sale;
    acc.totalGift += gift;

    return acc;
  },
  {
    totalMrp: 0,
    totalSale: 0,
    totalGift: 0,
  }
);

const finalTotal = summary.totalSale + summary.totalGift;

  return (
    <main className="min-h-screen bg-[#f3f4f6] flex justify-center py-10 pb-40">
      <div className="w-[360px] rounded-3xl p-1">
{/* 🧺 PAGE HEADER */}
<div className="flex items-center gap-3 mb-6 px-2">

  {/* Basket Image */}
  <div className="  flex items-center justify-center">
    <img
      src="/empty-cart.png"   // change to your image path
      alt="My Basket"
      className="w-12 object-contain"
    />
  </div>

  {/* Title */}
  <div>
    <h1 className="text-lg font-bold text-gray-900">
      My Basket
    </h1>
    <p className="text-xs text-gray-500">
      {cart.length} item{cart.length !== 1 ? 's' : ''}
    </p>
  </div>

</div>
       
       {/* 🛒 CART LIST */}
<div className="space-y-4">

  {cart.length === 0 && (
   <div className="flex flex-col items-center justify-center py-24 mt-20">
  <img
    src="/empty-cart.png"
    alt="Empty Cart"
    className="w-[165] opacity-60 mb-10"
  />
  <h2 className="text-lg font-semibold text-gray-800">
    Your Basket is Empty
  </h2>
  <p className="text-sm text-gray-500 mt-2">
    Start shopping to add items to your basket.
  </p>
</div>
  )}

{cart.map((item) => {
  const focusKey = `${item.id}-${item.variant?.key || "default"}`;
  const isFocused = activeFocus === focusKey;

  return (
    <div
      key={focusKey}
      id={`cart-${focusKey}`}
      className={`
        rounded-xl p-3 transition-all duration-700 ease-in-out
        ${isFocused ? "ring-1 ring-[#005F5F] shadow-lg scale-[1.02]" : ""}
      `}
    >
        <div className="flex items-center gap-4 py-3">

        {/* PRODUCT IMAGE */}
        <div className="w-14 h-14 bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
          <img
            src={item.variant?.image || item.thumbnail}
            alt={item.name}
            className="w-10 h-10 object-contain"
          />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">

           {/* NAME + EXPAND */}
<div className="flex items-center gap-2">
  <h3 className="font-semibold text-gray-800 text-sm">
    {shortenName(item.name)}
  </h3>

  <button
    onClick={() =>
      setExpandedId(
        expandedId === focusKey ? null : focusKey
      )
    }
    className={`transition-transform duration-300 ${
      expandedId === focusKey ? 'rotate-180' : ''
    }`}
  >
    <ChevronDown size={16} />
  </button>
</div>

            {/* PRICE + REMOVE */}
           <div className="flex items-center gap-3">
  {(() => {
    const saleTotal = item.price * item.quantity;

    const mrpTotal =
      item.mrp && item.mrp > item.price
        ? item.mrp * item.quantity
        : null;

    const giftCharge =
      item.giftPacking?.enabled && item.giftPacking?.charge
        ? item.giftPacking.charge * item.quantity
        : 0;

    const finalTotal = saleTotal + giftCharge;

    return (
      <div className="text-right leading-tight">

        {/* MRP Cut */}
        {mrpTotal && (
          <p className="text-xs text-gray-400 line-through">
            ₹{mrpTotal}
          </p>
        )}

        {/* 🎁 Gift Packing (if enabled) */}
        {giftCharge > 0 && (
          <p className="text-xs text-gray-500 flex items-center justify-end gap-1">
            <Gift className="w-3 h-3 text-[#005F5F]" /> ₹{giftCharge}
          </p>
        )}

        {/* Final Sale Price */}
        <p className="text-sm font-semibold text-gray-800">
          ₹{finalTotal}
        </p>
      </div>
    );
  })()}

  {/* Delete Button */}
  <button
    onClick={() =>
  removeItem(item.id, item.variant?.key)
}
    className="text-red-500 hover:text-red-600 hover:scale-110 transition p-1"
    aria-label="Remove item"
  >
    <Trash2 size={18} />
  </button>
</div>
          </div>

          {/* VARIANT COLOR PREVIEW */}
       {item.variant && (
  <div className="mt-1 space-y-1 text-xs text-gray-500">

    {item.variant.color && (
      <div className="flex items-center gap-2">
        <span>Color:</span>
        <div
          className="w-3 h-3 rounded-full border"
          style={{ backgroundColor: item.variant.color }}
        />
      </div>
    )}

    {item.variant.size && (
      <div>
        <span>Size: {item.variant.size}</span>
      </div>
    )}

  </div>
)}

          {/* QUANTITY CONTROLS */}
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => {
  updateCartQuantity(
    item.id,
    item.variant?.key,
    -1
  );
  setCart(getCart());
}}
              className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded-md text-sm"
            >
              -
            </button>

            <span className="text-sm font-medium">
              {item.quantity}
            </span>

            <button
             onClick={() => {
  updateCartQuantity(
  item.id,
  item.variant?.key,   
  1
);
  setCart(getCart());
}}
              className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded-md text-sm"
            >
              +
            </button>
          </div>

         {(item.giftPacking?.charge ?? 0) > 0 && (
  <div className="mt-2 flex items-center gap-2">
    <input
      type="checkbox"
      checked={item.giftPacking?.enabled ?? false}
      onChange={(e) => {
        const updated: CartItem[] = cart.map((cartItem) => {
          const isSameItem =
            cartItem.id === item.id &&
            cartItem.variant?.key === item.variant?.key;

          if (!isSameItem) return cartItem;

          return {
            ...cartItem,
            giftPacking: {
              enabled: e.target.checked,
              charge: cartItem.giftPacking?.charge ?? 0, // always number
            },
          };
        });

        setCart(updated);
        saveCart(updated);
      }}
      className="w-3 h-3 cursor-pointer"
    />

    <label className="text-xs text-gray-600 cursor-pointer">
      Add Gift Packing (+₹{item.giftPacking?.charge ?? 0})
    </label>
  </div>
)}
        </div>
      </div>

      {/* EXPANDED DETAILS */}
      {expandedId === focusKey && (
        <div className="bg-white/60 rounded-xl p-3 mt-2 text-xs text-gray-600 space-y-2">
          <p><strong>Full Name:</strong> {item.name}</p>
          <p><strong>Quantity:</strong> {item.quantity}</p>
          <p><strong>Total:</strong> ₹{item.price * item.quantity}</p>
        </div>
      )}

      <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-80 rounded-full"></div>
    </div>
  );
})}
        </div>

        {/* 🔥 COMBO SUGGESTIONS */}
      {suggested.length > 0 && (
  <div className="mt-6">
    <h4 className="text-sm font-semibold text-gray-700 mb-3">
      You may also like
    </h4>

    <div className="flex gap-3 overflow-x-auto pb-2">
      {suggested.map((product) => (
        <div
          key={product.id}
          className="min-w-[85px] bg-white rounded-2xl p-3 shadow-sm text-center flex flex-col items-center"
        >
          <img
            src={product.thumbnail}
            alt={product.name}
            className="w-19 h-12 object-contain"
          />

          <p className="text-[9px] mt-2 text-gray-700 font-medium">
            {shortenSmallName(product.name)}
          </p>

          <button
            onClick={() => {
              addToCart({
                id: product.id,
                name: product.name,
                price: product.price || 0,
                thumbnail: product.thumbnail,
                quantity: 1,
                comboProducts: product.comboProducts || [],
              });

             
              setCart(getCart());
            }}
            className="mt-1 text-[12px] bg-[#005F5F] text-white px-3 py-1 rounded-full hover:scale-105 transition"
          >
            + Add
          </button>
        </div>
      ))}
    </div>
  </div>
)}

{/* 📜 FLOATING TERMS & CONDITIONS */}
{cart.length > 0 && (
  <div
    className={`fixed bottom-[55px] left-0 right-0 flex justify-center pb-6 z-50 transition-all duration-500 ease-in-out ${
      acceptedTerms
        ? "translate-y-24 opacity-0 pointer-events-none"
        : "translate-y-0 opacity-100"
    }`}
  >
    <div className="w-[360px] bg-white rounded-2xl p-4 shadow-xl border border-gray-200">

      <div className="flex items-start gap-2 ml-2">
        <input
          id="termsCheckbox"
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="mt-0.5 cursor-pointer"
        />

        <label
          htmlFor="termsCheckbox"
          className="text-xs text-gray-600 leading-relaxed cursor-pointer"
        >
          I agree to the{" "}
          <a
            href="/term"
            className="text-[#005F5F] font-semibold underline"
          >
            Terms & Conditions
          </a>
        </label>
      </div>

    </div>
  </div>
)}

      </div>

      

  {/* 💳 FLOATING CHECKOUT BAR */}
<div
  className={`fixed bottom-[55px] left-0 right-0 flex justify-center pb-6 z-50 transition-all duration-500 ease-in-out ${
    cart.length > 0 && acceptedTerms
      ? "translate-y-0 opacity-100"
      : "translate-y-24 opacity-0 pointer-events-none"
  }`}
>
  <div className="w-[360px] rounded-3xl p-5 backdrop-blur-xl bg-white/20 border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.15)] relative overflow-hidden">

    <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/10 pointer-events-none"></div>

    <div className="relative z-10">

      {/* TOTAL */}
     <div className="mb-4 space-y-1">

  {/* MRP CUT */}
  {summary.totalMrp > finalTotal && (
    <div className="flex justify-between items-center">
      <span className="text-xs text-gray-600">
        MRP
      </span>
      <span className="text-xs text-gray-400 line-through">
        ₹{summary.totalMrp}
      </span>
    </div>
  )}

  {/* Gift Summary */}
  {summary.totalGift > 0 && (
    <div className="flex justify-between items-center">
      <span className="text-xs text-gray-600">
        Gift Packing
      </span>
      <span className="text-xs text-gray-500 flex items-center gap-1">
        <Gift className="w-3 h-3 text-[#005F5F]" />
        ₹{summary.totalGift}
      </span>
    </div>
  )}

  {/* FINAL TOTAL */}
  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
    <span className="text-sm font-medium text-gray-700">
      Total
    </span>
    <span className="text-2xl font-bold text-gray-900">
      ₹{finalTotal}
    </span>
  </div>

</div>

      {/* SLIDER */}
      <div className="relative">
        <input
          type="range"
          min="0"
          max="100"
          value={slideValue}
          onChange={handleSlide}
           onMouseUp={resetSlider}
  onTouchEnd={resetSlider}
          className="custom-slider w-full h-14 rounded-full appearance-none bg-[#005F5F]/90 outline-none cursor-pointer"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none mb-1 text-[13px] text-white font-semibold tracking-wide">
          Proceed Now (items : {cart.length})
        </div>
      </div>

      {/* SMALL UNCHECK OPTION */}
      <div className="mt-3 flex items-center gap-2 justify-center">
        <input
          id="uncheckTerms"
          type="checkbox"
          checked={acceptedTerms}
          onChange={() => setAcceptedTerms(false)}
          className="w-3 h-3 cursor-pointer"
        />
        <label
          htmlFor="uncheckTerms"
          className="text-[12px] text-gray-700 cursor-pointer"
        >
          Terms Accepted (Click to uncheck)
        </label>
      </div>

    </div>
  </div>
</div>
    </main>
  );
}