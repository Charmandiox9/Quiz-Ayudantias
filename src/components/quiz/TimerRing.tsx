import React from 'react';

interface TimerRingProps { remainingSeconds: number; totalSeconds?: number; size?: number; strokeWidth?: number }

export default function TimerRing({
  remainingSeconds,
  totalSeconds = 30,
  size = 64,
  strokeWidth = 5,
}: TimerRingProps) {
  const radius = size / 2 - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.max(0, Math.min(1, remainingSeconds / totalSeconds));
  const strokeDashoffset = circumference * (1 - ratio);

  // Color dinamico segun urgencia
  const getColor = () => {
    if (ratio > 0.5) return '#16A34A'; // Verde
    if (ratio > 0.25) return '#D97706'; // Ambar
    return '#DC2626'; // Rojo
  };

  const currentColor = getColor();

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={currentColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s linear, stroke 0.3s ease' }}
        />
      </svg>
      <span
        style={{
          position: 'absolute',
          fontFamily: 'Consolas, monospace',
          fontWeight: 800,
          fontSize: size * 0.32,
          color: currentColor,
        }}
      >
        {remainingSeconds}
      </span>
    </div>
  );
}
