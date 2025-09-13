import React, { useMemo } from 'react'

// Simple responsive SVG line chart for percentages (0-100)
// props: data: [{ date: 'YYYY-MM-DD', rate: number }], height, stroke, fill
export default function LineChart({ data = [], height = 220, stroke = '#6C5CE7', fill = 'rgba(108,92,231,0.15)' }) {
  const { points, areaPath, yTicks, minX, maxX } = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return { points: '', areaPath: '', yTicks: [0,25,50,75,100], minX: 0, maxX: 1 }
    }
    const padding = { top: 16, right: 12, bottom: 24, left: 28 }
    const w = 600 // viewBox width
    const h = height
    const xMin = 0
    const xMax = data.length - 1
    const yMin = 0
    const yMax = 100

    const x = (i) => padding.left + (i - xMin) / (xMax - xMin || 1) * (w - padding.left - padding.right)
    const y = (v) => padding.top + (1 - (v - yMin) / (yMax - yMin || 1)) * (h - padding.top - padding.bottom)

    const coords = data.map((d, i) => [x(i), y(d.rate || 0)])
    const pointsAttr = coords.map(([xv, yv]) => `${xv},${yv}`).join(' ')
    const area = `M ${x(0)} ${y(0)} L ${coords.map(([xv,yv])=>`${xv} ${yv}`).join(' L ')} L ${x(xMax)} ${y(0)} Z`

    return { points: pointsAttr, areaPath: area, yTicks: [0,25,50,75,100], minX: xMin, maxX: xMax }
  }, [data, height])

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 600 ${height}`} width="100%" height={height}>
        {/* Grid */}
        {yTicks.map((t, idx) => (
          <line key={idx} x1="28" x2="588" y1={(16 + (1 - t/100) * (height - 16 - 24))} y2={(16 + (1 - t/100) * (height - 16 - 24))} stroke="#E5E7EB" strokeDasharray="4 4" />
        ))}
        {/* Area */}
        <path d={areaPath} fill={fill} />
        {/* Line */}
        <polyline fill="none" stroke={stroke} strokeWidth="2.5" points={points} />
        {/* Axes labels (Y only for simplicity) */}
        {yTicks.map((t, idx) => (
          <text key={idx} x="4" y={(16 + (1 - t/100) * (height - 16 - 24)) + 4} fontSize="10" fill="#6B7280">{t}%</text>
        ))}
      </svg>
    </div>
  )
}
