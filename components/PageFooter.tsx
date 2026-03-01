'use client';

import Link from 'next/link';
import {
  FaYoutube,
  FaInstagram,
  FaWhatsapp,
  FaPhone,
  FaEnvelope,
  FaCode,
} from 'react-icons/fa';

export default function PageFooter() {
  return (
    <footer className="bg-[#005F5F] border-t border-white/20 mt-16 -mb-[40px]">
      <div className="max-w-xl px-6 py-14">

        <div className="grid md:grid-cols-4 gap-10">

          {/* Logo + About */}
          <div className="md:col-span-2">
            <img
              src="/logo-white.png"
              alt="FirstBell"
              className="h-10 w-auto mb-4"
            />

            <p className="text-xs ml-1 -mt-[10px] font-medium text-white/50">
              Akshya Nagar 1st Block 1st Cross, Rammurthy nagar, <br />
              Bangalore-560016
            </p>

            {/* Social Icons */}
            <div className="flex gap-[30px] mt-4 ml-2 text-[23px] text-white">
              <a href="#" className="hover:opacity-80 transition">
                <FaYoutube />
              </a>
              <a href="#" className="hover:opacity-80 transition">
                <FaInstagram />
              </a>
              <a href="#" className="hover:opacity-80 transition">
                <FaWhatsapp />
              </a>
            </div>
          </div>

          {/* Links + Contact */}
          <div className="flex flex-col items-start text-left">

            <ul className="space-y-3 -mt-[20px] ml-1.5 text-sm text-white/80">
              <li>
                <Link href="/about" className="hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/term" className="hover:text-white transition">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                
                  Careers
               
              </li>
            </ul>

            <div className="w-1/2 border-t border-white/20 my-5"></div>

            <div className="space-y-4 ml-1.5 text-sm text-white/80">
              <h3 className="text-white font-semibold tracking-wide">
                Contact Us
              </h3>

              <div className="flex items-center gap-3">
                <FaPhone className="text-white text-sm" />
                <a
                  href="tel:+919880098800"
                  className="hover:text-white transition"
                >
                  +91 98800 98800
                </a>
              </div>

              <div className="flex items-center gap-3">
                <FaEnvelope className="text-white text-sm" />
                <a
                  href="mailto:firstbell@store.com"
                  className="hover:text-white transition"
                >
                  firstbell@store.com
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Watermark (unchanged style) */}
        <div className="relative">
          <div className="logo-wrapper">
           <img
  src="/fristbell.png"
  alt="firstbell logo"
  className="logo-image pointer-events-none"
/>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="border-t border-white/20 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-white/70 gap-2">
          <p>
            © {new Date().getFullYear()} Firstbell. All Rights Reserved.
          </p>

         <a
  href="https://www.instagram.com/_shrfan/?hl=en"
  target="_blank"
  rel="noopener noreferrer"
  className="relative z-20 flex items-center gap-2 hover:text-white transition"
>
  <FaCode className="text-[12px]" />
  <span>Developed by Shirfan</span>
</a>
        </div>

      </div>
    </footer>
  );
}