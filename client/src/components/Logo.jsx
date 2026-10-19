// A benzene ring whose vertices are network nodes: biology (teal), chemistry (saffron) and AI (violet) joined at the centre.
export default function Logo({ size = 34 }) {
  return (
    <svg className="logo" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <polygon points="32,6 54,19 54,45 32,58 10,45 10,19" fill="none" stroke="var(--teal)" strokeWidth="3.5" />
      <path d="M32 6V32L54 45M32 32L10 45" stroke="currentColor" strokeOpacity="0.55" strokeWidth="2.4" />
      <circle cx="32" cy="6" r="5" fill="var(--violet)" />
      <circle cx="54" cy="45" r="5" fill="var(--saffron)" />
      <circle cx="10" cy="45" r="5" fill="var(--teal)" />
      <circle cx="32" cy="32" r="4" fill="currentColor" />
    </svg>
  );
}
