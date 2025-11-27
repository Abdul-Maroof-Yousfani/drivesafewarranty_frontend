import { getDepartments } from "@/lib/actions/department";
import { DepartmentList } from "./department-list";

export default async function DepartmentListPage() {
  const { data: departments } = await getDepartments();

  return <DepartmentList initialDepartments={departments || []} />;
}
