import { getDepartments } from "@/lib/actions/department";
import { SubDepartmentAddForm } from "./sub-department-add-form";

export default async function AddSubDepartmentPage() {
  const { data: departments } = await getDepartments();

  return <SubDepartmentAddForm departments={departments || []} />;
}
