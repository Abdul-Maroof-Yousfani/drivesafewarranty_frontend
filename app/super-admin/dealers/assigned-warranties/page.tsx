"use client";

import { useEffect, useState } from "react";
import { getWarrantySalesAction, WarrantySale } from "@/lib/actions/warranty-sales";
import { getDealers, Dealer } from "@/lib/actions/dealer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import {
  FileText,
  Loader2,
  Search,
  Settings,
  ShieldCheck,
  Calendar,
  Plus
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AssignedWarrantiesPage() {
  const [loadingSales, setLoadingSales] = useState(false);
  const [sales, setSales] = useState<WarrantySale[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [selectedDealerId, setSelectedDealerId] = useState<string>("");

  useEffect(() => {
    loadDealers();
  }, []);

  useEffect(() => {
    if (selectedDealerId) {
      loadSales(selectedDealerId === "all" ? undefined : selectedDealerId);
    } else {
      setSales([]);
    }
  }, [selectedDealerId]);

  const loadDealers = async () => {
    const res = await getDealers();
    if (res.status && res.data) {
      setDealers(res.data);
    }
  };

  const loadSales = async (dealerId?: string) => {
    setLoadingSales(true);
    const res = await getWarrantySalesAction();
    if (res.status && res.data) {
      // Filter for assignments: dealerId matches AND customerId is NULL
      let filtered = res.data.filter((s) => !s.customerId && !!s.dealerId);
      if (dealerId) {
        filtered = filtered.filter((s) => s.dealerId === dealerId);
      }
      setSales(filtered);
    }
    setLoadingSales(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Warranties Assigned</h1>
        <p className="text-muted-foreground mt-2">
            View packages and warranties directly assigned to dealers.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Dealer Assignments</CardTitle>
          <div className="flex items-center gap-4">
            <div className="w-[300px]">
              <Select
                value={selectedDealerId}
                onValueChange={setSelectedDealerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a dealer..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dealers</SelectItem>
                  {dealers.map((dealer) => (
                    <SelectItem key={dealer.id} value={dealer.id}>
                      {dealer.businessNameLegal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button asChild>
              <Link href={`/super-admin/warranty-sales/create${selectedDealerId && selectedDealerId !== "all" ? `?dealerId=${selectedDealerId}` : ""}`}>
                <Plus className="h-4 w-4 mr-2" />
                Assign Warranty
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedDealerId ? (
            <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-12">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <h3 className="text-xl font-medium">No Dealer Selected</h3>
              <p className="mt-2 max-w-sm mx-auto">
                Please select a dealer from the dropdown above to view the packages
                assigned to them.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {loadingSales ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                </div>
              ) : sales.length === 0 ? (
                <div className="text-center p-12 text-muted-foreground border rounded-lg bg-slate-50/50">
                  No warranties found for this selection.
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Policy #</TableHead>
                        <TableHead>Assignment Date</TableHead>
                        <TableHead>Dealer</TableHead>
                        <TableHead>Package</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sales.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell className="font-medium text-black">
                            {sale.policyNumber}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm">
                              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                              {new Date(sale.saleDate).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {sale.dealer?.businessNameLegal}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {sale.dealer?.email}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <ShieldCheck className="h-4 w-4 mr-2 text-emerald-500" />
                              {sale.packageName || sale.warrantyPackage?.name || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell>
                             {sale.planMonths ? `${sale.planMonths} Months` : (sale.price12Months ? "12 Months" : sale.price24Months ? "24 Months" : "36 Months")}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={sale.status === "active" ? "default" : "secondary"}
                              className={sale.status === "active" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : ""}
                            >
                              {sale.status.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/super-admin/warranty-sales/edit/${sale.id}`}>
                                <Settings className="h-4 w-4 mr-2" />
                                Manage
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
