import { getSalaryBreakups } from "@/lib/actions/salary-breakup";
import { SalaryBreakupList } from "./salary-breakup-list";

export const dynamic = "force-dynamic";

export default async function SalaryBreakupListPage() {
  const result = await getSalaryBreakups();
  const items = result.status && result.data ? result.data : [];
  return <SalaryBreakupList initialSalaryBreakups={items} />;
}

