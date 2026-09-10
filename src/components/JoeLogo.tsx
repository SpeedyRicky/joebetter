import React from 'react';

interface JoeLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
  variant?: 'solid' | 'gradient' | 'minimal';
}

/**
 * Human-crafted vector logo for Joe.
 * Features a minimalist, precision-engineered geometric monogram combining
 * an architectural "J" curve with an intelligent focal point and dynamic counter-form.
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
        aria-label="Craig AI Logo"
      >
        <defs>
          {/* Subtle architectural gradient: obsidian to deep slate in dark mode, crisp charcoal in light */}
          <linearGradient id="joeEmblemGradient" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="60%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          <linearGradient id="joeAccentGradient" x1="38" y1="12" x2="54" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>

          {/* Smooth container shadow */}
          <filter id="joeShadow" x="-10%" y="-10%" width="120%" height="125%" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.12" />
          </filter>
        </defs>

        {variant === 'minimal' ? (
          // Freeform Minimalist Vector Mark (no squircle frame)
          <g>
            {/* Upper horizontal architectural anchor */}
            <path
              d="M20 16H46C48.2 16 50 17.8 50 20C50 22.2 48.2 24 46 24H35V38C35 44.6 29.6 50 23 50C16.4 50 11 44.6 11 38C11 35.8 12.8 34 15 34C17.2 34 19 35.8 19 38C19 40.2 20.8 42 23 42C25.2 42 27 40.2 27 38V24H20C17.8 24 16 22.2 16 20C16 17.8 17.8 16 20 16Z"
              className="fill-neutral-900 dark:fill-neutral-100"
            />
            {/* Precision focus node */}
            <circle cx="45" cy="38" r="4.5" className="fill-blue-600 dark:fill-blue-400" />
          </g>
        ) : (
          // Distinctive Squircle Badge Mark
          <g filter="url(#joeShadow)">
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

            {/* The Signature "J" Architectural Glyph */}
            <path
              d="M38 18V36C38 41.5228 33.5228 46 28 46C22.4772 46 18 41.5228 18 36C18 34.3431 19.3431 33 21 33C22.6569 33 24 34.3431 24 36C24 38.2091 25.7909 40 28 40C30.2091 40 32 38.2091 32 36V18H38Z"
              fill="#FFFFFF"
            />

            {/* Dynamic Apex Crossbar */}
            <rect
              x="28"
              y="18"
              width="18"
              height="6"
              rx="3"
              fill="#FFFFFF"
            />

            {/* Distinctive Intelligent Orbit Dot (Blue Sapphire Accent) */}
            <circle
              cx="45"
              cy="34"
              r="4"
              fill="url(#joeAccentGradient)"
            />
            <circle
              cx="45"
              cy="34"
              r="1.8"
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
            Craig
          </span>
          <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-md bg-blue-500/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            AI
          </span>
        </div>
      )}
    </div>
  );
};
