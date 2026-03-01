'use client';

import {
  ShieldCheck,
  Headphones,
  Truck,
  CreditCard,
  Clock,
  RotateCcw,
} from 'lucide-react';

export function TrustFeatures() {
  const features = [
    { icon: ShieldCheck, title: '100% Safe & Secure Payment' },
    { icon: Headphones, title: 'Responsive Customer Support' },
    { icon: Truck, title: 'Door to Door Delivery Service' },
    { icon: CreditCard, title: 'Cash on Delivery Available' },
    { icon: Clock, title: '3 Hour Delivery Available' },
    { icon: RotateCcw, title: 'Easy Return Policy' },
  ];

  // duplicate for seamless infinite scroll
  const slidingFeatures = [...features, ...features];

  return (
    <section className=" py-2 -mb-[60px] overflow-hidden">

      <div className="relative">

        {/* Sliding Track */}
        <div className="flex gap-2 animate-trustSlide w-max">

          {slidingFeatures.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={index}
                className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm min-w-[160px]"
              >
                <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#005F5F]/10">
                  <Icon className="w-4 h-4 text-[#005F5F]" />
                </div>

                <p className="text-[9px] font-medium text-gray-700 whitespace-nowrap">
                  {feature.title}
                </p>
              </div>
            );
          })}

        </div>

      </div>

      {/* Terms */}
      <p className="text-right text-[8px] text-gray-400 mt-2 tracking-wide">
        *All terms & conditions apply.
      </p>

        {/* Micro-Disclaimer */}
      <div className="px-5 mt-2 flex justify-between items-center opacity-60">
        <span className="h-[1px] flex-1 bg-gray-200"></span>
        <p className="text-[7px] font-semibold text-gray-400 uppercase tracking-[0.2em] px-3">
          Trusted Services
        </p>
        <span className="h-[1px] flex-1 bg-gray-200"></span>
      </div>

      {/* Animation */}
      <style jsx global>{`
        @keyframes trustSlide {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-trustSlide {
          animation: trustSlide 20s linear infinite;
        }
      `}</style>
    </section>
  );
}