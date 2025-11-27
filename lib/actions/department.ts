"use server";

import { revalidatePath } from "next/cache";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export interface Department {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  subDepartments?: SubDepartment[];
}

export interface SubDepartment {
  id: number;
  name: string;
  departmentId: number;
  department?: Department;
  createdAt: string;
  updatedAt: string;
}

// Department Actions
export async function getDepartments(): Promise<{ status: boolean; data: Department[] }> {
  try {
    const res = await fetch(`${API_BASE}/departments`, {
      cache: "no-store",
    });
    return res.json();
  } catch (error) {
    console.error("Failed to fetch departments:", error);
    return { status: false, data: [] };
  }
}

export async function getDepartmentById(id: number): Promise<{ status: boolean; data: Department | null }> {
  try {
    const res = await fetch(`${API_BASE}/departments/${id}`, {
      cache: "no-store",
    });
    return res.json();
  } catch (error) {
    console.error("Failed to fetch department:", error);
    return { status: false, data: null };
  }
}

export async function createDepartment(formData: FormData): Promise<{ status: boolean; message: string; data?: Department }> {
  const name = formData.get("name") as string;
  
  if (!name?.trim()) {
    return { status: false, message: "Name is required" };
  }

  try {
    const res = await fetch(`${API_BASE}/departments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    
    if (data.status) {
      revalidatePath("/dashboard/master/department");
    }
    
    return data;
  } catch (error) {
    return { status: false, message: "Failed to create department" };
  }
}

export async function updateDepartment(id: number, formData: FormData): Promise<{ status: boolean; message: string; data?: Department }> {
  const name = formData.get("name") as string;
  
  if (!name?.trim()) {
    return { status: false, message: "Name is required" };
  }

  try {
    const res = await fetch(`${API_BASE}/departments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    
    if (data.status) {
      revalidatePath("/dashboard/master/department");
    }
    
    return data;
  } catch (error) {
    return { status: false, message: "Failed to update department" };
  }
}

export async function deleteDepartment(id: number): Promise<{ status: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/departments/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    
    if (data.status) {
      revalidatePath("/dashboard/master/department");
    }
    
    return data;
  } catch (error) {
    return { status: false, message: "Failed to delete department" };
  }
}

// Sub-Department Actions
export async function getSubDepartments(): Promise<{ status: boolean; data: SubDepartment[] }> {
  try {
    const res = await fetch(`${API_BASE}/sub-departments`, {
      cache: "no-store",
    });
    return res.json();
  } catch (error) {
    console.error("Failed to fetch sub-departments:", error);
    return { status: false, data: [] };
  }
}

export async function getSubDepartmentsByDepartment(departmentId: number): Promise<{ status: boolean; data: SubDepartment[] }> {
  try {
    const res = await fetch(`${API_BASE}/sub-departments/department/${departmentId}`, {
      cache: "no-store",
    });
    return res.json();
  } catch (error) {
    console.error("Failed to fetch sub-departments:", error);
    return { status: false, data: [] };
  }
}

export async function createSubDepartment(formData: FormData): Promise<{ status: boolean; message: string; data?: SubDepartment }> {
  const name = formData.get("name") as string;
  const departmentId = formData.get("departmentId") as string;
  
  if (!name?.trim()) {
    return { status: false, message: "Name is required" };
  }
  if (!departmentId) {
    return { status: false, message: "Department is required" };
  }

  try {
    const res = await fetch(`${API_BASE}/sub-departments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, departmentId: parseInt(departmentId) }),
    });
    const data = await res.json();
    
    if (data.status) {
      revalidatePath("/dashboard/master/sub-department");
    }
    
    return data;
  } catch (error) {
    return { status: false, message: "Failed to create sub-department" };
  }
}

export async function updateSubDepartment(id: number, formData: FormData): Promise<{ status: boolean; message: string; data?: SubDepartment }> {
  const name = formData.get("name") as string;
  const departmentId = formData.get("departmentId") as string;
  
  if (!name?.trim()) {
    return { status: false, message: "Name is required" };
  }

  try {
    const res = await fetch(`${API_BASE}/sub-departments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, departmentId: departmentId ? parseInt(departmentId) : undefined }),
    });
    const data = await res.json();
    
    if (data.status) {
      revalidatePath("/dashboard/master/sub-department");
    }
    
    return data;
  } catch (error) {
    return { status: false, message: "Failed to update sub-department" };
  }
}

export async function deleteSubDepartment(id: number): Promise<{ status: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/sub-departments/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    
    if (data.status) {
      revalidatePath("/dashboard/master/sub-department");
    }
    
    return data;
  } catch (error) {
    return { status: false, message: "Failed to delete sub-department" };
  }
}

