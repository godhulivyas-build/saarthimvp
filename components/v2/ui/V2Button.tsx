import React from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  fullWidth?: boolean;
  bilingual?: { primary: string; secondary?: string };
};

export const V2Button: React.FC<Props> = ({
  variant = 'primary',
  fullWidth,
  bilingual,
  className = '',
  children,
  type = 'button',
  ...rest
}) => {
  const base = 'inline-flex flex-col items-center justify-center gap-0.5 font-bold transition-all disabled:opacity-50 disabled:pointer-events-none';
  const w = fullWidth ? 'w-full' : '';
  const styles: Record<Variant, string> = {
    primary: 'saarthi-cta-primary px-6 py-3',
    secondary:
      'min-h-[52px] rounded-2xl px-6 bg-[var(--saarthi-secondary-container)] text-[var(--saarthi-on-secondary)] shadow-md hover:brightness-105',
    outline:
      'min-h-[52px] rounded-2xl px-6 border-2 border-[var(--saarthi-primary)] text-[var(--saarthi-primary)] bg-white hover:bg-[var(--saarthi-surface-low)]',
    ghost: 'min-h-[48px] rounded-xl px-4 text-[var(--saarthi-primary)] hover:bg-white/60',
  };

  return (
    <button type={type} className={`${base} ${styles[variant]} ${w} ${className}`.trim()} {...rest}>
      {bilingual ? (
        <>
          <span className="text-[15px] leading-tight">{bilingual.primary}</span>
          {bilingual.secondary ? (
            <span className="text-[11px] font-semibold opacity-90 leading-tight">{bilingual.secondary}</span>
          ) : null}
        </>
      ) : (
        children
      )}
    </button>
  );
};
