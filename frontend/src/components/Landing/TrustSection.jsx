import React from 'react';

const PARTNERS = [
  {
    icon: 'verified',
    name: 'NCW India',
    description: 'National Commission for Women',
  },
  {
    icon: 'verified_user',
    name: 'iSafe Network',
    description: 'Certified Safety Platform',
  },
  {
    icon: 'emergency',
    name: '112 India',
    description: 'Integrated Emergency Response',
  },
  {
    icon: 'lock',
    name: 'Data Secure',
    description: 'ISO 27001 Certified',
  },
];

export default function TrustSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        {/* Top strip */}
        <p className="font-label text-[11px] uppercase tracking-[0.25em] text-[#8d9d4f]/50 text-center mb-16 font-semibold">
          Featured In / Partnered With
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-start">
          {/* Left side — Quote block (3 of 5 cols) */}
          <div className="lg:col-span-3">
            <div className="relative p-8 md:p-10 rounded-2xl bg-[#f5f0e0]/60 border border-[#8d9d4f]/8">
              <span className="material-symbols-outlined text-6xl text-[#8d9d4f]/15 absolute top-4 left-6 select-none">
                format_quote
              </span>
              <blockquote className="relative z-10 pt-6">
                <p className="font-headline text-2xl lg:text-3xl font-bold text-[#2c2a1e] leading-snug mb-6">
                  "Nirbhaya represents the kind of grassroots innovation
                  that makes our cities safer for every woman."
                </p>
                <footer className="font-label text-sm text-[#8d9d4f] font-semibold">
                  — National Commission for Women, India
                </footer>
              </blockquote>
            </div>
          </div>

          {/* Right side — Trust badges (2 of 5 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {PARTNERS.map((p, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-[#f5f0e0] transition-all duration-300 group"
              >
                <div className="w-11 h-11 rounded-full bg-[#f5f0e0] group-hover:bg-white flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                  <span className="material-symbols-outlined text-xl text-[#8d9d4f]">
                    {p.icon}
                  </span>
                </div>
                <div>
                  <h4 className="font-label text-sm font-bold text-[#2c2a1e]">
                    {p.name}
                  </h4>
                  <p className="font-body text-xs text-[#3a3520]/50">
                    {p.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
