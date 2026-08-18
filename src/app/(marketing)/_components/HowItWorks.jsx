'use client';

import { motion } from 'framer-motion';
import { container, item, viewport } from './motionVariants';

const steps = [
  { n: '1', title: 'Create or join a room', desc: 'Set up your flat in seconds or hop in with an invite link.' },
  { n: '2', title: 'Add expenses as you go', desc: 'Log groceries, rent, bills — split evenly or custom.' },
  { n: '3', title: 'Settle up, hassle-free', desc: 'See exact balances and clear them with one tap.' },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[--brand-light]/40 px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-extrabold text-neutral-900 sm:text-4xl">
          How it works
        </h2>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="relative mt-14 flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between"
        >
          <div
            aria-hidden
            className="absolute left-6 right-6 top-6 hidden h-0.5 bg-gradient-to-r from-[#9333ea] to-[#7e22ce] opacity-30 sm:block"
          />
          {steps.map((s) => (
            <motion.div key={s.n} variants={item} className="relative flex flex-1 flex-col items-center text-center">
              <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#9333ea] to-[#7e22ce] text-lg font-bold text-white shadow-lg shadow-purple-300/40">
                {s.n}
              </span>
              <h3 className="mt-4 text-lg font-bold text-neutral-900">{s.title}</h3>
              <p className="mt-2 max-w-xs text-sm text-neutral-600">{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
