'use client';

import { BarChart3, Calculator, BookOpen } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


type TabId = 'overview' | 'saw' | 'waspas' | 'detail';

interface RankingTabsProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

const tabs = [
  { id: 'overview' as const, label: 'Ringkasan & Perbandingan', icon: BarChart3 },
  { id: 'saw' as const, label: 'Ranking SAW', icon: Calculator },
  { id: 'waspas' as const, label: 'Ranking WASPAS', icon: Calculator },
  { id: 'detail' as const, label: 'Detail Perhitungan', icon: BookOpen },
];

export default function RankingTabs({ activeTab, onChange }: RankingTabsProps) {
  return (
    <div
      className="flex items-center gap-1 p-1.5 rounded-xl overflow-x-auto scrollbar-thin"
      style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={`rtab-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-150 flex-shrink-0"
            style={{
              backgroundColor: isActive ? 'var(--primary)' : 'transparent',
              color: isActive ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
              boxShadow: isActive ? '0 2px 4px rgba(181,101,29,0.25)' : 'none',
            }}
          >
            <Icon size={15} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}