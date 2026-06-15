// Lightweight, dependency-free SVG charts themed with the project's
// --chart-N design tokens. All are pure/presentational components.

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

function niceMax(value: number) {
  const pow = Math.pow(10, Math.floor(Math.log10(value)))
  return Math.ceil(value / pow) * pow
}

export function AreaChart({
  data,
  unitId = 'area',
}: {
  data: { label: string; value: number }[]
  unitId?: string
}) {
  const w = 640
  const h = 240
  const pad = { l: 40, r: 12, t: 16, b: 28 }
  const innerW = w - pad.l - pad.r
  const innerH = h - pad.t - pad.b
  const max = niceMax(Math.max(...data.map((d) => d.value)))
  const stepX = innerW / (data.length - 1)

  const pts = data.map((d, i) => ({
    x: pad.l + i * stepX,
    y: pad.t + innerH - (d.value / max) * innerH,
  }))

  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const area = `${line} L${pts[pts.length - 1].x},${pad.t + innerH} L${pts[0].x},${pad.t + innerH} Z`
  const gridLines = 4

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-56 w-full" role="img" aria-label="مخطط الزيارات">
      <defs>
        <linearGradient id={`grad-${unitId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {Array.from({ length: gridLines + 1 }).map((_, i) => {
        const y = pad.t + (innerH / gridLines) * i
        const val = Math.round(max - (max / gridLines) * i)
        return (
          <g key={i}>
            <line
              x1={pad.l}
              y1={y}
              x2={w - pad.r}
              y2={y}
              stroke="var(--border)"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
            <text
              x={pad.l - 8}
              y={y + 4}
              textAnchor="end"
              className="fill-muted-foreground"
              style={{ fontSize: 10 }}
            >
              {val >= 1000 ? `${val / 1000}k` : val}
            </text>
          </g>
        )
      })}

      <path d={area} fill={`url(#grad-${unitId})`} />
      <path
        d={line}
        fill="none"
        stroke="var(--chart-1)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="var(--chart-1)" />
      ))}
      {data.map((d, i) =>
        i % 2 === 0 ? (
          <text
            key={i}
            x={pad.l + i * stepX}
            y={h - 8}
            textAnchor="middle"
            className="fill-muted-foreground"
            style={{ fontSize: 10 }}
          >
            {d.label}
          </text>
        ) : null,
      )}
    </svg>
  )
}

export function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const w = 640
  const h = 240
  const pad = { l: 40, r: 12, t: 16, b: 30 }
  const innerW = w - pad.l - pad.r
  const innerH = h - pad.t - pad.b
  const max = niceMax(Math.max(...data.map((d) => d.value)))
  const slot = innerW / data.length
  const barW = slot * 0.55
  const gridLines = 4

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-56 w-full" role="img" aria-label="مخطط المشاهدات">
      {Array.from({ length: gridLines + 1 }).map((_, i) => {
        const y = pad.t + (innerH / gridLines) * i
        const val = Math.round(max - (max / gridLines) * i)
        return (
          <g key={i}>
            <line
              x1={pad.l}
              y1={y}
              x2={w - pad.r}
              y2={y}
              stroke="var(--border)"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
            <text
              x={pad.l - 8}
              y={y + 4}
              textAnchor="end"
              className="fill-muted-foreground"
              style={{ fontSize: 10 }}
            >
              {val >= 1000 ? `${val / 1000}k` : val}
            </text>
          </g>
        )
      })}
      {data.map((d, i) => {
        const barH = (d.value / max) * innerH
        const x = pad.l + i * slot + (slot - barW) / 2
        const y = pad.t + innerH - barH
        return (
          <g key={d.label}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx="4"
              fill="var(--chart-1)"
              opacity={i === data.length - 1 ? 1 : 0.55}
            />
            <text
              x={pad.l + i * slot + slot / 2}
              y={h - 10}
              textAnchor="middle"
              className="fill-muted-foreground"
              style={{ fontSize: 10 }}
            >
              {d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function DonutChart({
  data,
}: {
  data: { label: string; value: number }[]
}) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const radius = 60
  const stroke = 22
  const circ = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="flex flex-col items-center gap-5 xl:flex-row xl:gap-7">
      <svg viewBox="0 0 160 160" className="size-36 shrink-0 -rotate-90 sm:size-40">
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
        />
        {data.map((d, i) => {
          const len = (d.value / total) * circ
          const seg = (
            <circle
              key={d.label}
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={stroke}
              strokeDasharray={`${len} ${circ - len}`}
              strokeDashoffset={-offset}
            />
          )
          offset += len
          return seg
        })}
      </svg>
      <ul className="flex w-full min-w-0 flex-col gap-2.5">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-foreground">
              <span
                className="size-3 shrink-0 rounded-sm"
                style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
              />
              <span className="truncate">{d.label}</span>
            </span>
            <span className="shrink-0 font-mono tabular-nums text-muted-foreground">
              {d.value}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function MiniBars({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value))
  return (
    <ul className="flex flex-col gap-3">
      {data.map((d) => (
        <li key={d.label} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground">{d.label}</span>
            <span className="font-mono tabular-nums text-muted-foreground">{d.value}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
