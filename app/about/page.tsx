'use client';

import PageFooter from '@/components/PageFooter';


export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      

      {/* Hero Section */}
    <section className="relative bg-gradient-to-r from-[#005F5F] to-[#004545] text-white py-16 px-6 overflow-hidden">
  
  {/* Background Image */}
  <img
    src="/smile.png"
    alt=""
   className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 "
  />

  {/* Content */}
  <div className="relative z-10 max-w-4xl mx-auto text-center">
    <h1 className="text-3xl md:text-4xl font-bold">
      About Me
    </h1>
    <p className="mt-3 text-white/80 tracking-wide">
      Play • Fun • Learn
    </p>
  </div>

</section>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto px-6 py-14 space-y-8 text-gray-700 leading-relaxed">

        <p>
          <strong>Firstbell</strong> is more than just a shop  it is a place where fun and learning come together beautifully. Our mission is to serve families, children, students, and professionals by offering thoughtfully selected products that bring convenience, creativity, and joy into everyday life.
        </p>

        <p>
          At our physical store, you can explore a wide collection of toys, academic stationery, school essentials, office accessories, gift items, celebration and party decorations, newborn accessories, and carefully chosen products to support moms and their daily needs.
        </p>

        <p>
          From a baby’s first essentials to a student’s learning tools, from office requirements to special celebration moments — Firstbell is here for every stage and every occasion.
        </p>

        <p>
          Every product we choose reflects our strong commitment to quality, safety, and affordability. We believe the right product can spark imagination, support growth, simplify daily tasks, and create meaningful memories.
        </p>

        {/* Motto Highlight */}
       <div className="relative bg-gray-50 border-l-4 border-[#005F5F] p-6 rounded-md overflow-hidden">
  
  <img
    src="/smile.png"
    alt=""
    className="absolute right-4 bottom-4 w-24 opacity-10"
  />

  <p className="relative text-lg font-semibold text-[#005F5F]">
    “Be the Reason for a Smile.”
  </p>

</div>

        <p>
          In addition to our physical store, Firstbell also brings the same care and quality to our online shopping platform  making it easier for you to shop your favorite products anytime, anywhere.
        </p>

        <p>
          Whether it’s a child opening a new toy with excitement, a student starting a fresh notebook with new dreams, a mother finding the perfect item for her little one, or someone discovering decorations that make a celebration special — Firstbell is here to create moments that truly matter, both in-store and online.
        </p>

      </section>

      <PageFooter />
    </main>
  );
}