// page.tsx (Server Component)
import { Suspense } from "react";
import SecureCheckoutClient from './SecureCheckoutClient';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading checkout...</div>}>
      <SecureCheckoutClient />
    </Suspense>
  );
}