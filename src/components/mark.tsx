export function HouseMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <text x="20" y="26" textAnchor="middle" fontSize="16" fill="currentColor" fontFamily="serif">G</text>
    </svg>
  );
}
