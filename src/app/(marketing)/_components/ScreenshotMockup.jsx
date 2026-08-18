'use client';

import { motion } from 'framer-motion';

const rows = [
  { name: 'Groceries', by: 'Aditi', amount: '₹640', color: '#9333ea' },
  { name: 'Electricity Bill', by: 'Rahul', amount: '₹1,250', color: '#c084fc' },
  { name: 'Internet', by: 'You', amount: '₹499', color: '#7e22ce' },
];

export default function ScreenshotMockup() {
  return (
    // TODO: replace with real app screenshot once available
    <div className="relative mx-auto w-[260px] sm:w-[300px] rounded-[2.5rem] border-[8px] border-neutral-900 bg-neutral-900 shadow-2xl">
      <div className="absolute left-1/2 top-0 h-5 w-24 -translate-x-1/2 rounded-b-xl bg-neutral-900" />
      <div className="overflow-hidden rounded-[2rem] bg-white">
        <div className="bg-gradient-to-r from-[#9333ea] to-[#7e22ce] px-4 pb-6 pt-8 text-white">
          <p className="text-xs opacity-80">Flat 4B</p>
          <p className="text-lg font-bold">Room Balance</p>
          <p className="mt-1 text-2xl font-extrabold">₹2,389</p>
        </div>
        <div className="space-y-3 p-4">
          {rows.map((row, i) => (
            <motion.div
              key={row.name}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.15, duration: 0.4 }}
              className="flex items-center gap-3 rounded-xl bg-neutral-50 p-2.5"
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: row.color }}
              >
                {row.by[0]}
              </span>
              <span className="flex-1 truncate text-sm font-medium text-neutral-800">
                {row.name}
              </span>
              <span className="text-sm font-semibold text-neutral-900">{row.amount}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
