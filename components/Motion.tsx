"use client";
import { motion, useReducedMotion } from "framer-motion";
export function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const r = useReducedMotion();
  return <motion.div className={className} initial={r ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}
export function Float({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const r = useReducedMotion();
  return <motion.div className={className} initial={r ? false : { opacity: 0, y: 30, rotate: -1.5 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}
export function Underline() {
  return <motion.svg aria-hidden viewBox="0 0 300 14" className="absolute -bottom-2 left-0 h-3 w-full" preserveAspectRatio="none"><motion.path d="M2 9 C 80 2, 200 2, 298 8" stroke="#A6461F" strokeWidth="4" fill="none" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, delay: 0.6 }} /></motion.svg>;
}
