// frontend/components/ScrollAnimate.tsx
'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ScrollAnimateProps {
  children: ReactNode;
  delay?: number;
}

// This component fades and slides its children up when they enter the viewport
export function ScrollAnimate({ children, delay = 0 }: ScrollAnimateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }} // Start invisible, 50px below final position
      whileInView={{ opacity: 1, y: 0 }} // Animate to full visibility at 0 position
      viewport={{ once: true, amount: 0.2 }} // Trigger animation when element is 20% visible, and only run once
      transition={{ duration: 0.6, delay: delay }}
    >
      {children}
    </motion.div>
  );
}