// A leaf whose veins are a small graph: the centre's mark.
export default function Logo({ size = 34 }) {
  return (
    <svg className="logo" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <path d="M12 52 C12 28 28 12 52 12 C52 36 36 52 12 52Z" fill="currentColor" opacity="0.14" />
      <path d="M12 52 C12 28 28 12 52 12 C52 36 36 52 12 52Z" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="M12 52 L45 19 M23 41 V29 M31 33 V21 M23 41 H35 M31 33 H43" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="23" cy="29" r="3.6" fill="var(--saffron)" />
      <circle cx="31" cy="21" r="3.6" fill="var(--saffron)" />
      <circle cx="43" cy="33" r="3.6" fill="var(--saffron)" />
      <circle cx="35" cy="41" r="3.6" fill="var(--saffron)" />
    </svg>
  );
}
