// Hero artwork: a DNA double helix whose base pairs feed a neural network, which outputs a drug-like molecule.
const RUNGS = [[30, 282, 178], [66, 321, 139], [102, 318, 142], [138, 275, 185], [210, 156, 304], [246, 135, 325], [282, 158, 302], [354, 278, 182]];
const L1 = [110, 190, 270, 350];
const L2 = [70, 150, 230, 310, 390];
const L3 = [150, 230, 310];

export default function HelixFigure() {
  const edges12 = L1.flatMap((a) => L2.map((b) => `M420 ${a}L500 ${b}`)).join('');
  const edges23 = L2.flatMap((a) => L3.map((b) => `M500 ${a}L580 ${b}`)).join('');
  return (
    <svg className="helix" viewBox="0 0 740 460" role="img" aria-label="A DNA double helix whose base pairs feed a neural network, which outputs a drug-like molecule">
      <path className="helix__strand helix__strand--a" d="M30 282 C50 315 70 325 82 325 C110 325 140 262 164 229 C190 192 220 135 246 135 C275 135 302 176 326 229 C344 266 358 290 370 300" />
      <path className="helix__strand helix__strand--b" d="M30 178 C50 145 70 135 82 135 C110 135 140 198 164 231 C190 268 220 325 246 325 C275 325 302 284 326 231 C344 194 358 170 370 160" />
      <path className="helix__rung" d={RUNGS.map(([x, a, b]) => `M${x} ${a}V${b}`).join('')} />
      {RUNGS.map(([x, a, b]) => (
        <g key={x}><circle cx={x} cy={a} r="6" fill="var(--teal)" /><circle cx={x} cy={b} r="6" fill="var(--violet)" /></g>
      ))}
      <path className="helix__in helix__in--a" d={L1.map((y) => `M354 278L420 ${y}`).join('')} />
      <path className="helix__in helix__in--b" d={L1.map((y) => `M354 182L420 ${y}`).join('')} />
      <path className="helix__edge" d={edges12 + edges23} />
      {L1.map((y) => <circle key={`a${y}`} className="helix__node" cx="420" cy={y} r="9" stroke="var(--teal)" />)}
      {L2.map((y) => <circle key={`b${y}`} className="helix__node helix__node--pulse" cx="500" cy={y} r="9" stroke="var(--violet)" />)}
      {L3.map((y) => <circle key={`c${y}`} className="helix__node" cx="580" cy={y} r="9" stroke="var(--saffron)" />)}
      <path className="helix__out" d="M580 150L626 230M580 230L626 230M580 310L626 230" />
      <polygon points="689,213 689,247 660,264 631,247 631,213 660,196" fill="none" stroke="var(--saffron)" strokeWidth="3.5" />
      <circle cx="660" cy="230" r="17" fill="none" stroke="var(--saffron)" strokeWidth="2" strokeDasharray="4 5" />
      <path d="M689 213L704 205" stroke="var(--saffron)" strokeWidth="3" />
      <text x="707" y="208" className="helix__label helix__label--oh">OH</text>
      <text x="140" y="420" className="helix__label">genome / target</text>
      <text x="455" y="440" className="helix__label">neural network</text>
      <text x="612" y="300" className="helix__label">lead molecule</text>
    </svg>
  );
}
