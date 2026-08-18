'use client';

import { motion } from 'framer-motion';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import { container, item, viewport } from './motionVariants';

const points = [
  { icon: GroupsRoundedIcon, text: 'For roommates, friends, trips, or any group sharing costs' },
  { icon: BlockRoundedIcon, text: 'No spreadsheets, no awkward reminders' },
  { icon: TuneRoundedIcon, text: 'Split evenly or customize each expense your way' },
  { icon: HistoryRoundedIcon, text: 'Full activity log — every expense and settlement tracked' },
];

export default function WhyRoomGrub() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-extrabold text-neutral-900 sm:text-4xl">
          Why people love RoomGrub
        </h2>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {points.map(({ icon: Icon, text }) => (
            <motion.div key={text} variants={item} className="flex flex-col items-center text-center">
              <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[--brand-light] text-[--brand]">
                <Icon />
              </span>
              <p className="max-w-[16rem] text-sm font-medium text-neutral-700">{text}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
