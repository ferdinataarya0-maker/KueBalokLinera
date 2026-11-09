'use client';

import React from 'react';
import { Info, SlidersHorizontal } from 'lucide-react';

interface LambdaControlProps {
  lambda: number;
  onChange: (value: number) => void;
}

export default function LambdaControl({ lambda, onChange }: LambdaControlProps) {
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val >= 0 && val <= 1) {
      onChange(Math.round(val * 100) / 100);
    }
  };

  const presets = [0.0, 0.25, 0.5, 0.75, 1.0];

  return (
    <div
      className="card-warm p-5"
      style={{ borderLeft: '4px solid var(--secondary)' }}
    >
      <div className="flex items-start gap-3 flex-wrap">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'var(--peach-100)' }}
        >
          <SlidersHorizontal size={18} style={{ color: 'var(--accent)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
              Parameter λ (Lambda) WASPAS
            </h3>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold font-tabular"
              style={{ backgroundColor: 'var(--peach-100)', color: 'var(--accent)' }}
            >
              λ = {lambda.toFixed(2)}
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Mengatur bobot antara WSM (λ) dan WPM (1−λ). λ = 0.5 artinya bobot WSM dan WPM seimbang.
          </p>

          <div className="flex items-center gap-4 mt-4 flex-wrap">
            <div className="flex-1 min-w-48">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={lambda}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: 'var(--accent)' }}
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                <span>0 (WPM penuh)</span>
                <span>0.5 (seimbang)</span>
                <span>1 (WSM penuh)</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {presets.map((p) => (
                <button
                  key={`preset-${p}`}
                  onClick={() => onChange(p)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150"
                  style={{
                    backgroundColor: lambda === p ? 'var(--accent)' : 'var(--muted)',
                    color: lambda === p ? 'var(--accent-foreground)' : 'var(--muted-foreground)',
                    border: lambda === p ? '1px solid var(--accent)' : '1px solid var(--border)',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Input manual:
              </label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={lambda}
                onChange={handleInput}
                className="input-warm w-20 px-3 py-1.5 text-sm font-tabular text-center"
              />
            </div>
          </div>
        </div>

        <div
          className="flex items-start gap-2 text-xs p-3 rounded-lg"
          style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}
        >
          <Info size={14} className="flex-shrink-0 mt-0.5" />
          <span>Ubah λ untuk melihat perubahan hasil ranking WASPAS secara otomatis.</span>
        </div>
      </div>
    </div>
  );
}