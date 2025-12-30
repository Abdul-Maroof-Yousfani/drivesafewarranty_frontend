"use client";

import { useEffect, useState } from "react";
import { getWarrantySalesAction, updateWarrantySaleAction, WarrantySale } from "@/lib/actions/warranty-sales";
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
import { FileText, Loader2, Download, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function SuperAdminInvoicesPage() {
    const [loading, setLoading] = useState(true);
    const [sales, setSales] = useState<WarrantySale[]>([]);

    const load = async () => {
        setLoading(true);
        const res = await getWarrantySalesAction();
        if (res.status) {
            setSales(res.data as WarrantySale[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    const handleMarkAsPaid = async (id: string) => {
        try {
            const res = await updateWarrantySaleAction(id, { status: "paid" });
            if (res.status) {
                toast.success("Settlement marked as paid");
                load(); // Refresh list
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
                            {loading ? (
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
                                        {sales.filter((s: WarrantySale) => !!s.customerId).map((sale: WarrantySale) => (
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
                                                            <span className="font-medium">{sale.dealer.businessNameLegal}</span>
                                                            <span className="text-xs text-muted-foreground">{sale.dealer.email}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground italic">Drive Safe (Direct)</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {sale.customer ? (
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{sale.customer.firstName} {sale.customer.lastName}</span>
                                                            <span className="text-xs text-muted-foreground">{sale.customer.email}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">N/A</span>
                                                    )}
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

                <TabsContent value="settlements">
                    <Card>
                        <CardHeader>
                            <CardTitle>Dealer Settlement Statements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : sales.filter(s => s.dealerId).length === 0 ? (
                                <div className="text-center p-8 text-muted-foreground">
                                    No dealer settlements found.
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Settlement #</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Dealer (Owed By)</TableHead>
                                            <TableHead>Package</TableHead>
                                            <TableHead>Duration</TableHead>
                                            <TableHead>Dealer Cost</TableHead>
                                         
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sales.filter((s: WarrantySale) => !!s.dealerId).map((sale: WarrantySale) => {
                                            // Calculate actual duration from coverage dates
                                            const start = new Date(sale.coverageStartDate);
                                            const end = new Date(sale.coverageEndDate);
                                            const diffTime = Math.abs(end.getTime() - start.getTime());
                                            const durationMonths = Math.round(diffTime / (1000 * 60 * 60 * 24 * 30.44));
                                            
                                            // Pick the correct dealer cost based on duration
                                            let dealerCost = Number(sale.warrantyPrice); // Fallback
                                            if (durationMonths <= 12) {
                                                dealerCost = Number(sale.dealerCost12Months || dealerCost);
                                            } else if (durationMonths <= 24) {
                                                dealerCost = Number(sale.dealerCost24Months || dealerCost);
                                            } else if (durationMonths <= 36) {
                                                dealerCost = Number(sale.dealerCost36Months || dealerCost);
                                            }

                                            const profit = Number(sale.warrantyPrice) - dealerCost;
                                            const isPaid = sale.status === "paid";
                                            
                                            return (
                                                <TableRow key={`settlement-${sale.id}`}>
                                                    <TableCell className="font-medium text-emerald-600">
                                                        {sale.policyNumber}
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(sale.saleDate).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{sale.dealer?.businessNameLegal}</span>
                                                            <span className="text-xs text-muted-foreground">{sale.dealer?.email}</span>
                                                        </div>
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
                                                        <div className="flex justify-end gap-2">
                                                            {!isPaid && (
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="sm" 
                                                                    className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                                                    onClick={() => handleMarkAsPaid(sale.id)}
                                                                >
                                                                    <CheckCircle className="h-4 w-4 mr-2" /> Mark Paid
                                                                </Button>
                                                            )}
                                                            <Button asChild variant="default" size="sm">
                                                                <Link href={`/invoices/${sale.id}?variant=settlement`} target="_blank">
                                                                    <Download className="h-4 w-4 mr-2" /> View
                                                                </Link>
                                                            </Button>
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
                </TabsContent>
            </Tabs>
        </div>
    );
}
