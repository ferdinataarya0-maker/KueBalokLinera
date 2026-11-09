'use client';

import React from 'react';
import { X } from 'lucide-react';

export function Card({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`card-warm ${className}`} style={{ padding: '1.25rem', ...style }}>
      {children}
    </div>
  );
}

export function CardHeader({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
      <div>
        <h2 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>{title}</h2>
        {desc && <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{desc}</p>}
      </div>
      {action}
    </div>
  );
}

export function Badge({ tone = 'neutral', children }: { tone?: 'neutral' | 'success' | 'warning' | 'error' | 'info'; children: React.ReactNode }) {
  const map = {
    neutral: ['var(--muted)', 'var(--muted-foreground)'],
    success: ['var(--success-bg)', 'var(--success)'],
    warning: ['var(--warning-bg)', 'var(--warning)'],
    error: ['var(--error-bg)', 'var(--error)'],
    info: ['var(--info-bg)', 'var(--info)'],
  } as const;
  const [bg, fg] = map[tone];
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: bg, color: fg }}>
      {children}
    </span>
  );
}

export function Btn({
  variant = 'primary',
  children,
  className = '',
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' }) {
  const base = variant === 'primary' ? 'btn-primary' : variant === 'secondary' ? 'btn-secondary' : '';
  return (
    <button
      {...rest}
      className={`${base} inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 ${className}`}
      style={variant === 'danger' ? { backgroundColor: 'var(--error-bg)', color: 'var(--error)' } : rest.style}
    >
      {children}
    </button>
  );
}

export function IconBtn({ title, onClick, children, danger }: { title: string; onClick: () => void; children: React.ReactNode; danger?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="p-1.5 rounded-md transition-colors"
      style={{ color: danger ? 'var(--error)' : 'var(--muted-foreground)', backgroundColor: danger ? 'var(--error-bg)' : 'var(--muted)' }}
    >
      {children}
    </button>
  );
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>{label}</span>
      {children}
      {hint && <span className="block text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{hint}</span>}
    </label>
  );
}

export function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 no-print" style={{ backgroundColor: 'rgba(59,31,10,0.45)' }} onClick={onClose}>
      <div className="card-warm w-full max-w-md max-h-[90dvh] overflow-y-auto animate-scale-in" style={{ padding: '1.25rem' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>{title}</h3>
          <button onClick={onClose} className="p-1 rounded-md" style={{ color: 'var(--muted-foreground)' }}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function DataTable({ head, children, empty }: { head: string[]; children: React.ReactNode; empty?: string }) {
  const hasRows = React.Children.count(children) > 0;
  return (
    <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid var(--border)' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ backgroundColor: 'var(--muted)' }}>
            {head.map((h, i) => (
              <th key={`h-${i}`} className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hasRows ? children : (
            <tr><td colSpan={head.length} className="text-center px-3 py-8" style={{ color: 'var(--muted-foreground)' }}>{empty ?? 'Belum ada data.'}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export const Td = ({ children, className = '', style }: { children?: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
  <td className={`px-3 py-2.5 ${className}`} style={{ borderTop: '1px solid var(--border)', color: 'var(--foreground)', ...style }}>{children}</td>
);

export function Loading() {
  return <div className="py-16 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>Memuat data…</div>;
}

export function StatCard({ label, value, sub, icon: IconC, color = 'var(--primary)', bg = 'var(--muted)' }: { label: string; value: string; sub?: string; icon: React.ElementType; color?: string; bg?: string }) {
  return (
    <div className="card-warm p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg, color }}>
        <IconC size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
        <p className="text-lg font-bold truncate" style={{ color: 'var(--foreground)' }}>{value}</p>
        {sub && <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{sub}</p>}
      </div>
    </div>
  );
}
