"use client";

import { useEffect, useState } from "react";
import {
  getWarrantySalesAction,
  WarrantySale,
} from "@/lib/actions/warranty-sales";
import {
  getAllInvoicesAction,
  Invoice,
  updateInvoiceAction,
} from "@/lib/actions/invoices";
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
  CheckCircle,
  Search,
  Wallet,
  Banknote,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SuperAdminInvoicesPage() {
  const [loadingSales, setLoadingSales] = useState(true);
  const [sales, setSales] = useState<WarrantySale[]>([]);

  // Settlement tab state
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [selectedDealerId, setSelectedDealerId] = useState<string>("");

  // Calculate Summary Stats
  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce(
    (sum, inv) => sum + Number(inv.amount),
    0
  );

  const paidInvoicesList = invoices.filter((inv) => inv.status === "paid");
  const paidCount = paidInvoicesList.length;
  const paidAmount = paidInvoicesList.reduce(
    (sum, inv) => sum + Number(inv.amount),
    0
  );

  const pendingInvoicesList = invoices.filter(
    (inv) => inv.status === "pending"
  );
  const pendingCount = pendingInvoicesList.length;
  const pendingAmount = pendingInvoicesList.reduce(
    (sum, inv) => sum + Number(inv.amount),
    0
  );

  useEffect(() => {
    // Load initial data
    loadSales();
    loadDealers();
  }, []);

  useEffect(() => {
    // Load invoices when dealer selection changes
    if (selectedDealerId) {
      loadInvoices(selectedDealerId === "all" ? undefined : selectedDealerId);
    } else {
      setInvoices([]);
    }
  }, [selectedDealerId]);

  const loadSales = async () => {
    setLoadingSales(true);
    const res = await getWarrantySalesAction();
    if (res.status) {
      setSales(res.data as WarrantySale[]);
    }
    setLoadingSales(false);
  };

  const loadDealers = async () => {
    const res = await getDealers();
    if (res.status && res.data) {
      setDealers(res.data);
    }
  };

  const loadInvoices = async (dealerId?: string) => {
    setLoadingInvoices(true);
    const res = await getAllInvoicesAction({ dealerId }); // If dealerId is undefined, fetches all
    if (res.status && res.data) {
      // Filter to ensure we only show invoices that HAVE a dealerId (settlements)
      const settlementInvoices = res.data.invoices.filter(
        (inv) => !!inv.dealerId
      );
      setInvoices(settlementInvoices);
    }
    setLoadingInvoices(false);
  };

  const handleMarkAsPaid = async (invoiceId: string, dealerId?: string) => {
    try {
      const res = await updateInvoiceAction(
        invoiceId,
        { status: "paid" },
        dealerId
      );
      if (res.status) {
        toast.success("Settlement marked as paid");
        loadInvoices(selectedDealerId === "all" ? undefined : selectedDealerId); // Refresh list
      } else {
        toast.error(res.message || "Failed to update status");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Invoice History</h1>
        <p className="text-muted-foreground mt-2">
          View and download invoices for all warranty sales.
        </p>
      </div>

      <Tabs defaultValue="customers" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="customers">Customer Invoices</TabsTrigger>
          <TabsTrigger value="settlements">Dealer Settlements</TabsTrigger>
        </TabsList>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Customer Sales Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSales ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : sales.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                  No sales records found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Policy #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Dealer (Seller)</TableHead>
                      <TableHead>Customer (Buyer)</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead>Sale Price</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Customer Invoices: sales TO customers */}
                    {sales
                      .filter((s: WarrantySale) => !!s.customerId)
                      .map((sale: WarrantySale) => (
                        <TableRow key={sale.id}>
                          <TableCell className="font-medium text-blue-600">
                            {sale.policyNumber}
                          </TableCell>
                          <TableCell>
                            {new Date(sale.saleDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {sale.dealer ? (
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {sale.dealer.businessNameLegal}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {sale.dealer.email}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground italic">
                                Drive Safe (Direct)
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {sale.customer ? (
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {sale.customer.firstName}{" "}
                                  {sale.customer.lastName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {sale.customer.email}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {sale.warrantyPackage?.name || "N/A"}
                          </TableCell>
                          <TableCell className="font-bold">
                            {formatCurrency(sale.warrantyPrice)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button asChild variant="outline" size="sm">
                              <Link
                                href={`/invoices/${sale.id}`}
                                target="_blank"
                              >
                                <FileText className="h-4 w-4 mr-2" /> View
                                Receipt
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settlements">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Dealer Settlement Statements</CardTitle>
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
            </CardHeader>
            <CardContent>
              {!selectedDealerId ? (
                <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg">
                  <Search className="h-8 w-8 mx-auto mb-4 opacity-20" />
                  <h3 className="text-lg font-medium">No Dealer Selected</h3>
                  <p>
                    Please select a dealer from the dropdown above to view their
                    settlement details.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                      <CardContent className="pt-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Total Invoices
                          </p>
                          <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                            {formatCurrency(totalAmount)}
                          </h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {totalInvoices} Invoices Total
                          </p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                          <Wallet className="h-5 w-5" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50">
                      <CardContent className="pt-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            Paid Amount
                          </p>
                          <h4 className="text-2xl font-bold text-emerald-800 dark:text-emerald-100">
                            {formatCurrency(paidAmount)}
                          </h4>
                          <p className="text-sm text-emerald-600 dark:text-emerald-400">
                            {paidCount} Invoices Paid
                          </p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-emerald-200 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-300">
                          <Banknote className="h-5 w-5" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50">
                      <CardContent className="pt-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                            Pending Amount
                          </p>
                          <h4 className="text-2xl font-bold text-amber-800 dark:text-amber-100">
                            {formatCurrency(pendingAmount)}
                          </h4>
                          <p className="text-sm text-amber-600 dark:text-amber-400">
                            {pendingCount} Invoices Due
                          </p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-amber-200 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-300">
                          <Clock className="h-5 w-5" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Invoices Table */}
                  {loadingInvoices ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : invoices.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground">
                      No pending settlements found for this selection.
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Invoice #</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Dealer (Owed By)</TableHead>
                            <TableHead>Package</TableHead>
                            <TableHead>Cost (Owed)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invoices.map((inv: Invoice) => {
                            const isPaid = inv.status === "paid";
                            return (
                              <TableRow key={`inv-${inv.id}`}>
                                <TableCell>{inv.invoiceNumber}</TableCell>
                                <TableCell>
                                  {new Date(
                                    inv.invoiceDate
                                  ).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {inv.dealer?.businessNameLegal}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {inv.dealer?.email}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {inv.warrantySale?.warrantyPackage?.name ||
                                    "N/A"}
                                </TableCell>
                                <TableCell className="font-bold ">
                                  {formatCurrency(inv.amount)}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={
                                      isPaid
                                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                        : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                                    }
                                  >
                                    {inv.status === "paid"
                                      ? "Paid"
                                      : inv.status === "pending"
                                      ? "Due"
                                      : inv.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    {!isPaid && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                        onClick={() =>
                                          handleMarkAsPaid(inv.id, inv.dealerId)
                                        }
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />{" "}
                                        Mark Paid
                                      </Button>
                                    )}
                                    <Button asChild variant="default" size="sm">
                                      <Link
                                        href={`/invoices/${
                                          inv.id
                                        }?variant=settlement&dealerId=${
                                          inv.dealerId ||
                                          (selectedDealerId !== "all"
                                            ? selectedDealerId
                                            : "")
                                        }`}
                                        target="_blank"
                                      >
                                        <FileText className="h-4 w-4 mr-2" />{" "}
                                        View
                                      </Link>
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
