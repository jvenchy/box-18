"use client";

import Image from "next/image";
import Link from "next/link";
import { DM_Sans } from "next/font/google";
import { motion } from "framer-motion";
import StaggeredMenu from "../components/StaggeredMenu";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function Home() {
  const menuItems = [
    { label: "Discover", link: "/home", ariaLabel: "Discover players" },
    { label: "Search", link: "/search", ariaLabel: "Search" },
    { label: "Upload", link: "/upload", ariaLabel: "Upload footage" },
    { label: "Features", link: "#features", ariaLabel: "View features" },
  ];

  const socialItems = [
    { label: "Twitter", link: "https://twitter.com" },
    { label: "Instagram", link: "https://instagram.com" },
    { label: "LinkedIn", link: "https://linkedin.com" },
  ];

  return (
    <div className={`${dmSans.variable} min-h-screen relative font-sans`}>
      {/* Background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: 'url(/background/background3.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 backdrop-blur-md bg-black/20" />
      </div>

      {/* StaggeredMenu Navigation */}
      <StaggeredMenu
        position="right"
        colors={["#000000", "#000000"]}
        items={menuItems}
        socialItems={socialItems}
        displaySocials={true}
        displayItemNumbering={true}
        logoUrl="/logos/box18-text-logo.png"
        logoLink="/home"
        menuButtonColor="#fff"
        openMenuButtonColor="#fff"
        accentColor="#5B8DB8"
        changeMenuColorOnOpen={false}
        isFixed={true}
        closeOnClickAway={true}
        panelTextColor="#fff"
      />

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 relative">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center">
            {/* Main heading with animation */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-6xl md:text-7xl lg:text-8xl font-semibold text-white mb-8 tracking-tight leading-none"
            >
              The new way to recruit youth soccer talent.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-white/60 mb-12 max-w-3xl mx-auto font-light"
            >
              Players upload game footage, get performance analytics, and connect with coaches.
              Coaches discover talent with smart search and detailed profiles.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/home">
                <button className="bg-white text-black px-10 py-4 rounded-full font-semibold text-lg transition-all hover:bg-white/90">
                  Get Started
                </button>
              </Link>
              <button className="bg-white/10 border border-white/20 text-white px-10 py-4 rounded-full font-semibold text-lg transition-all hover:bg-white/20">
                Watch Demo
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Images Section */}
      <section className="py-4">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >

            <div className="relative h-[250px] rounded-2xl overflow-hidden border border-white/10">
              <Image
                src="/images/pitch.png"
                alt="Soccer Pitch Analysis"
                fill
                className="object-cover"
              />
            </div>

            <div className="relative h-[250px] rounded-2xl overflow-hidden border border-white/10">
              <Image
                src="/images/heatmap.png"
                alt="Player Heatmap"
                fill
                className="object-cover"
              />
            </div>

            <div className="relative h-[250px] rounded-2xl overflow-hidden border border-white/10">
              <Image
                src="/images/labeling.png"
                alt="Soccer Footage Label Training"
                fill
                className="object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 rounded-3xl p-8"
            >
              <div className="text-white/70 text-sm font-medium mb-2">For Players</div>
              <h3 className="text-white text-2xl font-semibold mb-3">Upload & Analyze</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Upload your game footage and get detailed performance analytics powered by ML
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 rounded-3xl p-8"
            >
              <div className="text-white/70 text-sm font-medium mb-2">AI-Powered</div>
              <h3 className="text-white text-2xl font-semibold mb-3">Smart Tracking</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Advanced player identification and tracking even with varying camera quality
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 rounded-3xl p-8"
            >
              <div className="text-white/70 text-sm font-medium mb-2">For Coaches</div>
              <h3 className="text-white text-2xl font-semibold mb-3">Discover Talent</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Search and filter players by performance metrics and attributes
              </p>
            </motion.div>
          </div>

          {/* Feature Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 rounded-3xl p-10"
            >
              <h4 className="text-white text-xl font-semibold mb-4">Performance Metrics</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                  <span className="text-white/80 text-sm">Minutes played & goals scored</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                  <span className="text-white/80 text-sm">Shot attempts & ball touches</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                  <span className="text-white/80 text-sm">Carries & heatmap distribution</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                  <span className="text-white/80 text-sm">Sprint bursts & movement patterns</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 rounded-3xl p-10"
            >
              <h4 className="text-white text-xl font-semibold mb-4">Player Profiles</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                  <span className="text-white/80 text-sm">Create comprehensive profiles</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                  <span className="text-white/80 text-sm">Position & team information</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                  <span className="text-white/80 text-sm">Contact details for scouts</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                  <span className="text-white/80 text-sm">Historical performance data</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center mt-12"
          >
            <h2 className="text-white text-3xl md:text-4xl font-bold mb-4">
              Ready to elevate your game?
            </h2>
            <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
              Join players and coaches using Box18 to track performance and discover talent.
            </p>
            <Link href="/home">
              <button className="bg-white text-black px-8 py-3.5 rounded-full font-semibold transition-all hover:bg-white/90">
                Get Started Today
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
