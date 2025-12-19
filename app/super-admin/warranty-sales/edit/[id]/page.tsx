import { notFound } from "next/navigation";
import { getWarrantySaleByIdAction } from "@/lib/actions/warranty-sales";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WarrantySaleEditForm } from "./edit-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function WarrantySaleEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await getWarrantySaleByIdAction(id);
  if (!res.status || !res.data) {
    notFound();
  }
  const sale = res.data as any;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" asChild>
          <Link href="/super-admin/warranty-sales/list">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Warranty Sale</h1>
          <p className="text-muted-foreground mt-2">Update sale details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sale Information</CardTitle>
          <CardDescription>Modify fields and save changes</CardDescription>
        </CardHeader>
        <CardContent>
          <WarrantySaleEditForm sale={sale} />
        </CardContent>
      </Card>
    </div>
  );
}
