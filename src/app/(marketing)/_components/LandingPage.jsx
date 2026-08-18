'use client';

import { MotionConfig } from 'framer-motion';
import Hero from './Hero';
import FeatureGrid from './FeatureGrid';
import HowItWorks from './HowItWorks';
import WhyRoomGrub from './WhyRoomGrub';
import FinalCTA from './FinalCTA';
import MarketingFooter from './MarketingFooter';

export default function LandingPage() {
  return (
    <MotionConfig reducedMotion="user">
      <main className="min-h-screen bg-white">
        <Hero />
        <FeatureGrid />
        <HowItWorks />
        <WhyRoomGrub />
        <FinalCTA />
        <MarketingFooter />
      </main>
    </MotionConfig>
  );
}
