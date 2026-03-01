'use client';


import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  CreditCard, Smartphone, Truck, 
  ShieldCheck, Check, ChevronLeft, Lock 
} from "lucide-react";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const totalAmount = Number(searchParams.get("total")) || 0;
  const userPincode = searchParams.get("pincode") || "";
  const insideCirclePincodes = ["676306", "676304", "676303"];
  const isCodAvailable = insideCirclePincodes.includes(userPincode);

  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    { id: "upi", title: "UPI", subtitle: "GPay, PhonePe, UPI ID", icon: Smartphone, disabled: false },
    { id: "card", title: "Cards", subtitle: "Visa, Mastercard, RuPay", icon: CreditCard, disabled: false },
    { id: "cod", title: "Cash on Delivery", subtitle: isCodAvailable ? "Pay at your doorstep" : "Not available for " + userPincode, icon: Truck, disabled: !isCodAvailable },
  ];

useEffect(() => {
  document.body.style.overflow = "hidden";

  return () => {
    document.body.style.overflow = "auto";
  };
}, []);

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => router.replace("/success"), 2000);
  };



  return (
    <main className="min-h-screen bg-white text-black font-sans antialiased">
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-6 py-5">
        <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-1.5 text-gray-400">
          <Lock className="w-3.5 h-3.5" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Secure Checkout</span>
        </div>
        <div className="w-10"></div>
      </nav>

      <div className="max-w-md mx-auto px-6 pb-20">
        {/* HERO AMOUNT */}
        <header className="py-10 text-center space-y-2">
          <p className="text-gray-500 text-sm font-medium">Amount to Pay</p>
          <h1 className="text-5xl font-black tracking-tighter text-[#005F5F]">
            ₹{totalAmount.toLocaleString('en-IN')}
          </h1>
        </header>

        {/* METHODS GRID */}
        <section className="space-y-3">
          <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Payment Method</h2>
          
          <div className="grid gap-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isActive = selectedMethod === method.id;

              return (
                <button
                  key={method.id}
                  disabled={method.disabled}
                  onClick={() => !method.disabled && setSelectedMethod(method.id)}
                  className={`relative flex items-center justify-between p-5 rounded-[24px] border-2 transition-all duration-500 overflow-hidden ${
                    method.disabled 
                      ? "opacity-40 grayscale pointer-events-none" 
                      : isActive 
                        ? "border-[#005F5F] bg-[#005F5F]/[0.02]" 
                        : "border-gray-100 bg-gray-50/50 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-500 ${
                      isActive ? "bg-[#005F5F] text-white shadow-lg shadow-[#005F5F]/30" : "bg-white text-gray-400 shadow-sm"
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className={`font-bold text-sm ${isActive ? "text-gray-900" : "text-gray-500"}`}>{method.title}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{method.subtitle}</p>
                    </div>
                  </div>
                  
                  {isActive && (
                    <div className="w-6 h-6 rounded-full bg-[#005F5F] flex items-center justify-center animate-in zoom-in-50 duration-300">
                      <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* INFO BOX & CTA */}
        <footer className="mt-12 space-y-8">
          <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-[24px]">
            <div className="mt-0.5">
              <ShieldCheck className="w-5 h-5 text-[#005F5F]" />
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Payments are processed through 128-bit SSL encryption. FirstBell does not store your card details.
            </p>
          </div>

          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="group relative w-full overflow-hidden rounded-[24px] bg-[#005F5F] py-5 text-white shadow-2xl shadow-[#005F5F]/30 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-70"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-sm font-bold uppercase tracking-widest">Processing</span>
              </div>
            ) : (
              <span className="text-sm font-bold uppercase tracking-widest">
                Confirm & Pay ₹{totalAmount}
              </span>
            )}
          </button>
        </footer>
      </div>
    </main>
  );
}