"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { EmployeeForm } from "@/components/employee-form";
import type { Department, SubDepartment } from "@/lib/actions/department";
import type { EmployeeGrade } from "@/lib/actions/employee-grade";
import type { Designation } from "@/lib/actions/designation";
import type { MaritalStatus } from "@/lib/actions/marital-status";
import type { EmployeeStatus } from "@/lib/actions/employee-status";
import type { Branch } from "@/lib/actions/branch";
import type { State, City } from "@/lib/actions/city";
import type { Equipment } from "@/lib/actions/equipment";
import type { WorkingHoursPolicy } from "@/lib/actions/working-hours-policy";
import type { LeavesPolicy } from "@/lib/actions/leaves-policy";

export default function CreateEmployeePage() {
  // Dropdown data
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subDepartments, setSubDepartments] = useState<SubDepartment[]>([]);
  const [employeeGrades, setEmployeeGrades] = useState<EmployeeGrade[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [maritalStatuses, setMaritalStatuses] = useState<MaritalStatus[]>([]);
  const [employeeStatuses, setEmployeeStatuses] = useState<EmployeeStatus[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [workingHoursPolicies, setWorkingHoursPolicies] = useState<WorkingHoursPolicy[]>([]);
  const [leavesPolicies, setLeavesPolicies] = useState<LeavesPolicy[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Fetch dropdown data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const res = await fetch(`/api/data/employee-create`, { cache: "no-store" });
        const json = await res.json();
        if (json.status) {
          const d = json.data || {};
          setDepartments(d.departments || []);
          setEmployeeGrades(d.employeeGrades || []);
          setDesignations(d.designations || []);
          setMaritalStatuses(d.maritalStatuses || []);
          setEmployeeStatuses(d.employeeStatuses || []);
          setBranches(d.branches || []);
          setStates(d.states || []);
          setEquipments(d.equipments || []);
          setWorkingHoursPolicies(d.workingHoursPolicies || []);
          setLeavesPolicies(d.leavesPolicies || []);
        } else {
          toast.error(json.message || "Failed to load form data");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load form data");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  return (
    <EmployeeForm
      mode="create"
      departments={departments}
      subDepartments={subDepartments}
      employeeGrades={employeeGrades}
      designations={designations}
      maritalStatuses={maritalStatuses}
      employeeStatuses={employeeStatuses}
      branches={branches}
      states={states}
      cities={cities}
      equipments={equipments}
      workingHoursPolicies={workingHoursPolicies}
      leavesPolicies={leavesPolicies}
      loadingData={loadingData}
    />
  );
}
