'use client';

import PageFooter from '@/components/PageFooter';
import { MobileHeader } from '@/components/MobileHeader';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white relative">
    

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#005F5F] to-[#004545] text-white py-16 px-6 overflow-hidden text-center">
        
        {/* Smile Background */}
        <img
          src="/smile.png"
          alt=""
          className="absolute top-1/2 left-1/2 w-80  -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        />

        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Terms & Conditions
          </h1>
          <p className="mt-3 text-white/80 text-sm">
            Firstbell.in
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-gray-700 leading-8 text-[15px]">

        <p className="mb-12 text-gray-600">
          By accessing, browsing, registering, or placing an order on
          Firstbell’s website, mobile platform, or any official online
          channel, you agree to comply with and be legally bound by the
          following Terms & Conditions.
        </p>

        {[
          {
            title: "GENERAL TERMS",
            content: `
Firstbell reserves the right to update, modify, revise, or replace these Terms & Conditions at any time without prior notice.

Continued use of the platform after any changes constitutes acceptance of the updated Terms.

All products and services are subject to availability.

Firstbell reserves the right to refuse service to anyone for any lawful reason at any time.
            `
          },
          {
            title: "ONLINE STORE OPERATIONS",
            content: `
The operation of the online platform depends on working hours, stock availability, staffing, logistics, and technical capabilities.

Order processing time and delivery timelines may vary.

Firstbell reserves the right to modify, suspend, discontinue, or restrict any part of the services without prior notice.
            `
          },
          {
            title: "PRODUCT INFORMATION & IMAGES",
            content: `
Product images displayed on the website or social media are for illustration purposes only.

Actual product color, size, packaging, or design may vary.

Minor typographical errors or pricing inaccuracies may occur and can be corrected without prior notice.
            `
          },
          {
            title: "STOCK AVAILABILITY",
            content: `
All products are subject to stock availability.

Orders are confirmed only after stock verification.

If a product becomes unavailable, customers will be informed and offered a full refund or an alternative product.
            `
          },
          {
            title: "PRICING & PAYMENT",
            content: `
Prices are subject to change without prior notice.

Payment must be completed using approved methods.

Cash on Delivery is available only for selected products and service locations.

Orders may be cancelled due to pricing errors, payment failure, suspected fraud, or unauthorized transactions.

Refund timelines depend on the respective payment provider or bank.
            `
          },
          {
            title: "3-HOUR DELIVERY SERVICE",
            content: `
The 3-Hour Delivery refers to the estimated fastest delivery time under normal conditions.

This is not a guaranteed timeframe.

Delivery time may vary due to order time, stock availability, traffic, weather, public holidays, operational limitations, or force majeure events.

The service is available only in selected locations.

Firstbell shall not be liable for delivery delays beyond reasonable control.
            `
          },
          {
            title: "RETURN & REFUND POLICY",
            content: `
Return requests must be made within 24 hours of receiving the product.

Products must be unused, undamaged, in original packaging, with proof of purchase, and in resalable condition.

Non-returnable items include opened stationery, used toys, innerwear, customized products, promotional items, clearance products, and products not in resalable condition.

Delivery and return shipping charges may be deducted from refunds.
            `
          },
          {
            title: "CANCELLATION POLICY",
            content: `
Orders may be cancelled before dispatch without charges.

Orders cannot be cancelled once dispatched.

3-Hour Delivery and customized orders cannot be cancelled once processed.

Firstbell reserves the right to cancel orders due to stock issues, pricing errors, fraud suspicion, payment problems, or operational constraints.
            `
          },
          {
            title: "WARRANTY & GUARANTEE",
            content: `
Certain products may carry manufacturer warranty.

Firstbell acts only as a reseller and is not responsible for delays in manufacturer service procedures.

Customers must retain invoice and warranty documentation.
            `
          },
          {
            title: "PRIVACY & DATA PROTECTION",
            content: `
Customer information such as name, contact number, and location will be kept secure and confidential.

Data will be used only for order processing, delivery coordination, and Firstbell promotional communication.

We do not sell or share customer information with unauthorized third parties.
            `
          },
          {
            title: "LIMITATION OF LIABILITY",
            content: `
Firstbell shall not be liable for indirect, incidental, or consequential damages arising from the use of the platform or products.

We are not responsible for delays caused by natural disasters, transportation disruptions, technical failures, government restrictions, or force majeure events.
            `
          },
          {
            title: "GOVERNING LAW",
            content: `
These Terms & Conditions shall be governed by the laws of India.

Any disputes shall be subject to the jurisdiction of the appropriate courts in Kerala.
            `
          }
        ].map((section, index) => (
          <div key={index} className="mb-14">
            <h2 className="text-lg font-semibold text-gray-900 border-l-4 border-[#005F5F] pl-4 mb-5">
              {section.title}
            </h2>
            <div className="whitespace-pre-line text-gray-600">
              {section.content}
            </div>
          </div>
        ))}

      </section>

      <PageFooter />
    </main>
  );
}