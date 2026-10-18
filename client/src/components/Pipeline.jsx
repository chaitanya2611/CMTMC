// The research workflow is a real sequence, so its steps are numbered.
export default function Pipeline({ steps }) {
  if (!steps?.length) return null;
  return (
    <ol className="pipeline">
      {steps.map((s, i) => (
        <li key={i} className="pipeline__step">
          <span className="pipeline__num" aria-hidden="true">{i + 1}</span>
          <h3>{s.title}</h3>
          <p>{s.text}</p>
        </li>
      ))}
    </ol>
  );
}
