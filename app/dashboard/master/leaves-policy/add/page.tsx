"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LeavesPolicyForm, LeavesPolicyFormData } from "./leaves-policy-form";
import { createLeavesPolicy } from "@/lib/actions/leaves-policy";

export default function AddLeavesPolicyPage() {
  const router = useRouter();

  const handleSubmit = async (data: LeavesPolicyFormData) => {
    const result = await createLeavesPolicy(data);
    if (result.status) {
      toast.success(result.message);
      router.push("/dashboard/master/leaves-policy/list");
    } else {
      toast.error(result.message);
    }
  };

  return <LeavesPolicyForm onSubmit={handleSubmit} />;
}
