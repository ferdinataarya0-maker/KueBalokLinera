'use client';

import React from 'react';
import PanelLayout from '@/components/PanelLayout';

interface Props {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function AdminLayout(props: Props) {
  return <PanelLayout role="admin" {...props} />;
}
