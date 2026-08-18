'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ScreenshotMockup from './ScreenshotMockup';
import { container, item } from './motionVariants';

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-14 sm:pt-20 lg:pb-28 lg:pt-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[--brand] opacity-30 blur-3xl sm:h-96 sm:w-96"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 right-[-6rem] h-72 w-72 rounded-full bg-[--brand-mid] opacity-30 blur-3xl sm:h-96 sm:w-96"
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto flex max-w-6xl flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-between"
      >
        <div className="flex max-w-xl flex-col items-center text-center lg:items-start lg:text-left">
          <motion.div variants={item} className="mb-6 flex items-center gap-2">
            <Image src="/logo.png" width={40} height={40} alt="RoomGrub" priority />
            <span className="text-lg font-bold text-neutral-900">RoomGrub</span>
          </motion.div>

          <motion.h1
            variants={item}
            className="bg-gradient-to-r from-[#9333ea] to-[#7e22ce] bg-clip-text text-4xl font-extrabold leading-tight text-transparent sm:text-5xl lg:text-6xl"
          >
            Split Bills, Not Friendship
          </motion.h1>

          <motion.p variants={item} className="mt-5 text-lg text-neutral-600">
            Track expenses with your friends 🏠 — smart sharing, stress-free living 💰
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/login"
                className="inline-flex items-center rounded-full bg-gradient-to-r from-[#9333ea] to-[#7e22ce] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-300/40"
              >
                Get Started
              </Link>
            </motion.div>
            <motion.a
              href="#how-it-works"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center rounded-full border border-neutral-300 px-7 py-3 text-sm font-semibold text-neutral-700"
            >
              See how it works
            </motion.a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
        >
          <ScreenshotMockup />
        </motion.div>
      </motion.div>
    </section>
  );
}
