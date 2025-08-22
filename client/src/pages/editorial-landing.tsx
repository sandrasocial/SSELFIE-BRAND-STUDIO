import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';

export default function EditorialLanding() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Helmet>
        <title>SSELFIE STUDIO - Your AI-Powered Personal Brand Platform</title>
        <meta name="description" content="Transform your personal brand with AI-powered storytelling, professional photos, and automated content creation - all in one revolutionary platform." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/90 z-10" />
          <video
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            poster="/images/hero-poster.jpg"
          >
            <source src="/videos/brand-story.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            Tell Your Story Like Never Before
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl mb-12 text-gray-300"
          >
            The all-in-one platform that transforms your personal brand with AI-powered photos, content, and storytelling
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-x-6"
          >
            <Link href="/signup" className="inline-block px-12 py-6 bg-white text-black text-sm font-semibold uppercase tracking-wider hover:bg-gray-200 transition-all duration-300">
              Start Your Story
            </Link>
            <Link href="/pricing" className="inline-block px-12 py-6 border border-white text-white text-sm font-semibold uppercase tracking-wider hover:bg-white hover:text-black transition-all duration-300">
              View Pricing
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">Create Your Brand Story in 5 Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {/* TRAIN */}
            <div className="bg-black/40 p-8 rounded-lg backdrop-blur-sm">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold mb-4">TRAIN</h3>
              <p className="text-gray-300">Train your personal AI model to capture your unique style and essence</p>
            </div>
            
            {/* STYLE */}
            <div className="bg-black/40 p-8 rounded-lg backdrop-blur-sm">
              <div className="text-3xl mb-4">✨</div>
              <h3 className="text-2xl font-bold mb-4">STYLE</h3>
              <p className="text-gray-300">Get personalized style guidance and photo direction from your AI stylist</p>
            </div>
            
            {/* SHOOT */}
            <div className="bg-black/40 p-8 rounded-lg backdrop-blur-sm">
              <div className="text-3xl mb-4">📸</div>
              <h3 className="text-2xl font-bold mb-4">SHOOT</h3>
              <p className="text-gray-300">Create stunning professional photos with AI-powered prompts and guidance</p>
            </div>
            
            {/* BUILD */}
            <div className="bg-black/40 p-8 rounded-lg backdrop-blur-sm">
              <div className="text-3xl mb-4">🎨</div>
              <h3 className="text-2xl font-bold mb-4">BUILD</h3>
              <p className="text-gray-300">Design your brand presence with automated website and content creation</p>
            </div>
            
            {/* MANAGE */}
            <div className="bg-black/40 p-8 rounded-lg backdrop-blur-sm">
              <div className="text-3xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold mb-4">MANAGE</h3>
              <p className="text-gray-300">Effortlessly maintain your brand with AI-powered content management</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24 px-4 bg-black">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Start Your Brand Journey Today</h2>
          <p className="text-xl text-gray-300 mb-12">Choose the perfect plan for your brand story</p>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/5 p-8 rounded-lg backdrop-blur-sm border border-white/10">
              <h3 className="text-2xl font-bold mb-4">Creator</h3>
              <div className="text-4xl font-bold mb-6">€27<span className="text-lg">/month</span></div>
              <ul className="text-left space-y-4 mb-8">
                <li>✓ Personal AI Model Training</li>
                <li>✓ Basic Style Guidance</li>
                <li>✓ Photo Shoot Prompts</li>
                <li>✓ Essential Content Tools</li>
              </ul>
              <Link href="/signup?plan=creator" className="inline-block w-full px-8 py-4 bg-white text-black text-sm font-semibold uppercase tracking-wider hover:bg-gray-200 transition-all duration-300">
                Get Started
              </Link>
            </div>
            <div className="bg-white/5 p-8 rounded-lg backdrop-blur-sm border border-white/10">
              <h3 className="text-2xl font-bold mb-4">Entrepreneur</h3>
              <div className="text-4xl font-bold mb-6">€67<span className="text-lg">/month</span></div>
              <ul className="text-left space-y-4 mb-8">
                <li>✓ Advanced AI Model Training</li>
                <li>✓ Premium Style Consultation</li>
                <li>✓ Pro Photo Direction</li>
                <li>✓ Full Website Builder</li>
                <li>✓ Content Management Suite</li>
              </ul>
              <Link href="/signup?plan=entrepreneur" className="inline-block w-full px-8 py-4 bg-white text-black text-sm font-semibold uppercase tracking-wider hover:bg-gray-200 transition-all duration-300">
                Level Up
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 px-4 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-16">Join the Brand Revolution</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8">
              <div className="text-5xl mb-4">135K+</div>
              <p className="text-xl text-gray-300">Community Members</p>
            </div>
            <div className="p-8">
              <div className="text-5xl mb-4">€150+</div>
              <p className="text-xl text-gray-300">Monthly Savings</p>
            </div>
            <div className="p-8">
              <div className="text-5xl mb-4">5x</div>
              <p className="text-xl text-gray-300">Brand Growth</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-3xl" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-8">Ready to Transform Your Brand?</h2>
          <p className="text-xl text-gray-300 mb-12">Join thousands of creators who are telling their story with SSELFIE STUDIO</p>
          <Link href="/signup" className="inline-block px-16 py-8 bg-white text-black text-lg font-bold uppercase tracking-wider hover:bg-gray-200 transition-all duration-300">
            Start Your Journey
          </Link>
        </div>
      </section>
    </div>
  );
}