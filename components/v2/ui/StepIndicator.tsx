import React from 'react';

type Props = {
  total: number;
  current: number;
  className?: string;
};

export const StepIndicator: React.FC<Props> = ({ total, current, className = '' }) => (
  <div className={`flex items-center justify-center gap-1.5 ${className}`.trim()} role="list" aria-label="Progress">
    {Array.from({ length: total }, (_, i) => {
      const n = i + 1;
      const done = n < current;
      const active = n === current;
      return (
        <div
          key={n}
          role="listitem"
          className={`h-2 rounded-full transition-all duration-300 ${
            active ? 'w-8 bg-[var(--saarthi-primary)]' : done ? 'w-2 bg-[var(--saarthi-primary-container)]' : 'w-2 bg-[var(--saarthi-surface-highest)]'
          }`}
          aria-current={active ? 'step' : undefined}
        />
      );
    })}
  </div>
);
