"use client";

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import { Suspense } from 'react';

export default function AppProgressBar() {
  return (
    <Suspense fallback={null}>
      <ProgressBar
        height="4px"
        color="#2563eb"
        options={{ showSpinner: false }}
        shallowRouting
      />
    </Suspense>
  );
}
