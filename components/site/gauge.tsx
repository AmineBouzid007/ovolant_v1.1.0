// The focal point: a cockpit-style dial showing how full the next course is.
// Pure SVG + CSS (no client JS). Segments light up like a tachometer: green -> amber -> red.
export type Tone = "open" | "low" | "full" | "idle"
export const TONE_HEX: Record<Tone, string> = { open: "#b6ff3c", low: "#ffb800", full: "#ff4d52", idle: "#5b6e63" }

const C = 200
const START = -135
const SWEEP = 270
const SEGMENTS = 54
const TICKS = 41

const zone = (f: number) => (f < 0.6 ? "#b6ff3c" : f < 0.85 ? "#ffb800" : "#ff4d52")
const xy = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180
  return { x: +(C + r * Math.sin(a)).toFixed(2), y: +(C - r * Math.cos(a)).toFixed(2) }
}

export function Gauge({
  pct, tone, lowLabel, highLabel, children,
}: { pct: number; tone: Tone; lowLabel: string; highLabel: string; children: React.ReactNode }) {
  const p = Math.min(1, Math.max(0, pct))
  const idle = tone === "idle"
  const lit = idle ? 0 : Math.round(p * SEGMENTS)
  const color = idle ? TONE_HEX.idle : zone(p)
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[430px]">
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <radialGradient id="hud-face" cx="50%" cy="46%" r="60%">
            <stop offset="0%" stopColor="#0f1f18" />
            <stop offset="70%" stopColor="#07100c" />
            <stop offset="100%" stopColor="#040806" />
          </radialGradient>
          <radialGradient id="hud-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#b6ff3c" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#b6ff3c" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* bezel */}
        <circle cx={C} cy={C} r="197" fill="none" stroke="#1c2d24" strokeWidth="1.5" />
        <circle className="hud-spin" cx={C} cy={C} r="189" fill="none" stroke="#b6ff3c" strokeOpacity="0.45" strokeWidth="2" strokeDasharray="1 11" strokeLinecap="round" />
        <circle cx={C} cy={C} r="179" fill="url(#hud-face)" stroke="#27402f" strokeWidth="1.5" />

        {/* tick scale + numerals */}
        {Array.from({ length: TICKS }, (_, i) => {
          const major = i % 4 === 0
          const deg = START + (SWEEP * i) / (TICKS - 1)
          return (
            <line key={i} x1={C} x2={C} y1={C - 171} y2={C - (major ? 158 : 164)} transform={`rotate(${deg} ${C} ${C})`}
              stroke={major ? "#d7e6da" : "#3d5748"} strokeWidth={major ? 2.5 : 1.5} strokeLinecap="round" />
          )
        })}
        {Array.from({ length: 6 }, (_, k) => {
          const i = k * 8
          const { x, y } = xy(146, START + (SWEEP * i) / (TICKS - 1))
          return <text key={k} x={x} y={y} textAnchor="middle" dominantBaseline="central" className="hud-gauge-num">{i * 2.5}</text>
        })}

        {/* LED segments */}
        {Array.from({ length: SEGMENTS }, (_, i) => {
          const f = i / (SEGMENTS - 1)
          const on = i < lit
          return (
            <line key={i} x1={C} x2={C} y1={C - 131} y2={C - 113} transform={`rotate(${START + SWEEP * f} ${C} ${C})`}
              stroke={zone(f)} strokeWidth="4.4" strokeOpacity={on ? 1 : 0.14}
              className={on ? "hud-seg" : undefined} style={on ? { animationDelay: `${(0.15 + (i / SEGMENTS) * 1.35).toFixed(2)}s` } : undefined} />
          )
        })}

        {/* inner rings + glow */}
        <circle cx={C} cy={C} r="96" fill="url(#hud-core)" />
        <circle cx={C} cy={C} r="92" fill="none" stroke="#1d3025" strokeWidth="1.5" />
        <circle cx={C} cy={C} r="86" fill="none" stroke="#b6ff3c" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="2 6" />

        {/* pointer */}
        <g className="hud-needle" color={color} style={{ "--needle": `${START + SWEEP * (idle ? 0 : p)}deg` } as React.CSSProperties}>
          <polygon points={`${C},${C - 108} ${C - 8},${C - 94} ${C + 8},${C - 94}`} fill={color} />
        </g>

        {/* open / full labels + digital readout in the gap of the dial */}
        <text x="112" y="346" textAnchor="middle" className="hud-gauge-cap">{lowLabel}</text>
        <text x="288" y="346" textAnchor="middle" className="hud-gauge-cap">{highLabel}</text>
        <rect x="150" y="331" width="100" height="30" rx="8" fill="#050b08" stroke={color} strokeOpacity="0.55" />
        <text x={C} y="347" textAnchor="middle" dominantBaseline="central" className="hud-gauge-pct" fill={color}>{idle ? "—" : `${Math.round(p * 100)}%`}</text>
      </svg>
      <div className="absolute inset-[29%] flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  )
}

/** Small round dial for each course row: a 270° arc around the date. */
export function MiniDial({ pct, tone, children }: { pct: number; tone: Tone; children: React.ReactNode }) {
  const p = Math.min(1, Math.max(0, pct))
  const color = TONE_HEX[tone]
  const d = "M 16.54 67.46 A 36 36 0 1 1 67.46 67.46"
  return (
    <div className="relative size-[5.25rem] shrink-0">
      <svg viewBox="0 0 84 84" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <circle cx="42" cy="42" r="41" fill="#050b08" stroke="#1c2d24" />
        <path d={d} pathLength={100} fill="none" stroke="#1c2d24" strokeWidth="4" strokeLinecap="round" />
        {p > 0 && (
          <path className="hud-mini-arc" d={d} pathLength={100} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(p * 100).toFixed(1)} 100`} />
        )}
      </svg>
      <div className="absolute inset-[16%] flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  )
}
