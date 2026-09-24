import React, { useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { ChartDataPoint } from '../types/garden';
import { CHART_DATA_24H, CHART_DATA_7D, CHART_DATA_30D } from '../data/mockGardenData';

type TimeRange = '24h' | '7d' | '30d';

interface SoilMoistureChartProps {
  currentMoisture?: number;
}

export const SoilMoistureChart: React.FC<SoilMoistureChartProps> = ({
  currentMoisture = 61,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  const data =
    timeRange === '24h'
      ? CHART_DATA_24H
      : timeRange === '7d'
      ? CHART_DATA_7D
      : CHART_DATA_30D;

  // Chart dimensions in viewBox coordinates
  const width = 640;
  const height = 220;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Compute SVG Points
  const getCoordinates = (index: number, value: number) => {
    const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
    // Moisture range 0 to 100%
    const y = paddingTop + chartHeight - (value / 100) * chartHeight;
    return { x, y };
  };

  const points = data.map((d, i) => getCoordinates(i, d.value));

  // Build smooth cubic bezier curve
  const createSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i != pts.length - 2 ? pts[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;

      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return d;
  };

  const linePath = createSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x},${
    paddingTop + chartHeight
  } L ${points[0].x},${paddingTop + chartHeight} Z`;

  // Default active highlight marker (~20h/21h in 24h view like screenshot)
  const defaultHighlightIndex = timeRange === '24h' ? 10 : data.length - 1;
  const defaultHighlightCoord = points[defaultHighlightIndex];

  // Y-axis grid levels
  const yTicks = [
    { label: '100%', val: 100 },
    { label: '75%', val: 75 },
    { label: '50%', val: 50 },
    { label: '25%', val: 25 },
    { label: '00h', val: 0 }, // matches the visual '00h' or '0%' from image
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
      {/* Top Header & Range Switcher */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
          UMIDADE DO SOLO
        </span>

        {/* Time Filter Segmented Control */}
        <div className="flex items-center p-1 bg-stone-100 rounded-xl">
          {(['24h', '7d', '30d'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => {
                setTimeRange(range);
                setHoveredPoint(null);
                setHoverPos(null);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                timeRange === range
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Main Metric Stat Display */}
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-3xl font-extrabold text-[#172b1d] tracking-tight tabular-nums">
          {currentMoisture}%
        </span>
        <div className="flex items-center gap-1 text-xs font-semibold text-[#1e6b39]">
          <ArrowUp className="w-3.5 h-3.5" />
          <span>4,2%</span>
          <span className="text-stone-400 font-normal ml-0.5">
            vs. período anterior
          </span>
        </div>
      </div>

      {/* Area Chart Container */}
      <div className="relative w-full aspect-[2.8/1] min-h-[190px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible select-none"
          onMouseLeave={() => {
            setHoveredPoint(null);
            setHoverPos(null);
          }}
        >
          <defs>
            <linearGradient id="moistureGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2c7847" stopOpacity="0.28" />
              <stop offset="85%" stopColor="#2c7847" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#2c7847" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines and Y-axis labels */}
          {yTicks.map((tick) => {
            const y = paddingTop + chartHeight - (tick.val / 100) * chartHeight;
            return (
              <g key={tick.label}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#f0f2ee"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[10px] fill-stone-400 font-medium select-none"
                >
                  {tick.label}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaPath} fill="url(#moistureGradient)" />

          {/* Smooth Line Curve */}
          <path
            d={linePath}
            fill="none"
            stroke="#2f7b49"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Default highlighted point or hover marker */}
          {defaultHighlightCoord && !hoveredPoint && (
            <g>
              <circle
                cx={defaultHighlightCoord.x}
                cy={defaultHighlightCoord.y}
                r="6"
                fill="#ffffff"
                stroke="#2f7b49"
                strokeWidth="2.5"
                className="drop-shadow-xs"
              />
              <circle
                cx={defaultHighlightCoord.x}
                cy={defaultHighlightCoord.y}
                r="2.5"
                fill="#2f7b49"
              />
            </g>
          )}

          {/* Active Hover Marker and Crosshair */}
          {hoverPos && (
            <g>
              <line
                x1={hoverPos.x}
                y1={paddingTop}
                x2={hoverPos.x}
                y2={paddingTop + chartHeight}
                stroke="#2f7b49"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                opacity="0.5"
              />
              <circle
                cx={hoverPos.x}
                cy={hoverPos.y}
                r="6.5"
                fill="#ffffff"
                stroke="#22643a"
                strokeWidth="3"
                className="drop-shadow-sm"
              />
            </g>
          )}

          {/* Interactive touch/hover zones across data points */}
          {data.map((item, idx) => {
            const coord = points[idx];
            return (
              <rect
                key={idx}
                x={coord.x - (chartWidth / data.length) / 2}
                y={paddingTop}
                width={chartWidth / data.length}
                height={chartHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => {
                  setHoveredPoint(item);
                  setHoverPos(coord);
                }}
              />
            );
          })}

          {/* X-axis labels at bottom */}
          {data
            .filter((_, idx) => {
              if (timeRange === '24h') return idx % 2 === 0; // 00h, 04h, 08h, 12h, 16h, 20h, 24h
              return true;
            })
            .map((item, i) => {
              const originalIndex = data.findIndex((d) => d === item);
              const coord = points[originalIndex];
              return (
                <text
                  key={i}
                  x={coord.x}
                  y={height - 8}
                  textAnchor="middle"
                  className="text-[10px] fill-stone-400 font-medium select-none"
                >
                  {item.label}
                </text>
              );
            })}
        </svg>

        {/* Hover Tooltip Popup */}
        {hoveredPoint && hoverPos && (
          <div
            className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 px-3 py-1.5 bg-[#172b1d] text-white text-xs rounded-xl shadow-lg border border-stone-700/40"
            style={{
              left: `${(hoverPos.x / width) * 100}%`,
              top: `${(hoverPos.y / height) * 100}%`,
            }}
          >
            <div className="font-bold tabular-nums text-emerald-300">
              {hoveredPoint.value}% umidade
            </div>
            <div className="text-[10px] text-stone-300">
              {hoveredPoint.time} • {hoveredPoint.status}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
