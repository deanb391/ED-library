"use client";

import Script from "next/script";

export default function NativeBanner() {
  return (
    <div className="w-full my-6">
      <Script
        src="https://pl28537929.effectivegatecpm.com/848bf0c3fd9718e04131abf0f3488c1c/invoke.js"
        strategy="afterInteractive"
        data-cfasync="false"
      />
      <div id="container-848bf0c3fd9718e04131abf0f3488c1c" />
    </div>
  );
}
