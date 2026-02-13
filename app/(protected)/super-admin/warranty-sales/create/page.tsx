import { Suspense } from "react";
import SuperAdminCreateWarrantySalePage from "./SuperAdminCreateWarrantySalePage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuperAdminCreateWarrantySalePage />
    </Suspense>
  );
}
