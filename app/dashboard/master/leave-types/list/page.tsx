import { getLeaveTypes } from "@/lib/actions/leave-type";
import { LeaveTypeList } from "./leave-type-list";

export default async function LeaveTypeListPage({
  searchParams,
}: {
  searchParams: Promise<{ newItemId?: string }>;
}) {
  const { newItemId } = await searchParams;
  const { data: leaveTypes } = await getLeaveTypes();

  return <LeaveTypeList initialLeaveTypes={leaveTypes || []} newItemId={newItemId} />;
}
