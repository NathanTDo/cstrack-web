"use client";

import React from "react";
import { motion } from "framer-motion"; // Import the animation library
import Link from "next/link";
import { Button } from "@/components/ui/button"; // Assuming you have shadcn button
import Navbar from "@/components/Navbar"; // Your existing navbar

// --- Animation Variants ---
// These define how the animation starts (hidden) and ends (visible)
const fadeIn = {
  hidden: { opacity: 0, y: 20 }, // Start invisible and slightly lower
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const }, // Animation settings
  },
};

const staggerContainer = {
  visible: {
    transition: {
      staggerChildren: 0.2, // Delay between each child animation
    },
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#171717] text-white selection:bg-brand-theme selection:text-black">
      {/* --- HERO SECTION --- */}
      <section className="relative flex flex-col items-center justify-center h-screen px-4 text-center overflow-hidden">
        {/* Background Gradient Blob */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-theme/20 rounded-full blur-[120px] -z-10" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-4xl z-10"
        >
          <motion.h1
            variants={fadeIn}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
          >
            Track your CS2 <span className="text-brand-theme">Portfolio</span>{" "}
            Value
          </motion.h1>

          <motion.p
            variants={fadeIn}
            className="text-lg md:text-xl text-zinc-400 mb-8 max-w-2xl mx-auto"
          >
            The ultimate tool for collectors and traders. Real-time prices from
            Skinport & Steam, aggregated for accurate valuation.
          </motion.p>

          <motion.div variants={fadeIn} className="flex gap-4 justify-center">
            <Link href="/search">
              <Button
                size="lg"
                className="bg-brand-theme text-black hover:bg-brand-theme-hover font-bold text-lg px-8"
              >
                Start Tracking
              </Button>
            </Link>
            <Link href="/about">
              <Button
                size="lg"
                variant="outline"
                className="border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
              >
                Learn More
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* --- FEATURES SECTION (Scroll Triggered) --- */}
      <section className="py-24 px-4">
        <motion.div
          initial="hidden"
          whileInView="visible" // <--- THIS IS THE MAGIC PROP
          viewport={{ once: true, amount: 0.2 }} // Trigger when 20% of element is in view
          variants={staggerContainer}
          className="max-w-6xl mx-auto"
        >
          <motion.h2
            variants={fadeIn}
            className="text-3xl md:text-4xl font-bold text-center mb-16"
          >
            Why use <span className="text-brand-theme">CSTrack</span>?
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              variants={fadeIn}
              className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 hover:border-brand-theme/50 transition-colors"
            >
              <div className="h-12 w-12 bg-brand-theme/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Real-Time Valuation</h3>
              <p className="text-zinc-400">
                We pull data directly from major marketplaces to give you the
                true cash value of your inventory, not just Steam wallet funds.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              variants={fadeIn}
              className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 hover:border-brand-theme/50 transition-colors"
            >
              <div className="h-12 w-12 bg-brand-theme/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Smart Search</h3>
              <p className="text-zinc-400">
                Instantly find any skin. Our intelligent search combines pricing
                data with high-quality images automatically.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              variants={fadeIn}
              className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 hover:border-brand-theme/50 transition-colors"
            >
              <div className="h-12 w-12 bg-brand-theme/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Secure & Private</h3>
              <p className="text-zinc-400">
                Your portfolio is stored securely in the cloud. Only you have
                access to your data via authenticated login.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* --- CALL TO ACTION SECTION --- */}
      <section className="py-32 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto bg-gradient-to-r from-zinc-900 to-zinc-900/50 p-12 rounded-3xl border border-zinc-800"
        >
          <h2 className="text-3xl font-bold mb-6">
            Ready to organize your inventory?
          </h2>
          <p className="text-zinc-400 mb-8">
            Join thousands of collectors tracking their value today.
          </p>
          <Link href="/portfolio">
            <Button className="bg-white text-black hover:bg-zinc-200 text-lg py-6 px-8 rounded-full">
              Get Started for Free
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
