import React from 'react';

type Props = {
  label?: string;
  hint?: string;
  id?: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const TextField: React.FC<Props> = ({ label, hint, id, className = '', ...input }) => (
  <div className={className}>
    {label ? (
      <label htmlFor={id} className="block text-sm font-bold text-[var(--saarthi-on-surface-variant)] mb-1.5">
        {label}
      </label>
    ) : null}
    <input id={id} className="saarthi-input" {...input} />
    {hint ? <p className="mt-1.5 text-xs text-[var(--saarthi-on-surface-variant)]">{hint}</p> : null}
  </div>
);
