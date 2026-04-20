// page.tsx (Server Component)
import { Suspense } from "react";
import VerifyTopUpPage from './verifyPage';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading checkout...</div>}>
      <VerifyTopUpPage />
    </Suspense>
  );
}