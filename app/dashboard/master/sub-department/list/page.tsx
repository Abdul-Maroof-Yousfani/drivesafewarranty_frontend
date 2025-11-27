import { getDepartments, getSubDepartments } from "@/lib/actions/department";
import { SubDepartmentList } from "./sub-department-list";

export default async function SubDepartmentListPage() {
  const [subDeptRes, deptRes] = await Promise.all([
    getSubDepartments(),
    getDepartments(),
  ]);

  return (
    <SubDepartmentList 
      initialSubDepartments={subDeptRes.data || []} 
      departments={deptRes.data || []} 
    />
  );
}
