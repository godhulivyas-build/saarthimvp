import React from 'react';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  tonal?: boolean;
};

/** Surface “lift” per DESIGN.md — soft edge, no heavy grid lines. */
export const Card: React.FC<CardProps> = ({ tonal = false, className = '', children, ...rest }) => (
  <div className={`${tonal ? 'saarthi-card-tonal' : 'saarthi-card'} p-4 sm:p-5 ${className}`.trim()} {...rest}>
    {children}
  </div>
);
