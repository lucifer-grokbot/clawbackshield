export default function Logo({ className = "", light = false }: { className?: string; light?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width="36" height="36" viewBox="0 0 40 40" aria-hidden="true">
        <rect width="40" height="40" rx="9" fill={light ? "#FAF6EE" : "#13213C"} />
        <path d="M20 7l10 3.5v8.2c0 6.4-4.3 11.3-10 13.3-5.7-2-10-6.9-10-13.3v-8.2z" fill={light ? "#13213C" : "#FAF6EE"} />
        <path d="M14.5 15.5h11M14.5 19.5h11M14.5 23.5h6" stroke={light ? "#FAF6EE" : "#13213C"} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M26 22c-1.8 2.8-3.4 4.4-6 5.6" stroke="#A6461F" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </svg>
      <span className={`font-serif text-[1.35rem] font-semibold tracking-tight ${light ? "text-cream" : "text-navy"}`}>Clawback<span className="italic text-rust">Shield</span></span>
    </span>
  );
}
