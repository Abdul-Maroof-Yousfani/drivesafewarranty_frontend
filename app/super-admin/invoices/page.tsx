"use client";

import { useEffect, useState } from "react";
import {
  getWarrantySalesAction,
  WarrantySale,
} from "@/lib/actions/warranty-sales";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllInvoicesAction, Invoice, getDealerInvoiceStatisticsAction, updateInvoiceAction } from "@/lib/actions/invoices";
import { getDealers, Dealer } from "@/lib/actions/dealer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, FileCheck, Clock, CheckCircle2 } from "lucide-react";
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

export default function SuperAdminInvoicesPage() {
  const [loadingSales, setLoadingSales] = useState(true);
  const [loadingSettlements, setLoadingSettlements] = useState(true);
  const [sales, setSales] = useState<WarrantySale[]>([]);
  const [settlements, setSettlements] = useState<Invoice[]>([]);
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

  useEffect(() => {
    loadSales();
    loadSettlements();
    loadDealers();
  }, []);

  const loadSales = async () => {
    setLoadingSales(true);
    const res = await getWarrantySalesAction();
    if (res.status) {
      setSales((res.data || []) as WarrantySale[]);
    }
    setLoadingSales(false);
  };

  const loadSettlements = async () => {
    setLoadingSettlements(true);
    const res = await getAllInvoicesAction({ dealerId: selectedDealerId !== "all" ? selectedDealerId : undefined });
    if (res.status && res.data) {
      setSettlements(res.data.invoices);
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
    console.log("Statistics Response:", res);
    if (res.status && res.data) {
      console.log("Statistics Data:", res.data);
      setStatistics(res.data);
    }
    setLoadingStats(false);
  };

  const handleDealerChange = async (dealerId: string) => {
    setSelectedDealerId(dealerId);
    await loadStatistics(dealerId);
    
    // Reload settlements with new dealer filter
    setLoadingSettlements(true);
    const res = await getAllInvoicesAction({ dealerId: dealerId !== "all" ? dealerId : undefined });
    if (res.status && res.data) {
      setSettlements(res.data.invoices);
    }
    setLoadingSettlements(false);
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
      // Refresh data
      await loadSettlements();
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
            View and download invoices for customer sales and dealer settlements.
          </p>
        </div>
      </div>

      <Tabs defaultValue="customer" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="customer">Customer Receipts</TabsTrigger>
          <TabsTrigger value="dealer">Dealer Settlements</TabsTrigger>
        </TabsList>

        <TabsContent value="customer" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Sales Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSales ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : sales.filter((s) => !!s.customerId).length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                  No customer sales records found.
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

        <TabsContent value="dealer" className="mt-3 ">
          <div className="space-y-6 ml">
            {/* Dealer Selection - Compact in header */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Filter by Dealer:</label>
              <Select value={selectedDealerId} onValueChange={handleDealerChange}>
                <SelectTrigger className="w-[300px]">
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

            {/* Statistics Cards - Improved Design */}
            {selectedDealerId !== "all" && (
              <div className="grid gap-4 md:grid-cols-3">
                {loadingStats ? (
                  <div className="col-span-3 flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : statistics ? (
                  <>
                    <Card className="border-l-4 border-l-blue-500">
                      <CardHeader >
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-medium text-muted-foreground">
                            Total Invoices
                          </CardTitle>
                          <DollarSign className="h-5 w-5 text-blue-500" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-blue-600">
                          {formatCurrency(statistics.totalAmount)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {statistics.totalCount} invoice{statistics.totalCount !== 1 ? 's' : ''}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-amber-500">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-medium text-muted-foreground">
                            Pending Invoices
                          </CardTitle>
                          <Clock className="h-5 w-5 text-amber-500" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-amber-600">
                          {formatCurrency(statistics.pendingAmount)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {statistics.pendingCount} invoice{statistics.pendingCount !== 1 ? 's' : ''}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-medium text-muted-foreground">
                            Paid Invoices
                          </CardTitle>
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-green-600">
                          {formatCurrency(statistics.paidAmount)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {statistics.paidCount} invoice{statistics.paidCount !== 1 ? 's' : ''}
                        </p>
                      </CardContent>
                    </Card>
                  </>
                ) : null}
              </div>
            )}

            {/* Invoice Table */}
            <Card>
              <CardHeader>
                <CardTitle>Dealer Settlement Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSettlements ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : settlements.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground">
                    No dealer settlement invoices found.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Dealer</TableHead>
                        <TableHead>Package</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {settlements.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">
                            {invoice.invoiceNumber}
                          </TableCell>
                          <TableCell>
                            {new Date(invoice.invoiceDate).toLocaleDateString()}
                          </TableCell>
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
                          <TableCell>
                            {invoice.warrantySale?.warrantyPackage?.name || "N/A"}
                          </TableCell>
                          <TableCell className="font-bold">
                            {formatCurrency(invoice.amount)}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              invoice.status === 'paid' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {invoice.status.toUpperCase()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button asChild variant="outline" size="sm">
                                <Link
                                  href={`/invoices/${invoice.id}?variant=settlement&dealerId=${invoice.dealerId}`}
                                  target="_blank"
                                >
                                  <FileText className="h-4 w-4 mr-2" /> View
                                </Link>
                              </Button>
                              {invoice.status === 'pending' && (
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
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Mark as Paid Confirmation Dialog */}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
