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
import { getAllInvoicesAction, Invoice } from "@/lib/actions/invoices";

export default function InvoiceHistoryPage() {
  const [loadingSales, setLoadingSales] = useState(true);
  const [loadingSettlements, setLoadingSettlements] = useState(true);
  const [sales, setSales] = useState<WarrantySale[]>([]);
  const [settlements, setSettlements] = useState<Invoice[]>([]);

  useEffect(() => {
    loadSales();
    loadSettlements();
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
    const res = await getAllInvoicesAction();
    if (res.status && res.data) {
      setSettlements(res.data.invoices);
    }
    setLoadingSettlements(false);
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
                      <TableHead>Invoice #</TableHead>
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
                                Invoice
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

        <TabsContent value="dealer" className="mt-6">
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
                          <Button asChild variant="outline" size="sm">
                            <Link
                              href={`/invoices/${invoice.id}?variant=settlement&dealerId=${invoice.dealerId}`}
                              target="_blank"
                            >
                              <FileText className="h-4 w-4 mr-2" /> View
                              Invoice
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
      </Tabs>
    </div>
  );
}

