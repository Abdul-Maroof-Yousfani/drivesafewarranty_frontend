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
import { FileText, Loader2 } from "lucide-react";
import Link from "next/link";

export default function DealerInvoicesPage() {
    const [loading, setLoading] = useState(true);
    const [sales, setSales] = useState<any[]>([]);

    useEffect(() => {
        async function load() {
            const res = await getDealerWarrantySalesAction();
            if (res.status) {
                setSales(res.data);
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

            <Card>
                <CardHeader>
                    <CardTitle>My Invoices</CardTitle>
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
                                    <TableHead>Amount</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sales.map((sale) => (
                                    <TableRow key={sale.id}>
                                        <TableCell className="font-medium">
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
                                        <TableCell>{formatCurrency(sale.warrantyPrice)}</TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/invoices/${sale.id}`} target="_blank">
                                                    <FileText className="h-4 w-4 mr-2" /> View
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
        </div>
    );
}
