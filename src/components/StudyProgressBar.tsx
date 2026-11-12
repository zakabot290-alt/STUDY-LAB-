import React from 'react';

interface StudyProgressBarProps {
  progress: number; // 0 to 1
  className?: string;
  color?: string;
  trackColor?: string;
  height?: string;
}

export const StudyProgressBar: React.FC<StudyProgressBarProps> = ({
  progress,
  className = '',
  color = 'bg-[#42A5E8]',
  trackColor = 'bg-[#202333]',
  height = 'h-2',
}) => {
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress * 100)));

  return (
    <div className={`w-full overflow-hidden rounded-full ${trackColor} ${height} ${className}`}>
      <div
        className={`${height} rounded-full transition-all duration-500 ease-out ${color}`}
        style={{ width: `${clampedProgress}%` }}
      />
    </div>
  );
};
