import { Suspense } from "react";
import DealerCreateWarrantySalePage from "./DealerCreateWarrantySalePage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DealerCreateWarrantySalePage />
    </Suspense>
  );
}
