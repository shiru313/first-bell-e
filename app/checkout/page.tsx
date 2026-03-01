'use client';

import { useEffect, useState } from "react";
import { getCart, CartItem } from "@/lib/cart";
import { getFromCache, saveToCache } from "@/lib/cache";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Check, X, Smartphone, ShieldCheck, MapPin } from "lucide-react";



declare global {
  interface Window {
  
  }
}

interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  pincode: string;
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isBillExpanded, setIsBillExpanded] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [slideValue, setSlideValue] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
const [shake, setShake] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string>("");
const [isSending, setIsSending] = useState(false);
  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", ""]);
  const [showOtp, setShowOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
 

  const [newAddr, setNewAddr] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    pincode: ""
  });

  const router = useRouter();

  

  /* ---------------- INIT ---------------- */

  useEffect(() => {
    setCart(getCart());
    const cached = getFromCache<Address[]>("saved_addresses") || [];
    setAddresses(cached);
    if (cached.length > 0) setSelectedAddressId(cached[0].id);
  }, []);



  /* ---------------- DELIVERY ---------------- */

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

  const insideCirclePincodes = ["676306", "676304", "676303"];

  const deliveryCharge = selectedAddress
    ? insideCirclePincodes.includes(selectedAddress.pincode)
      ? 20
      : 50
    : 0;

  const summary = cart.reduce(
    (acc, item) => {
      acc.totalPrice += item.price * item.quantity;
      acc.totalGift += item.giftPacking?.enabled
        ? item.giftPacking.charge * item.quantity
        : 0;
      return acc;
    },
    { totalPrice: 0, totalGift: 0 }
  );

  const finalTotal =
    summary.totalPrice + summary.totalGift + deliveryCharge;

  /* ---------------- ADDRESS SAVE ---------------- */
const triggerError = (message: string) => {
  setErrorMessage(message.toUpperCase());
  setShake(true);

  setTimeout(() => {
    setShake(false);
  }, 400);

  setTimeout(() => {
    setErrorMessage("");
  }, 2500);
};
  const handleSaveAddress = () => {
    if (!newAddr.fullName || newAddr.pincode.length !== 6) {
      alert("Please enter full name and valid 6-digit Pincode");
      return;
    }

    const updated = [
      ...addresses,
      { ...newAddr, id: Date.now().toString() }
    ];

    setAddresses(updated);
    saveToCache("saved_addresses", updated);
    setSelectedAddressId(updated[updated.length - 1].id);
    setShowAddressForm(false);

    setNewAddr({
      fullName: "",
      phone: "",
      street: "",
      city: "",
      pincode: ""
    });
  };
 /* ---------------- otp handle  ---------------- */

const handleOtpChange = (value: string, index: number) => {
  if (!/^\d?$/.test(value)) return;

  const updated = [...otpValues];
  updated[index] = value;
  setOtpValues(updated);

  if (value && index < 3) {
    const next = document.getElementById(`otp-${index + 1}`);
    next?.focus();
  }
};

const handleOtpKeyDown = (
  e: React.KeyboardEvent<HTMLInputElement>,
  index: number
) => {
  if (e.key === "Backspace" && !otpValues[index] && index > 0) {
    const prev = document.getElementById(`otp-${index - 1}`);
    prev?.focus();
  }
};

const getOtpValue = () => otpValues.join("");

  /* ---------------- SLIDER FLOW ---------------- */

const handleSlide = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const val = parseInt(e.target.value);
  setSlideValue(val);

  if (val !== 100) return;

  if (!showOtp) {
    if (phoneNumber.length !== 10) {
     triggerError("Enter valid mobile number");
      setSlideValue(0);
      return;
    }

    try {
      setIsSending(true);

      const otpCode = Math.floor(
  1000 + Math.random() * 9000
).toString();
      setGeneratedOtp(otpCode);

    const customerName =
  selectedAddress?.fullName?.split(" ")[0] || "Customer";

const message = `Hi ${customerName}! Use OTP ${otpCode} to confirm your FirstBell order. Fast processing starts right away! `;

      await fetch(
        `https://trigger.macrodroid.com/3f355c84-8984-4181-a7e2-33d4a66e711b/timetracker?number=${phoneNumber}&message=${encodeURIComponent(message)}`
      );

      setShowOtp(true);
setSlideValue(0);
setCountdown(40);

      

    } catch (error) {
      triggerError("Failed to send OTP");
      setSlideValue(0);
    } finally {
      setIsSending(false);
    }

  } else {

    if (getOtpValue().length !== 4){
      triggerError("Enter valid OTP");

      setSlideValue(0);
      return;
    }

   if (getOtpValue() === generatedOtp){
  setIsVerified(true);
  setSlideValue(0);

  // Small delay for smooth UX
  setTimeout(() => {
    router.push(`/payment?total=${finalTotal}&pincode=${selectedAddress?.pincode}`);
  }, 800);
} else {
     triggerError("Invalid OTP");
      setSlideValue(0);
    }
    
  }
  
};
const resetSlider = () => {
  setTimeout(() => {
    setSlideValue(0);
  }, 150);
};

useEffect(() => {
  document.body.style.overflow = "hidden";

  return () => {
    document.body.style.overflow = "auto";
  };
}, []);

useEffect(() => {
  if (countdown <= 0) return;

  const timer = setTimeout(() => {
    setCountdown((prev) => prev - 1);
  }, 1000);

  return () => clearTimeout(timer);
}, [countdown]);

const handleResendOtp = async () => {
  if (countdown > 0) return;

  try {
    const otpCode = Math.floor(
      1000 + Math.random() * 9000
    ).toString();

    setGeneratedOtp(otpCode);

    const customerName =
      selectedAddress?.fullName?.split(" ")[0] || "Customer";

    const message = `Hi ${customerName}! Use OTP ${otpCode} to confirm your FirstBell order.`;

    await fetch(
      `https://trigger.macrodroid.com/3f355c84-8984-4181-a7e2-33d4a66e711b/timetracker?number=${phoneNumber}&message=${encodeURIComponent(message)}`
    );

    setCountdown(40);
  } catch {
    triggerError("Failed to resend OTP");
  }
};
  /* ---------------- UI ---------------- */

  return (
    <main className="min-h-screen bg-[#F5F5F7] pb-44 font-sans antialiased">
    

      <div className="p-6 pb-2">
        <h1 className="text-[19px] font-bold text-black tracking-tight">
          Checkout
        </h1>
      </div>

      <div className="px-4 space-y-6">

        {/* BILL */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
          <button
            onClick={() => setIsBillExpanded(!isBillExpanded)}
            className="w-full flex justify-between items-center"
          >
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                Total Payable
              </p>
              <p className="text-2xl font-black text-gray-900">
                ₹{finalTotal}
              </p>
            </div>
            <div className={`p-2 rounded-full transition-transform ${isBillExpanded ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}>
              {isBillExpanded ? <ChevronUp /> : <ChevronDown />}
            </div>
          </button>

          {isBillExpanded && (
            <div className="mt-5 pt-5 border-t border-dashed border-gray-200 space-y-4">
              {cart.map((item, index) => {
                const name =
                  item.name.length > 19
                    ? item.name.slice(0, 19) + ".........."
                    : item.name;

                return (
                  <div key={item.id} className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <div>
                        <p className="font-medium text-gray-800">
                          {name}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          Qty × {item.quantity}
                        </p>
                      </div>
                      <span className="font-mono">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>

                    {index !== cart.length - 1 && (
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                    )}
                  </div>
                );
              })}

              <div className="pt-4 mt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm font-semibold text-[#005F5F]">
                  <span>Delivery Charge</span>
                  <span>₹{deliveryCharge}</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  *Charge may change based on your delivery address
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ADDRESS SECTION */}
<div className="space-y-5">
  <div className="flex justify-between items-end px-2">
    <div>
      <h3 className="text-ls font-bold text-gray-900">Delivery to</h3>
      <p className="text-xs text-gray-400">
        Select an address to continue
      </p>
    </div>
    <button
      onClick={() => setShowAddressForm(true)}
      className="bg-[#005F5F] text-white px-4 py-2 rounded-full text-xs font-bold shadow-md"
    >
      + New
    </button>
  </div>

  <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide px-2 items-center">
    {addresses.map((addr) => (
      <div
        key={addr.id}
        onClick={() => setSelectedAddressId(addr.id)}
        className={`min-w-[220px] p-3 rounded-[1.2rem] border-[1.08px] transition-all duration-300 relative ${
          selectedAddressId === addr.id
            ? "border-[#005F5F]"
            : "border-transparent bg-gray-200/40 opacity-70"
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Check
              className={`w-4 h-4 ${
                selectedAddressId === addr.id
                  ? "text-[#005F5F]"
                  : "text-transparent"
              }`}
            />
          </div>
          <p className="text-[10px] font-bold text-[#005F5F] bg-[#005F5F]/10 px-2 py-1 rounded-md">
            {addr.pincode}
          </p>
        </div>
        <p className="font-bold text-gray-900 truncate">
          {addr.fullName}
        </p>
        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
          {addr.street}
        </p>
      </div>
    ))}
  </div>

  {/* DELIVERY LABEL */}
  {selectedAddress && (
    <div className="mx-2 p-4 bg-[#005F5F]/5 rounded-2xl border border-[#005F5F]/10 flex items-center gap-3 animate-in fade-in zoom-in-95">
      <div className="bg-[#005F5F] p-2 rounded-full">
        <MapPin className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-gray-400 leading-none">
          Shipping for {selectedAddress.pincode}
        </p>
        <p className="text-sm font-bold text-[#005F5F]">
          Delivery Charge added: ₹{deliveryCharge}
        </p>
      </div>
    </div>
  )}
</div>

      {/* VERIFIED BOX */}
{isVerified && (
  <div className="p-8 text-center space-y-6 flex flex-col items-center">

    <h2 className="text-lg font-semibold text-[#005F5F]">
      Verifying your order...
    </h2>

    <div className="loader"></div>

    <p className="text-sm text-gray-500">
      Please wait while we process your request
    </p>

  </div>
)}
      </div>

      {showAddressForm && (
  <div className="fixed inset-0 z-[100] flex items-end justify-center">

    {/* BACKGROUND IMAGE */}
    <div
      className="absolute inset-0 bg-cover bg-center"
     
    />

    {/* DARK OVERLAY */}
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

    {/* MODAL */}
    <div className="relative bg-white w-full max-w-md rounded-t-[40px] p-8 space-y-4 animate-in slide-in-from-bottom-full duration-300"
     
>

      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-gray-900">New Address</h2>
        <button
          onClick={() => setShowAddressForm(false)}
          className="bg-gray-100 p-2 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <input
        placeholder="Full Name"
        className="w-full p-4 bg-gray-100 rounded-2xl outline-none text-sm font-medium"
        value={newAddr.fullName}
        onChange={(e) =>
          setNewAddr({ ...newAddr, fullName: e.target.value })
        }
      />

      <input
        placeholder="Street / House Name"
        className="w-full p-4 bg-gray-100 rounded-2xl outline-none text-sm font-medium"
        value={newAddr.street}
        onChange={(e) =>
          setNewAddr({ ...newAddr, street: e.target.value })
        }
      />

      <div className="flex gap-2">
        <input
          placeholder="City"
          className="w-1/2 p-4 bg-gray-100 rounded-2xl outline-none text-sm font-medium"
          value={newAddr.city}
          onChange={(e) =>
            setNewAddr({ ...newAddr, city: e.target.value })
          }
        />
        <input
          placeholder="Pincode"
          type="number"
          className="w-1/2 p-4 bg-gray-100 rounded-2xl outline-none text-sm font-medium"
          value={newAddr.pincode}
          onChange={(e) =>
            setNewAddr({
              ...newAddr,
              pincode: e.target.value.slice(0, 6),
            })
          }
        />
      </div>

      <button
        onClick={handleSaveAddress}
        className="w-full py-4 bg-[#005F5F] text-white rounded-2xl font-bold shadow-lg"
      >
        Save & Continue
      </button>
    </div>
  </div>
)}

      {/* FLOATING BAR */}
      {selectedAddressId && !isVerified && (
        <div className="fixed bottom-[1px] left-0 right-0 flex justify-center pb-6 z-50">
          <div className="w-[360px] rounded-[2.5rem] p-6 backdrop-blur-2xl bg-white/40 border border-white/50 shadow-2xl space-y-4">

            <div className={`relative flex items-center bg-white/80 rounded-2xl p-1 border border-white/20 transition-all ${
  shake ? "animate-shake" : ""
}`}>
              {!showOtp ? (
                <>
                  <div className="pl-4 pr-2 text-gray-400">
                    <Smartphone />
                  </div>
                  <input
                    type="tel"
                    placeholder="Enter Mobile Number"
                    value={phoneNumber}
                    onChange={(e) =>
                      setPhoneNumber(
                        e.target.value.replace(/\D/g, "").slice(0, 10)
                      )
                    }
                    className="w-full bg-transparent py-3 text-sm font-bold outline-none"
                  />
                </>
              ) : (
                <div className="flex justify-center gap-3 w-full py-2">
  {otpValues.map((digit, index) => (
    <input
      key={index}
      id={`otp-${index}`}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={digit}
      onChange={(e) =>
        handleOtpChange(e.target.value, index)
      }
      onKeyDown={(e) =>
        handleOtpKeyDown(e, index)
      }
      className="w-12 h-12 text-center text-lg font-bold rounded-xl bg-white border border-gray-300 outline-none focus:border-[#005F5F] focus:ring-2 focus:ring-[#005F5F]/20 transition-all"
    />
  ))}
</div>
              )}
              
            </div>
{errorMessage && (
  <p className="text-xs text-red-500 font-bold text-center tracking-widest mt-2 animate-in fade-in">
    {errorMessage}
  </p>
)}
            <div className="relative">
              <input
  type="range"
  min="0"
  max="100"
  value={slideValue}
  onChange={handleSlide}
  onMouseUp={resetSlider}
  onTouchEnd={resetSlider}
  className="custom-slider w-full h-14 rounded-full appearance-none bg-[#005F5F] outline-none cursor-pointer transition-all duration-300"
/>
              <div className="absolute mb-2 inset-0 flex items-center justify-center text-xs text-white font-bold uppercase tracking-widest pointer-events-none">
                {!showOtp
                  ? "Slide to Send OTP"
                  : "Slide to Verify OTP"}
              </div>
              {showOtp && (
  <div className="text-center mt-2">
    {countdown > 0 ? (
      <p className="text-xs text-gray-400 font-bold tracking-widest">
        RESEND OTP IN {countdown}s
      </p>
    ) : (
      <button
        onClick={handleResendOtp}
        className="text-xs font-bold text-[#005F5F] tracking-widest"
      >
        RESEND OTP
      </button>
    )}
  </div>
)}
            </div>

          </div>
        </div>
      )}
    </main>
  );
}