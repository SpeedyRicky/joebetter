import React from 'react';

interface JoeLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
  variant?: 'solid' | 'gradient' | 'minimal';
}

/**
 * Human-crafted vector logo for Gret.
 * Features a minimalist, precision-engineered geometric monogram combining
 * an architectural "G" glyph with an intelligent focal point and dynamic counter-form.
 * 100% vector, crisp on all displays, responsive to light & dark themes.
 */
export const JoeLogo: React.FC<JoeLogoProps> = ({
  size = 'md',
  className = '',
  showText = false,
  textClassName = '',
  variant = 'solid',
}) => {
  const getDimension = () => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'xs':
        return 18;
      case 'sm':
        return 24;
      case 'md':
        return 32;
      case 'lg':
        return 44;
      case 'xl':
        return 60;
      default:
        return 32;
    }
  };

  const dim = getDimension();

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Vector Emblem */}
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200"
        aria-label="Gret AI Logo"
      >
        <defs>
          {/* Subtle architectural gradient: obsidian to deep slate in dark mode, crisp charcoal in light */}
          <linearGradient id="gretEmblemGradient" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="60%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          <linearGradient id="gretAccentGradient" x1="38" y1="12" x2="54" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>

          {/* Smooth container shadow */}
          <filter id="gretShadow" x="-10%" y="-10%" width="120%" height="125%" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.12" />
          </filter>
        </defs>

        {variant === 'minimal' ? (
          // Freeform Minimalist Vector Mark (no squircle frame)
          <g>
            <path
              d="M 42 20 A 15 15 0 1 0 44 35 H 32"
              className="stroke-neutral-900 dark:stroke-neutral-100"
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Precision focus node */}
            <circle cx="43" cy="20" r="3" className="fill-blue-600 dark:fill-blue-400" />
          </g>
        ) : (
          // Distinctive Squircle Badge Mark
          <g filter="url(#gretShadow)">
            {/* Base Rounded Geometric Hexagon / Squircle Container */}
            <rect
              x="2"
              y="2"
              width="60"
              height="60"
              rx="16"
              className="fill-neutral-950 dark:fill-neutral-900 stroke-neutral-800/80 dark:stroke-neutral-700/60"
              strokeWidth="1.5"
            />

            {/* Subtle inner grid glow accent */}
            <path
              d="M18 18H46V46H18V18Z"
              className="stroke-white/5"
              strokeWidth="1"
              strokeDasharray="2 2"
            />

            {/* The Signature "G" Architectural Glyph */}
            <path
              d="M 42 20 A 15 15 0 1 0 44 35 H 32"
              stroke="#FFFFFF"
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Distinctive Intelligent Orbit Dot (Blue Sapphire Accent) */}
            <circle
              cx="43"
              cy="20"
              r="3.2"
              fill="url(#gretAccentGradient)"
            />
            <circle
              cx="43"
              cy="20"
              r="1.3"
              fill="#FFFFFF"
              opacity="0.9"
            />
          </g>
        )}
      </svg>

      {/* Optional Wordmark */}
      {showText && (
        <div className={`flex items-baseline gap-1.5 ${textClassName}`}>
          <span className="font-bold text-neutral-900 dark:text-neutral-100 tracking-tight leading-none text-base sm:text-lg">
            Gret
          </span>
          <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-md bg-blue-500/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            AI
          </span>
        </div>
      )}
    </div>
  );
};

export const GretLogo = JoeLogo;
