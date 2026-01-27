"use client";

import { useEffect, useState } from "react";
import {
  getWarrantySalesAction,
  WarrantySale,
} from "@/lib/actions/warranty-sales";
import { getDealerWarrantySalesAction } from "@/lib/actions/dealer-warranty-sales";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Loader2, DollarSign, Clock, CheckCircle2, FileCheck } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  getAllInvoicesAction, 
  getDealerInvoicesAction,
  Invoice, 
  getDealerInvoiceStatisticsAction, 
  updateInvoiceAction 
} from "@/lib/actions/invoices";
import { getDealers, Dealer } from "@/lib/actions/dealer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface InvoiceHistorySharedProps {
  role: "admin" | "dealer";
}

export function InvoiceHistoryShared({ role }: InvoiceHistorySharedProps) {
  const isAdmin = role === "admin";
  
  const [loadingSales, setLoadingSales] = useState(true);
  const [loadingSettlements, setLoadingSettlements] = useState(true);
  const [sales, setSales] = useState<WarrantySale[]>([]);
  const [settlements, setSettlements] = useState<Invoice[]>([]);
  
  // Admin-specific state
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [selectedDealerId, setSelectedDealerId] = useState<string>("all");
  const [statistics, setStatistics] = useState<{
    totalAmount: number;
    totalCount: number;
    pendingAmount: number;
    pendingCount: number;
    paidAmount: number;
    paidCount: number;
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [invoiceToMarkPaid, setInvoiceToMarkPaid] = useState<Invoice | null>(null);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [activeTab, setActiveTab] = useState("customer");

  useEffect(() => {
    loadSales();
    loadSettlements();
    if (isAdmin) {
      loadDealers();
    }
  }, []);

  const loadSales = async () => {
    setLoadingSales(true);
    let res;
    if (isAdmin) {
      res = await getWarrantySalesAction();
    } else {
      res = await getDealerWarrantySalesAction();
    }
    if (res.status && res.data) {
      const data = Array.isArray(res.data) ? res.data : (res.data as any).data || [];
      setSales(data as WarrantySale[]);
    }
    setLoadingSales(false);
  };

  const loadSettlements = async (dealerId?: string) => {
    setLoadingSettlements(true);
    let res;
    if (isAdmin) {
      res = await getAllInvoicesAction({ 
        dealerId: dealerId && dealerId !== "all" ? dealerId : undefined,
        excludeDirectSales: true
      });
      if (res.status && res.data) {
        setSettlements(res.data.invoices || []);
      } else if (res.status && Array.isArray(res.data)) {
        setSettlements(res.data as any);
      }
    } else {
      res = await getDealerInvoicesAction();
      if (res.status && res.data) {
        setSettlements(res.data.invoices || []);
      }
    }
    setLoadingSettlements(false);
  };

  const loadDealers = async () => {
    const res = await getDealers();
    if (res.status && res.data) {
      setDealers(res.data);
    }
  };

  const loadStatistics = async (dealerId: string) => {
    if (dealerId === "all") {
      setStatistics(null);
      return;
    }
    setLoadingStats(true);
    const res = await getDealerInvoiceStatisticsAction(dealerId);
    if (res.status && res.data) {
      setStatistics(res.data);
    }
    setLoadingStats(false);
  };

  const handleDealerChange = async (dealerId: string) => {
    setSelectedDealerId(dealerId);
    await loadStatistics(dealerId);
    await loadSettlements(dealerId);
  };

  const handleMarkAsPaid = async () => {
    if (!invoiceToMarkPaid) return;
    
    setMarkingPaid(true);
    const res = await updateInvoiceAction(
      invoiceToMarkPaid.id,
      { status: "paid" },
      invoiceToMarkPaid.dealerId
    );
    
    if (res.status) {
      await loadSettlements(selectedDealerId);
      if (selectedDealerId !== "all") {
        await loadStatistics(selectedDealerId);
      }
    }
    
    setMarkingPaid(false);
    setInvoiceToMarkPaid(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoice History</h1>
          <p className="text-muted-foreground mt-2">
            {isAdmin 
              ? "View and download invoices for customer sales and dealer settlements."
              : "View and download invoices for your sold warranties."}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="customer">
              {isAdmin ? "Customer Receipts" : "Customer Invoices"}
            </TabsTrigger>
            <TabsTrigger value="dealer">
              {isAdmin ? "Dealer Settlements" : "Owed to Drive Safe"}
            </TabsTrigger>
          </TabsList>

          {/* Admin-only: Dealer Filter */}
          {isAdmin && activeTab === "dealer" && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium whitespace-nowrap">
                Filter by Dealer:
              </span>
              <Select value={selectedDealerId} onValueChange={handleDealerChange}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select a dealer" />
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
          )}
        </div>

        {/* Customer Invoices Tab */}
        <TabsContent value="customer" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {isAdmin ? "Customer Sales Invoices" : "My Customer Invoices"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSales ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : sales.filter((s) => !!s.customerId).length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                  {isAdmin ? "No customer sales records found." : "No sales found."}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Warranty #</TableHead>
                      <TableHead>Date</TableHead>
                      {isAdmin && <TableHead>Dealer (Seller)</TableHead>}
                      <TableHead>Customer</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead>Sale Price</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
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
                          {isAdmin && (
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
                          )}
                          <TableCell>
                            {sale.customer ? (
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {sale.customer.firstName} {sale.customer.lastName}
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
                                href={`/invoices/${(sale as any).invoices?.[0]?.id || sale.id}`}
                                target="_blank"
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                {isAdmin ? "View Receipt" : "View Invoice"}
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

        {/* Settlements/Owed Tab */}
        <TabsContent value="dealer" className="mt-3">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isAdmin ? "Dealer Settlement Invoices" : "Settlements Owed to Drive Safe"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Admin-only: Statistics Cards */}
                {isAdmin && selectedDealerId !== "all" && (
                  <div className="grid gap-4 md:grid-cols-3">
                    {loadingStats ? (
                      <div className="col-span-3 flex justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : statistics ? (
                      <>
                        <Card className="border-l-4 border-l-blue-500 shadow-sm transition-all hover:shadow-md">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Total Amount
                              </CardTitle>
                              <DollarSign className="h-4 w-4 text-blue-500" />
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                              {formatCurrency(statistics.totalAmount)}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {statistics.totalCount} total invoice{statistics.totalCount !== 1 ? 's' : ''}
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-amber-500 shadow-sm transition-all hover:shadow-md">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Pending
                              </CardTitle>
                              <Clock className="h-4 w-4 text-amber-500" />
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-amber-600">
                              {formatCurrency(statistics.pendingAmount)}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {statistics.pendingCount} unpaid invoice{statistics.pendingCount !== 1 ? 's' : ''}
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-green-500 shadow-sm transition-all hover:shadow-md">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Paid
                              </CardTitle>
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                              {formatCurrency(statistics.paidAmount)}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {statistics.paidCount} fulfilled invoice{statistics.paidCount !== 1 ? 's' : ''}
                            </p>
                          </CardContent>
                        </Card>
                      </>
                    ) : null}
                  </div>
                )}

                {loadingSettlements ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : settlements.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground">
                    {isAdmin ? "No dealer settlement invoices found." : "No settlements found."}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Date</TableHead>
                        {isAdmin && <TableHead>Dealer</TableHead>}
                        <TableHead>Package</TableHead>
                        <TableHead>{isAdmin ? "Amount" : "Amount (Owed)"}</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {settlements.map((invoice) => {
                        const isPaid = invoice.status === "paid";
                        return (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-medium">
                              {invoice.invoiceNumber}
                            </TableCell>
                            <TableCell>
                              {new Date(invoice.invoiceDate).toLocaleDateString()}
                            </TableCell>
                            {isAdmin && (
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {invoice.dealer?.businessNameLegal}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {invoice.dealer?.email}
                                  </span>
                                </div>
                              </TableCell>
                            )}
                            <TableCell>
                              {invoice.warrantySale?.warrantyPackage?.name || "Warranty Sale"}
                            </TableCell>
                            <TableCell className="font-bold">
                              {formatCurrency(invoice.amount)}
                            </TableCell>
                            <TableCell>
                              {isAdmin ? (
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  invoice.status === 'paid' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-amber-100 text-amber-700'
                                }`}>
                                  {invoice.status.toUpperCase()}
                                </span>
                              ) : (
                                <Badge className={isPaid ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-amber-100 text-amber-700 hover:bg-amber-100"}>
                                  {invoice.status === "paid" ? "Paid" : invoice.status === "pending" ? "Due" : invoice.status}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button asChild variant="outline" size="sm">
                                  <Link
                                    href={`/invoices/${invoice.id}?variant=settlement${isAdmin ? `&dealerId=${invoice.dealerId}` : ''}`}
                                    target="_blank"
                                  >
                                    <FileText className="h-4 w-4 mr-2" />
                                    {isAdmin ? "View" : "View Statement"}
                                  </Link>
                                </Button>
                                {isAdmin && invoice.status === 'pending' && (
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => setInvoiceToMarkPaid(invoice)}
                                  >
                                    <FileCheck className="h-4 w-4 mr-2" /> Mark as Paid
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Admin-only: Mark as Paid Confirmation Dialog */}
          {isAdmin && (
            <AlertDialog open={!!invoiceToMarkPaid} onOpenChange={(open) => !open && setInvoiceToMarkPaid(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Mark Invoice as Paid?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to mark invoice <strong>{invoiceToMarkPaid?.invoiceNumber}</strong> as paid?
                    This action will update the invoice status and payment date.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={markingPaid}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleMarkAsPaid} disabled={markingPaid}>
                    {markingPaid ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Confirm"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
