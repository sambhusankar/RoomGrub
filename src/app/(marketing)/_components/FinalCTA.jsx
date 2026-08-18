'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import StoreBadges from './StoreBadges';
import { viewport } from './motionVariants';

export default function FinalCTA() {
  return (
    <section className="px-6 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={viewport}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-r from-[#9333ea] to-[#7e22ce] px-8 py-14 text-center text-white shadow-xl"
      >
        <h2 className="text-3xl font-extrabold sm:text-4xl">Ready to split smarter?</h2>
        <p className="mt-3 text-white/90">Split Bills, Share Easy</p>
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="mt-8 inline-block">
          <Link
            href="/login"
            className="inline-flex items-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-[#7e22ce] shadow-lg"
          >
            Get Started Free
          </Link>
        </motion.div>
        <StoreBadges />
      </motion.div>
    </section>
  );
}
