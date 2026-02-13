import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth";
import { apiUrl } from "@/lib/actions/constants";

export async function GET() {
  try {
    const token = await getAccessToken();
    const headers: HeadersInit = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const [
      depts,
      grades,
      designations,
      marital,
      statuses,
      branches,
      states,
      equipments,
      workingHours,
      leaves,
      qualifications,
      institutes,
      countries,
      employees,
    ] = await Promise.all([
      fetch(apiUrl("/departments"), { headers, cache: "no-store" })
        .then((r) => r.json())
        .catch(() => ({ status: false, data: [] })),
      fetch(apiUrl("/employee-grades"), { headers, cache: "no-store" })
        .then((r) => r.json())
        .catch(() => ({ status: false, data: [] })),
      fetch(apiUrl("/designations"), { headers, cache: "no-store" })
        .then((r) => r.json())
        .catch(() => ({ status: false, data: [] })),
      fetch(apiUrl("/marital-statuses"), { headers, cache: "no-store" })
        .then((r) => r.json())
        .catch(() => ({ status: false, data: [] })),
      fetch(apiUrl("/employee-statuses"), { headers, cache: "no-store" })
        .then((r) => r.json())
        .catch(() => ({ status: false, data: [] })),
      fetch(apiUrl("/branches"), { headers, cache: "no-store" })
        .then((r) => r.json())
        .catch(() => ({ status: false, data: [] })),
      fetch(apiUrl("/states"), { headers, cache: "no-store" })
        .then((r) => r.json())
        .catch(() => ({ status: false, data: [] })),
      fetch(apiUrl("/equipments"), { headers, cache: "no-store" })
        .then((r) => r.json())
        .catch(() => ({ status: false, data: [] })),
      fetch(apiUrl("/working-hours-policies"), { headers, cache: "no-store" })
        .then((r) => r.json())
        .catch(() => ({ status: false, data: [] })),
      fetch(apiUrl("/leaves-policies"), { headers, cache: "no-store" })
        .then((r) => r.json())
        .catch(() => ({ status: false, data: [] })),
      fetch(apiUrl("/qualifications"), { headers, cache: "no-store" })
        .then((r) => r.json())
        .catch(() => ({ status: false, data: [] })),
      fetch(apiUrl("/institutes"), { headers, cache: "no-store" })
        .then((r) => r.json())
        .catch(() => ({ status: false, data: [] })),
      fetch(apiUrl("/countries"), { headers, cache: "no-store" })
        .then((r) => r.json())
        .catch(() => ({ status: false, data: [] })),
      fetch(apiUrl("/employees"), { headers, cache: "no-store" })
        .then((r) => r.json())
        .catch(() => ({ status: false, data: [] })),
    ]);
    return NextResponse.json({
      status: true,
      data: {
        departments: depts.data || [],
        employeeGrades: grades.data || [],
        designations: designations.data || [],
        maritalStatuses: marital.data || [],
        employeeStatuses: statuses.data || [],
        branches: branches.data || [],
        states: states.data || [],
        equipments: equipments.data || [],
        workingHoursPolicies: workingHours.data || [],
        leavesPolicies: leaves.data || [],
        qualifications: qualifications.data || [],
        institutes: institutes.data || [],
        countries: countries.data || [],
        employees: employees.data || [],
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: error?.message || "Failed to load data" },
      { status: 500 }
    );
  }
}
