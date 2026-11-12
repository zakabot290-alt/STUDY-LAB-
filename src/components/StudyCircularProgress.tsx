import React from 'react';

interface StudyCircularProgressProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  centerText?: string;
  subText?: string;
  className?: string;
}

export const StudyCircularProgress: React.FC<StudyCircularProgressProps> = ({
  progress,
  size = 72,
  strokeWidth = 6,
  color = '#42A5E8',
  trackColor = '#202333',
  centerText,
  subText,
  className = '',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const strokeDashoffset = circumference - clampedProgress * circumference;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {(centerText || subText) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {centerText && (
            <span className="text-xs font-bold tabular-nums text-[#F5F6FA]">
              {centerText}
            </span>
          )}
          {subText && (
            <span className="text-[9px] text-[#A0A5B5] leading-tight">
              {subText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
