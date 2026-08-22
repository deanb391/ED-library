// page.tsx (Server Component)
import { Suspense } from "react";
import VerifyPaymentPage from './verifyPage';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading checkout...</div>}>
      <VerifyPaymentPage />
    </Suspense>
  );
}