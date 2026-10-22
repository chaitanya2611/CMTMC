export default function Logo({ size = 34 }) {
  return (
    <span className="logo" style={{ '--logo-height': `${size}px` }} aria-hidden="true">
      <img src="/cmtmc-logo.png" alt="" />
    </span>
  );
}
