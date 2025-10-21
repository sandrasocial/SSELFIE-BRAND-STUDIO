import React, { useState } from 'react';
import { ChevronRight, Star, Grid } from 'lucide-react';
import { ACADEMY_PORTAL_URL } from './constants.js';

export default function AcademyScreen() {
  const [selectedView, setSelectedView] = useState('overview');
  const coursesUrl = 'https://sselfie.app.clientclub.net/courses'; // TODO: replace with real courses portal URL
  const membershipUrl = 'https://sselfie.app.clientclub.net/membership'; // TODO: replace with real membership/upgrade URL

  const membershipTiers = [
    {
      name: 'Studio Essential',
      price: '$49',
      period: 'month',
      description: 'Perfect for getting started with AI photography',
      features: [
        '50 AI photo generations per month',
        'Basic training tutorials',
        'Email support',
        'Standard quality exports'
      ],
      highlighted: false
    },
    {
      name: 'Studio Pro',
      price: '$99',
      period: 'month',
      description: 'For serious content creators',
      features: [
        '500 AI photo generations per month',
        'Advanced training courses',
        'Priority email & chat support',
        '4K quality exports',
        'Custom style training'
      ],
      highlighted: true
    },
    {
      name: 'Studio Enterprise',
      price: '$299',
      period: 'month',
      description: 'For professional studios',
      features: [
        'Unlimited AI photo generations',
        'All training content',
        '24/7 phone & chat support',
        '8K quality exports',
        'Team collaboration',
        'API access'
      ],
      highlighted: false
    }
  ];

  const courses = [
    {
      title: 'AI Photography Fundamentals',
      duration: '2 hours',
      lessons: 8,
      description: 'Master the basics of AI-powered photography',
      level: 'Beginner'
    },
    {
      title: 'Professional Portrait Mastery',
      duration: '3 hours',
      lessons: 12,
      description: 'Create stunning professional headshots and portraits',
      level: 'Intermediate'
    },
    {
      title: 'Brand Photography Strategy',
      duration: '4 hours',
      lessons: 15,
      description: 'Build a cohesive visual brand identity',
      level: 'Advanced'
    },
    {
      title: 'Social Media Content Creation',
      duration: '2.5 hours',
      lessons: 10,
      description: 'Optimize your photos for maximum engagement',
      level: 'Intermediate'
    }
  ];

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

  if (selectedView === 'membership') {
    return (
      <div className="px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 pb-8">
        <div className="space-y-8 pb-4">
          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={() => setSelectedView('overview')}
              className="p-4 bg-stone-100/50 rounded-2xl border border-stone-200/40 hover:bg-stone-100/70 hover:border-stone-300/50 transition-all duration-200"
            >
              <ChevronRight size={18} className="text-stone-600 transform rotate-180" strokeWidth={1.5} />
            </button>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-extralight tracking-[0.3em] text-stone-950 uppercase">
                Membership Plans
              </h2>
              <p className="text-xs tracking-[0.15em] uppercase font-light mt-2 text-stone-500">
                Choose Your Plan
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {membershipTiers.map((tier, i) => (
              <div
                key={i}
                className={`bg-stone-100/50 border rounded-3xl p-6 sm:p-8 transition-all duration-200 ${
                  tier.highlighted
                    ? 'border-stone-950 bg-stone-950 text-stone-50'
                    : 'border-stone-200/40 hover:border-stone-300/60'
                }`}
              >
                {tier.highlighted && (
                  <div className="inline-block px-4 py-1.5 bg-stone-50 text-stone-950 rounded-full text-xs tracking-[0.15em] uppercase font-light mb-4">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl sm:text-2xl font-serif font-extralight tracking-[0.15em] uppercase mb-2">
                    {tier.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-4xl sm:text-5xl font-serif font-extralight">{tier.price}</span>
                    <span className={`text-sm font-light tracking-wide ${tier.highlighted ? 'opacity-80' : 'text-stone-600'}`}>
                      / {tier.period}
                    </span>
                  </div>
                  <p className={`text-sm font-light ${tier.highlighted ? 'opacity-90' : 'text-stone-600'}`}>
                    {tier.description}
                  </p>
                </div>

                <div className="space-y-3 mb-8">
                  {tier.features.map((feature, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                        tier.highlighted ? 'bg-stone-50' : 'bg-stone-950'
                      }`}></div>
                      <span className={`text-sm font-light ${tier.highlighted ? 'opacity-90' : 'text-stone-950'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <a
                  href="https://your-gohighlevel-link.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full text-center py-4 rounded-2xl font-light tracking-[0.15em] uppercase text-sm transition-all duration-200 min-h-[52px] ${
                    tier.highlighted
                      ? 'bg-stone-50 text-stone-950 hover:bg-stone-100'
                      : 'bg-stone-950 text-stone-50 hover:bg-stone-800'
                  }`}
                >
                  Choose {tier.name}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (selectedView === 'courses') {
    return (
      <div className="px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 pb-8">
        <div className="space-y-8 pb-4">
          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={() => setSelectedView('overview')}
              className="p-4 bg-stone-100/50 rounded-2xl border border-stone-200/40 hover:bg-stone-100/70 hover:border-stone-300/50 transition-all duration-200"
            >
              <ChevronRight size={18} className="text-stone-600 transform rotate-180" strokeWidth={1.5} />
            </button>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-extralight tracking-[0.3em] text-stone-950 uppercase">
                All Courses
              </h2>
              <p className="text-xs tracking-[0.15em] uppercase font-light mt-2 text-stone-500">
                Professional Training
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {courses.map((course, i) => (
              <div
                key={i}
                className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-3xl p-6 sm:p-8 hover:border-white/80 transition-all duration-300 shadow-lg shadow-stone-900/5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-gradient-to-br from-stone-100/80 to-stone-200/60 border border-white/60 rounded-full text-xs tracking-[0.1em] uppercase font-light text-stone-700 shadow-inner shadow-stone-900/5">
                        {course.level}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-serif font-extralight tracking-[0.15em] uppercase mb-2">
                      {course.title}
                    </h3>
                    <p className="text-sm font-light text-stone-600 mb-4">
                      {course.description}
                    </p>
                    <div className="flex items-center gap-6 text-xs tracking-[0.1em] uppercase font-light text-stone-500">
                      <span>{course.duration}</span>
                      <span>{course.lessons} Lessons</span>
                    </div>
                  </div>
                </div>

                <a
                  href="https://your-gohighlevel-course-link.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-stone-950 text-stone-50 py-4 rounded-2xl font-light tracking-[0.15em] uppercase text-sm transition-all duration-200 hover:bg-stone-800 min-h-[52px]"
                >
                  Access Course
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 pb-8">
      <div className="pt-3 sm:pt-4 md:pt-6 text-center mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-serif font-extralight tracking-[0.3em] text-stone-950 uppercase leading-none mb-2 sm:mb-3">
          Academy
        </h1>
        <p className="text-[10px] sm:text-xs tracking-[0.2em] uppercase font-light text-stone-500">
          Master Professional Photography
        </p>
      </div>

      {/* Overview Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 sm:mb-12">
        <button
          onClick={() => setSelectedView('membership')}
          className="group relative bg-white/50 backdrop-blur-2xl border border-white/60 rounded-[1.75rem] p-8 text-left hover:bg-white/70 hover:border-white/80 transition-all duration-300 shadow-xl shadow-stone-900/10 hover:shadow-2xl hover:shadow-stone-900/20 overflow-hidden hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-stone-200/20 rounded-full blur-3xl"></div>
          <div className="relative z-10 w-14 h-14 bg-stone-950 rounded-[1.25rem] flex items-center justify-center mb-6 shadow-xl shadow-stone-900/30 group-hover:scale-110 transition-transform duration-300">
            <Star size={26} className="text-white" strokeWidth={2.5} />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-stone-950 mb-3 relative z-10">
            Membership Plans
          </h3>
          <p className="text-sm font-medium text-stone-600 mb-6 relative z-10">
            Upgrade your plan for unlimited AI generations and exclusive features
          </p>
          <div className="flex items-center gap-2 text-xs tracking-wider uppercase font-semibold text-stone-600 group-hover:text-stone-950 transition-colors relative z-10">
            <span>View Plans</span>
            <ChevronRight size={14} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => setSelectedView('courses')}
          className="group relative bg-white/50 backdrop-blur-2xl border border-white/60 rounded-[1.75rem] p-8 text-left hover:bg-white/70 hover:border-white/80 transition-all duration-300 shadow-xl shadow-stone-900/10 hover:shadow-2xl hover:shadow-stone-900/20 overflow-hidden hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-stone-200/20 rounded-full blur-3xl"></div>
          <div className="relative z-10 w-14 h-14 bg-stone-950 rounded-[1.25rem] flex items-center justify-center mb-6 shadow-xl shadow-stone-900/30 group-hover:scale-110 transition-transform duration-300">
            <Grid size={26} className="text-white" strokeWidth={2.5} />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-stone-950 mb-3 relative z-10">
            All Courses
          </h3>
          <p className="text-sm font-medium text-stone-600 mb-6 relative z-10">
            Access our complete library of professional photography courses
          </p>
          <div className="flex items-center gap-2 text-xs tracking-wider uppercase font-semibold text-stone-600 group-hover:text-stone-950 transition-colors relative z-10">
            <span>Browse Courses</span>
            <ChevronRight size={14} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
        {cards.map((card, index) => (
          <div
            key={card.title}
            className="group bg-white/50 backdrop-blur-2xl border border-white/60 rounded-xl sm:rounded-[1.75rem] p-6 sm:p-8 shadow-xl shadow-stone-900/10 hover:shadow-2xl hover:shadow-stone-900/20 hover:bg-white/70 hover:border-white/80 transition-all duration-300 hover:scale-[1.02] flex flex-col"
          >
            <div className="mb-6 sm:mb-8 flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-stone-950 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-sm">{index + 1}</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-stone-600"></div>
              </div>
              <h3 className="font-serif font-extralight tracking-[0.15em] uppercase text-stone-950 text-base sm:text-lg md:text-xl mb-3 sm:mb-4">
                {card.title}
              </h3>
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-light">
                {card.description}
              </p>
            </div>
            <a
              href={card.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group/btn relative inline-flex items-center justify-center w-full bg-stone-950 text-white hover:shadow-2xl hover:shadow-stone-900/40 rounded-xl sm:rounded-[1.25rem] py-4 sm:py-5 text-sm sm:text-base font-semibold tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 min-h-[52px] sm:min-h-[56px] overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10">{card.cta}</span>
            </a>
          </div>
        ))}
      </div>

      {/* Featured Course Card */}
      <div className="relative bg-stone-950 text-white rounded-[1.75rem] p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-stone-800/50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-stone-700/30 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-xl rounded-full text-xs tracking-wider uppercase font-semibold mb-4 border border-white/20">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              Recommended
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-3">
              Professional Portrait Mastery
            </h3>
            <p className="text-sm font-medium opacity-90 mb-6 max-w-md">
              12 lessons • 3 hours • Create stunning professional headshots that capture attention and build authority
            </p>
          </div>
        </div>

        <a
          href="https://sselfie.app.clientclub.net/courses/professional-portrait-mastery"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block w-full text-center bg-white text-stone-950 py-4 rounded-[1.25rem] font-semibold text-sm transition-all duration-300 hover:shadow-2xl hover:shadow-white/30 min-h-[56px] hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
        >
          <div className="absolute inset-0 bg-stone-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="relative z-10">Start Learning</span>
        </a>
      </div>
    </div>
  );
}
