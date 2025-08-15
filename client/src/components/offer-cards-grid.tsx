"use client";

import React from "react";
import { OfferCard } from "@/components/ui/offer-card";
import { SandraImages } from "@/lib/sandra-images";

const offers = [
  {
    number: "01",
    title: "SSELFIE AI Images",
    price: "€67 one-time",
    description: "Upload 10-15 selfies, get 30 luxury AI images back. No studio needed - just your FLUX-trained AI doing the magic.",
    imageSrc: SandraImages.editorial.phone1,
    imageAlt: "Sandra with camera - AI Images",
    ctaText: "Try It Now",
    ctaHref: "/ai-images",
    badge: "SSELFIE AI"
  },
  {
    number: "02",
    title: "SSELFIE Studio",
    price: "€67/month",
    description: "Everything you need to build your personal brand in 20 minutes. AI images, luxury templates, instant setup.",
    imageSrc: SandraImages.editorial.laptop1,
    imageAlt: "Sandra in studio",
    ctaText: "Start Today",
    ctaHref: "/studio",
    badge: "Founding Member"
  },
  {
    number: "03",
    title: "SSELFIE Studio",
    price: "€67/month",
    description: "Full platform access. For when you're ready to show up, get seen, and finally get paid for being you.",
    imageSrc: SandraImages.editorial.mirror,
    imageAlt: "Sandra portrait",
    ctaText: "Get Started",
    ctaHref: "/studio-standard",
    badge: "Standard"
  }
];

const OfferCardsGrid: React.FC = () => (
  <section className="py-20 md:py-32 bg-[#F1F1F1]">
    <div className="max-w-5xl mx-auto px-6 md:px-8 lg:px-12">
      {/* Section Header */}
      <div className="text-center mb-16">
        <h2 
          className="text-3xl md:text-4xl lg:text-5xl font-light text-[#171719] mb-6 tracking-[0.4em] uppercase"
          style={{ fontFamily: 'Times New Roman, serif', fontWeight: 300 }}
        >
          START HERE
        </h2>
        <p 
          className="text-base md:text-lg text-[#B5B5B3] max-w-2xl mx-auto leading-relaxed"
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          Okay, so here&apos;s how this works.
        </p>
      </div>
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {offers.map((offer) => (
          <OfferCard key={offer.number} {...offer} />
        ))}
      </div>
    </div>
  </section>
);

export { OfferCardsGrid };