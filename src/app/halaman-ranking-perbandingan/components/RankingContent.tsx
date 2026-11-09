'use client';

import { useDSSData } from '@/lib/dss-store';
import React, { useState } from 'react';
import {
  calculateSAW,
  calculateWASPAS,
  generateComparison,
} from '@/lib/dss-data';
import RankingTabs from './RankingTabs';
import RankingTableSAW from './RankingTableSAW';
import RankingTableWASPAS from './RankingTableWASPAS';
import RankingComparison from './RankingComparison';
import RankingConclusion from './RankingConclusion';
import RankingDetailAccordion from './RankingDetailAccordion';
import RankingComparisonChart from './RankingComparisonChart';
import LambdaControl from './LambdaControl';

export default function RankingContent() {
  const { alternatives: mockAlternatives, criteria: mockCriteria, assessments: mockAssessments, lambda, update } = useDSSData();
  // λ memakai nilai bersama (sama dengan Pengaturan, halaman WASPAS, dan halaman owner)
  const setLambda = (v: number) => update((s) => ({ ...s, lambda: v }));
  const [activeTab, setActiveTab] = useState<'overview' | 'saw' | 'waspas' | 'detail'>('overview');

  // Backend integration point: Replace with Supabase calculation_results query
  // Recalculate dynamically when lambda or data changes
  const sawResults = calculateSAW(mockAlternatives, mockCriteria, mockAssessments);
  const waspasResults = calculateWASPAS(mockAlternatives, mockCriteria, mockAssessments, lambda);
  const comparison = generateComparison(sawResults, waspasResults);

  const bestSAW = sawResults?.find((r) => r?.ranking === 1);
  const bestWASPAS = waspasResults?.find((r) => r?.ranking === 1);
  const isSameWinner = bestSAW?.alternativeId === bestWASPAS?.alternativeId;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Lambda Control */}
      <LambdaControl lambda={lambda} onChange={setLambda} />

      {/* Tabs */}
      <RankingTabs activeTab={activeTab} onChange={setActiveTab} />

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-slide-up">
          {/* Conclusion */}
          <RankingConclusion
            bestSAW={bestSAW}
            bestWASPAS={bestWASPAS}
            isSameWinner={isSameWinner}
            lambda={lambda}
          />

          {/* Comparison Chart */}
          <RankingComparisonChart
            sawResults={sawResults}
            waspasResults={waspasResults}
          />

          {/* Comparison Table */}
          <RankingComparison comparison={comparison} />
        </div>
      )}

      {/* SAW Tab */}
      {activeTab === 'saw' && (
        <div className="animate-slide-up">
          <RankingTableSAW results={sawResults} criteria={mockCriteria} />
        </div>
      )}

      {/* WASPAS Tab */}
      {activeTab === 'waspas' && (
        <div className="animate-slide-up">
          <RankingTableWASPAS results={waspasResults} criteria={mockCriteria} lambda={lambda} />
        </div>
      )}

      {/* Detail Tab */}
      {activeTab === 'detail' && (
        <div className="animate-slide-up">
          <RankingDetailAccordion
            alternatives={mockAlternatives}
            criteria={mockCriteria}
            assessments={mockAssessments}
            sawResults={sawResults}
            waspasResults={waspasResults}
            lambda={lambda}
          />
        </div>
      )}
    </div>
  );
}