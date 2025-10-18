import React from 'react';
import { ACADEMY_PORTAL_URL } from './constants.js';

export default function AcademyScreen() {
  const coursesUrl = 'https://sselfie.app.clientclub.net/courses'; // TODO: replace with real courses portal URL
  const membershipUrl = 'https://sselfie.app.clientclub.net/membership'; // TODO: replace with real membership/upgrade URL

  const cards = [
    {
      title: 'Courses',
      description: 'Explore your personal branding courses and continue learning.',
      href: coursesUrl,
      cta: 'Open Courses',
    },
    {
      title: 'Membership',
      description: 'Manage your plan and upgrade for premium content & perks.',
      href: membershipUrl,
      cta: 'Manage Membership',
    },
    {
      title: 'Portal Login',
      description: 'Access the full Academy experience in the external portal.',
      href: ACADEMY_PORTAL_URL,
      cta: 'Open Portal',
    },
  ];

  return (
    <div className="px-4 sm:px-6 md:px-8 pt-6 sm:pt-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-stone-100/50 border border-stone-200/40 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 backdrop-blur-xl shadow-lg shadow-stone-900/10 hover:shadow-stone-900/20 transition-shadow"
          >
            <div className="mb-4 sm:mb-5">
              <h3 className="font-serif font-extralight tracking-[0.15em] uppercase text-stone-900 text-base sm:text-lg md:text-xl">
                {card.title}
              </h3>
              <p className="mt-2 text-stone-600 text-sm sm:text-base leading-relaxed">
                {card.description}
              </p>
            </div>
            <a
              href={card.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full bg-stone-950 text-stone-50 hover:bg-stone-800 rounded-xl sm:rounded-2xl py-3 sm:py-4 text-sm sm:text-base transition-colors"
            >
              {card.cta}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
