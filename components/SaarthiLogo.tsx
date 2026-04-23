import React from 'react';

type SaarthiLogoProps = {
  size?: number;
  className?: string;
};

export const SaarthiLogo: React.FC<SaarthiLogoProps> = ({ size = 32, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Saarthi"
  >
    <rect width="48" height="48" rx="12" fill="#16a34a" />
    <text
      x="24"
      y="33"
      textAnchor="middle"
      fontSize="26"
      fontWeight="bold"
      fill="white"
      fontFamily="Inter, sans-serif"
    >
      S
    </text>
  </svg>
);
