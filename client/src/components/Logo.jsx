// Typographic monogram used where a compact mark is needed (admin panel, favicon).
// The site uses a text wordmark in the header; no emblem is invented for the centre.
export default function Logo({ size = 34 }) {
  return (
    <svg className="logo" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="6" fill="#14233F" />
      <text x="32" y="45" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontSize="38" fill="#fff">C</text>
      <rect x="14" y="52" width="36" height="3" fill="#B98A2E" />
    </svg>
  );
}
