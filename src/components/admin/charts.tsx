import { formatCompactBDT } from "@/lib/utils";

interface TrendPoint {
  label: string;
  value: number;
}

export function DonationTrendChart({ data }: { data: TrendPoint[] }) {
  const width = 620;
  const height = 230;
  const padding = { top: 18, right: 16, bottom: 30, left: 52 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(...data.map((point) => point.value), 1);
  const roundedMax = Math.ceil(maxValue / 10000) * 10000 || 10000;

  const points = data.map((point, index) => {
    const x =
      padding.left +
      (data.length === 1 ? innerWidth / 2 : (index / (data.length - 1)) * innerWidth);
    const y =
      padding.top + innerHeight - (point.value / roundedMax) * innerHeight;
    return { ...point, x, y };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${padding.top + innerHeight} L ${points[0].x} ${padding.top + innerHeight} Z`
      : "";

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label="Verified donation totals over the last six months"
      >
        <defs>
          <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#138B60" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#138B60" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {gridLines.map((ratio) => {
          const y = padding.top + innerHeight * ratio;
          const value = roundedMax * (1 - ratio);
          return (
            <g key={ratio}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke="#E2E8F0"
                strokeDasharray={ratio === 1 ? undefined : "4 5"}
              />
              <text
                x={padding.left - 8}
                y={y + 3.5}
                textAnchor="end"
                className="fill-slate-400 text-[10px]"
              >
                {formatCompactBDT(value)}
              </text>
            </g>
          );
        })}

        {areaPath && <path d={areaPath} fill="url(#trend-fill)" />}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="#138B60"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {points.map((point) => (
          <g key={point.label}>
            <circle
              cx={point.x}
              cy={point.y}
              r={4}
              fill="#FFFFFF"
              stroke="#138B60"
              strokeWidth={2.5}
            >
              <title>{`${point.label}: ${formatCompactBDT(point.value)}`}</title>
            </circle>
            <text
              x={point.x}
              y={height - 8}
              textAnchor="middle"
              className="fill-slate-500 text-[10px] font-medium"
            >
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

export function MethodDonut({
  slices,
  centerLabel,
  centerValue,
}: {
  slices: DonutSlice[];
  centerLabel: string;
  centerValue: string;
}) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
      <div className="relative size-40 shrink-0">
        <svg
          viewBox="0 0 140 140"
          className="size-full -rotate-90"
          role="img"
          aria-label={`${centerLabel}: ${centerValue}`}
        >
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="#F1F5F9"
            strokeWidth="16"
          />
          {slices.map((slice) => {
            const fraction = total > 0 ? slice.value / total : 0;
            const dash = fraction * circumference;
            const circle = (
              <circle
                key={slice.label}
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth="16"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              >
                <title>{`${slice.label}: ${formatCompactBDT(slice.value)}`}</title>
              </circle>
            );
            offset += dash;
            return circle;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-medium text-slate-muted">
            {centerLabel}
          </span>
          <span className="text-lg font-extrabold text-navy">{centerValue}</span>
        </div>
      </div>

      <ul className="w-full space-y-2 sm:w-auto sm:min-w-40">
        {slices.map((slice) => (
          <li key={slice.label} className="flex items-center gap-2.5 text-[11.5px]">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: slice.color }}
            />
            <span className="flex-1 text-slate-muted">{slice.label}</span>
            <span className="font-semibold text-ink">
              {total > 0 ? Math.round((slice.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
