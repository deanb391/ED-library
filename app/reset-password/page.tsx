import { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-6 bg-white dark:bg-gray-900">Loading...</div>}>
      <ResetPasswordClient />
    </Suspense>
  );
}
