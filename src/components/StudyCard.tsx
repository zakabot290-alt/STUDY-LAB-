import React from 'react';
import { soundEngine } from '../lib/soundEngine';

interface StudyCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'highlight';
  hoverEffect?: boolean;
}

export const StudyCard: React.FC<StudyCardProps> = ({
  children,
  className = '',
  onClick,
  variant = 'primary',
  hoverEffect = true,
}) => {
  const bgStyles = {
    primary: 'bg-[#151720] border-[#202333]/80',
    secondary: 'bg-[#202333] border-[#2c3247]/60',
    highlight: 'bg-gradient-to-br from-[#151720] to-[#1e2336] border-[#42A5E8]/30',
  }[variant];

  const handleClick = () => {
    if (onClick) {
      soundEngine.playClick();
      onClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative rounded-2xl border p-4 transition-all duration-200
        ${bgStyles}
        ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}
        ${hoverEffect && onClick ? 'hover:border-[#42A5E8]/40 hover:shadow-lg hover:shadow-[#42A5E8]/5' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
