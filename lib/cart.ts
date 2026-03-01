export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  thumbnail: string;
  deliveryDays?: number;
  mrp?: number;

  variant?: {
    key?: string;   // 🔥 MASTER VARIANT IDENTIFIER
    color?: string;
    size?: string;
    image?: string;
  };

  comboProducts?: {
    id: string;
    name?: string;
  }[];

  giftPacking?: {
    enabled: boolean;
    charge: number;
  };
}

const CART_KEY = "firstbell_cart";

/* ===========================
   STORAGE CHECK
=========================== */
function isStorageAvailable(): boolean {
  try {
    if (typeof window === "undefined") return false;

    const testKey = "__storage_test__";
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/* ===========================
   DISPATCH EVENT
=========================== */
function dispatchCartEvent() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cartUpdated"));
  }
}

/* ===========================
   GET CART
=========================== */
export function getCart(): CartItem[] {
  if (!isStorageAvailable()) return [];

  try {
    const stored = window.localStorage.getItem(CART_KEY);
    return stored ? (JSON.parse(stored) as CartItem[]) : [];
  } catch (error) {
    console.warn("Cart read failed:", error);
    return [];
  }
}

/* ===========================
   SAVE CART
=========================== */
export function saveCart(cart: CartItem[]): void {
  if (!isStorageAvailable()) return;

  try {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    dispatchCartEvent();
  } catch (error) {
    console.warn("Cart save failed:", error);
  }
}

/* ===========================
   ADD TO CART
=========================== */
export function addToCart(item: CartItem): void {
  const cart = getCart();

  const existingIndex = cart.findIndex(
    (i) =>
      i.id === item.id &&
      (i.variant?.key || "") === (item.variant?.key || "")
  );

  if (existingIndex > -1) {
    // Increase quantity
    cart[existingIndex].quantity += item.quantity;

    // Preserve combo products
    cart[existingIndex].comboProducts =
      item.comboProducts ||
      cart[existingIndex].comboProducts ||
      [];

    // Preserve gift packing state
    if (item.giftPacking) {
      cart[existingIndex].giftPacking = {
        enabled:
          cart[existingIndex].giftPacking?.enabled ?? false,
        charge: item.giftPacking.charge,
      };
    }

    // Preserve delivery days
    if (item.deliveryDays) {
      cart[existingIndex].deliveryDays = item.deliveryDays;
    }

  } else {
    cart.push({
      ...item,
      comboProducts: item.comboProducts || [],
      giftPacking: item.giftPacking
        ? {
            enabled: item.giftPacking.enabled,
            charge: item.giftPacking.charge,
          }
        : undefined,
    });
  }

  saveCart(cart);
}

/* ===========================
   UPDATE QUANTITY
=========================== */
export function updateCartQuantity(
  id: string,
  variantKey: string | undefined,
  amount: number
): CartItem[] {
  const cart = getCart();

  const updated: CartItem[] = cart
    .map((item) => {
      const isSameItem =
        item.id === id &&
        (item.variant?.key || "") === (variantKey || "");

      if (!isSameItem) return item;

      const newQuantity = item.quantity + amount;

      if (newQuantity <= 0) return null;

      return {
        ...item,
        quantity: newQuantity,
      };
    })
    .filter((item): item is CartItem => item !== null);

  saveCart(updated);
  return updated;
}

/* ===========================
   REMOVE ITEM
=========================== */
export function removeCartItem(
  id: string,
  variantKey: string | undefined
): void {
  const cart = getCart();

  const filtered = cart.filter(
    (item) =>
      !(
        item.id === id &&
        (item.variant?.key || "") === (variantKey || "")
      )
  );

  saveCart(filtered);
}

/* ===========================
   CLEAR CART
=========================== */
export function clearCart(): void {
  if (!isStorageAvailable()) return;

  try {
    window.localStorage.removeItem(CART_KEY);
    dispatchCartEvent();
  } catch (error) {
    console.warn("Cart clear failed:", error);
  }
}