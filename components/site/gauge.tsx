// The memorable element: an instrument-cluster gauge that shows how full the next course is.
const R = 120
const ARC = 2 * Math.PI * R * (270 / 360) // 565.49
export type Tone = "open" | "low" | "full" | "idle"
const COLOR: Record<Tone, string> = { open: "#86e10a", low: "#ffb224", full: "#ff5c61", idle: "#4b6178" }

export function Gauge({ pct, tone, children }: { pct: number; tone: Tone; children: React.ReactNode }) {
  const p = Math.min(1, Math.max(0, pct))
  const color = COLOR[tone]
  const ticks = Array.from({ length: 28 }, (_, i) => ({ a: -135 + i * (270 / 27), major: i % 3 === 0 }))
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[340px]">
      <svg viewBox="0 0 300 300" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {ticks.map((t, i) => (
          <line key={i} x1="150" x2="150" y1="10" y2={t.major ? 24 : 18} transform={`rotate(${t.a} 150 150)`} stroke={t.major ? "#4b6178" : "#27394b"} strokeWidth={t.major ? 2 : 1.5} strokeLinecap="round" />
        ))}
        <path d="M 65.15 234.85 A 120 120 0 1 1 234.85 234.85" fill="none" stroke="#16222f" strokeWidth="12" strokeLinecap="round" />
        <path
          className="gauge-arc"
          d="M 65.15 234.85 A 120 120 0 1 1 234.85 234.85"
          fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={ARC} strokeDashoffset={ARC * (1 - p)}
          style={{ filter: `drop-shadow(0 0 8px ${color}88)` }}
        />
        <g className="gauge-needle" style={{ "--needle": `${-135 + 270 * p}deg` } as React.CSSProperties}>
          <line x1="150" y1="60" x2="150" y2="34" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      </svg>
      <div className="absolute inset-[18%] flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  )
}
