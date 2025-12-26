"use client";

import { useEffect, useState } from "react";
import { getDealerWarrantySalesAction } from "@/lib/actions/dealer-warranty-sales";
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
import { FileText, Loader2, Download, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { WarrantySale } from "@/lib/actions/warranty-sales";

export default function DealerInvoicesPage() {
    const [loading, setLoading] = useState(true);
    const [sales, setSales] = useState<any[]>([]);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const res = await getDealerWarrantySalesAction();
            if (res.status) {
                setSales(res.data as WarrantySale[]);
            }
            setLoading(false);
        }
        load();
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
                            {loading ? (
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
                                            <TableHead>Invoice #</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Package</TableHead>
                                            <TableHead>Sale Price</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {/* Customer Invoices: sales TO customers (has customerId) */}
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
                            {loading ? (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : sales.length === 0 ? (
                                <div className="text-center p-8 text-muted-foreground">
                                    No settlements found.
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Settlement #</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Package</TableHead>
                                            <TableHead>Dealer Cost</TableHead>
                                            <TableHead>Transaction Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {/* Owed to Drive Safe: package assignments FROM SA (no customerId, paymentMethod='dealer_assignment') */}
                                        {sales.filter((s: WarrantySale) => !s.customerId && s.paymentMethod === 'dealer_assignment').map((sale: WarrantySale) => {
                                            const start = new Date(sale.coverageStartDate);
                                            const end = new Date(sale.coverageEndDate);
                                            const diffTime = Math.abs(end.getTime() - start.getTime());
                                            const durationMonths = Math.round(diffTime / (1000 * 60 * 60 * 24 * 30.44));
                                            
                                            let dealerCost = Number(sale.warrantyPrice);
                                            if (durationMonths <= 12) {
                                                dealerCost = Number(sale.dealerCost12Months || dealerCost);
                                            } else if (durationMonths <= 24) {
                                                dealerCost = Number(sale.dealerCost24Months || dealerCost);
                                            } else if (durationMonths <= 36) {
                                                dealerCost = Number(sale.dealerCost36Months || dealerCost);
                                            }
                                            
                                            const isPaid = sale.status === "paid";
                                            
                                            return (
                                                <TableRow key={`owed-${sale.id}`}>
                                                    <TableCell className="font-medium text-emerald-600">
                                                        {sale.policyNumber}
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(sale.saleDate).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        {sale.warrantyPackage?.name || "N/A"}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{durationMonths} months</Badge>
                                                    </TableCell>
                                                    <TableCell className="font-bold text-slate-900">{formatCurrency(dealerCost)}</TableCell>
                                                    <TableCell>
                                                        <Badge className={isPaid ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-amber-100 text-amber-700 hover:bg-amber-100"}>
                                                            {isPaid ? "Paid" : "Owed"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button asChild variant="outline" size="sm">
                                                            <Link href={`/invoices/${sale.id}?variant=settlement`} target="_blank">
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
