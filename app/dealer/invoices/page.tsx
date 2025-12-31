"use client";

import { useEffect, useState } from "react";
import { getDealerWarrantySalesAction } from "@/lib/actions/dealer-warranty-sales";
import { getDealerInvoicesAction, Invoice } from "@/lib/actions/invoices";
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
import { FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { WarrantySale } from "@/lib/actions/warranty-sales";

export default function DealerInvoicesPage() {
    const [loadingSales, setLoadingSales] = useState(true);
    const [loadingInvoices, setLoadingInvoices] = useState(true);
    const [sales, setSales] = useState<WarrantySale[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);

    useEffect(() => {
        async function loadData() {
            setLoadingSales(true);
            setLoadingInvoices(true);

            // Fetch Customer Sales (for Customer Invoices tab)
            getDealerWarrantySalesAction().then((res) => {
                if (res.status) {
                    setSales(res.data as WarrantySale[]);
                }
                setLoadingSales(false);
            });

            // Fetch Dealer Invoices (for Owed to Drive Safe tab)
            getDealerInvoicesAction().then((res) => {
                if (res.status && res.data) {
                    setInvoices(res.data.invoices);
                }
                setLoadingInvoices(false);
            });
        }
        loadData();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Invoice History</h1>
                <p className="text-muted-foreground mt-2">
                    View and download invoices for your sold warranties.
                </p>
            </div>

            <Tabs defaultValue="customers" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="customers">Customer Invoices</TabsTrigger>
                    <TabsTrigger value="owed">Owed to Drive Safe</TabsTrigger>
                </TabsList>

                <TabsContent value="customers">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Customer Invoices</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loadingSales ? (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : sales.length === 0 ? (
                                <div className="text-center p-8 text-muted-foreground">
                                    No sales found.
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Policy #</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Package</TableHead>
                                            <TableHead>Sale Price</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {/* Customer Invoices: sales TO customers */}
                                        {sales.filter((s: WarrantySale) => !!s.customerId).map((sale: WarrantySale) => (
                                            <TableRow key={sale.id}>
                                                <TableCell className="font-medium text-blue-600">
                                                    {sale.policyNumber}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(sale.saleDate).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    {sale.customer
                                                        ? `${sale.customer.firstName} ${sale.customer.lastName}`
                                                        : "Unknown"}
                                                </TableCell>
                                                <TableCell>
                                                    {sale.warrantyPackage?.name || "N/A"}
                                                </TableCell>
                                                <TableCell className="font-bold">{formatCurrency(sale.warrantyPrice)}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button asChild variant="outline" size="sm">
                                                        {/* Link to generic invoice view - likely renders customer receipt */}
                                                        <Link href={`/invoices/${sale.id}`} target="_blank">
                                                            <FileText className="h-4 w-4 mr-2" /> View Invoice
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

                <TabsContent value="owed">
                    <Card>
                        <CardHeader>
                            <CardTitle>Settlements Owed to Drive Safe</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loadingInvoices ? (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : invoices.length === 0 ? (
                                <div className="text-center p-8 text-muted-foreground">
                                    No settlements found.
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Invoice #</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Package</TableHead>
                                            <TableHead>Amount (Owed)</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {/* Owed Invoices: Actual Invoice records from SA */}
                                        {invoices.map((inv: Invoice) => {
                                            const isPaid = inv.status === "paid";
                                            return (
                                                <TableRow key={inv.id}>
                                                    <TableCell className="font-medium text-emerald-600">
                                                        {inv.invoiceNumber}
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(inv.invoiceDate).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        {inv.warrantySale?.warrantyPackage?.name || "Warranty Sale"}
                                                    </TableCell>
                                                    <TableCell className="font-bold text-slate-900">
                                                        {formatCurrency(inv.amount)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={isPaid ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-amber-100 text-amber-700 hover:bg-amber-100"}>
                                                            {inv.status === "paid" ? "Paid" : inv.status === "pending" ? "Due" : inv.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button asChild variant="outline" size="sm">
                                                            {/* Ensure this link opens the 'SA Invoice' view */}
                                                            {/* Pass variant=settlement to contextually style it if needed */}
                                                            <Link href={`/invoices/${inv.id}?variant=settlement`} target="_blank">
                                                                <FileText className="h-4 w-4 mr-2" /> View Statement
                                                            </Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
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
