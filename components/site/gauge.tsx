// The focal point: a flat dial showing how full the next course is.
// Pure SVG + CSS (no client JS): one track, one colored arc, one needle. No gradients.
export type Tone = "open" | "low" | "full" | "idle"
export const TONE_HEX: Record<Tone, string> = { open: "#3b7a0a", low: "#a86300", full: "#b20809", idle: "#6b7563" }

const C = 200
const START = -135
const SWEEP = 270
const R = 150
// 270° arc from bottom-left to bottom-right (clockwise), radius R around (C, C)
const ARC = "M 93.93 306.07 A 150 150 0 1 1 306.07 306.07"

const zone = (f: number): Tone => (f < 0.6 ? "open" : f < 0.85 ? "low" : "full")

export function Gauge({
  pct, tone, lowLabel, highLabel, children,
}: { pct: number; tone: Tone; lowLabel: string; highLabel: string; children: React.ReactNode }) {
  const p = Math.min(1, Math.max(0, pct))
  const idle = tone === "idle"
  const color = idle ? TONE_HEX.idle : TONE_HEX[zone(p)]
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[430px]">
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {/* face */}
        <circle cx={C} cy={C} r="190" style={{ fill: "var(--panel)", stroke: "var(--line)" }} strokeWidth="2" />

        {/* 5 ticks: 0 · 25 · 50 · 75 · 100 */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={C} x2={C} y1={C - 176} y2={C - 164} transform={`rotate(${START + (SWEEP * i) / 4} ${C} ${C})`}
            style={{ stroke: "var(--muted)" }} strokeWidth="3" strokeLinecap="round" />
        ))}

        {/* track + progress arc */}
        <path d={ARC} pathLength={100} fill="none" style={{ stroke: "var(--line)" }} strokeWidth="14" strokeLinecap="round" />
        {!idle && p > 0 && (
          <path className="hud-arc" d={ARC} pathLength={100} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" strokeDasharray={`${(p * 100).toFixed(1)} 100`} />
        )}

        {/* needle */}
        <g className="hud-needle" style={{ "--needle": `${START + SWEEP * (idle ? 0 : p)}deg` } as React.CSSProperties}>
          <line x1={C} x2={C} y1={C - R + 32} y2={C - R + 12} style={{ stroke: "var(--ink)" }} strokeWidth="5" strokeLinecap="round" />
        </g>

        {/* open / full labels + percentage in the gap of the dial */}
        <text x="112" y="352" textAnchor="middle" className="hud-gauge-cap">{lowLabel}</text>
        <text x="288" y="352" textAnchor="middle" className="hud-gauge-cap">{highLabel}</text>
        <text x={C} y="344" textAnchor="middle" dominantBaseline="central" className="hud-gauge-pct" fill={color}>{idle ? "—" : `${Math.round(p * 100)}%`}</text>
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
        <circle cx="42" cy="42" r="41" style={{ fill: "var(--bg)", stroke: "var(--line)" }} />
        <path d={d} pathLength={100} fill="none" style={{ stroke: "var(--line)" }} strokeWidth="4" strokeLinecap="round" />
        {p > 0 && (
          <path className="hud-arc" d={d} pathLength={100} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(p * 100).toFixed(1)} 100`} />
        )}
      </svg>
      <div className="absolute inset-[16%] flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  )
}
