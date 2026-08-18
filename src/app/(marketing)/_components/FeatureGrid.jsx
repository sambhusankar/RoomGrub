'use client';

import { motion } from 'framer-motion';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';
import { container, item, viewport } from './motionVariants';

const features = [
  {
    icon: ReceiptLongRoundedIcon,
    title: 'Expense Splitting',
    desc: 'Add an expense, split it evenly or custom — everyone knows what they owe instantly.',
  },
  {
    icon: HomeRoundedIcon,
    title: 'Group Management',
    desc: 'Create a room for any group, invite people with a link, and manage members with ease.',
  },
  {
    icon: AnalyticsRoundedIcon,
    title: 'Balance Settling',
    desc: 'See who owes whom at a glance and settle up with one tap.',
  },
  {
    icon: ListAltRoundedIcon,
    title: 'Expense History',
    desc: 'Every expense, edit, and settlement logged — nothing gets lost or forgotten.',
  },
];

export default function FeatureGrid() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-extrabold text-neutral-900 sm:text-4xl">
          Everything you need to split fair
        </h2>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map(({ icon: Icon, title, desc }) => (
            <motion.div
              key={title}
              variants={item}
              whileHover={{ y: -4 }}
              className="rounded-2xl bg-[--brand-light]/60 p-6 shadow-sm ring-1 ring-black/5"
            >
              <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#9333ea] to-[#7e22ce] text-white">
                <Icon fontSize="medium" />
              </span>
              <h3 className="text-lg font-bold text-neutral-900">{title}</h3>
              <p className="mt-2 text-sm text-neutral-600">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
