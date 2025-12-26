"use client";

import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { getCustomerWarrantySalesAction, CustomerWarrantySale } from "@/lib/actions/customer-warranties";

export default function CustomerInvoicesPage() {
    const [loading, setLoading] = useState(true);
    const [warranties, setWarranties] = useState<CustomerWarrantySale[]>([]);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const res = await getCustomerWarrantySalesAction();
                if (res.status && Array.isArray(res.data)) {
                    setWarranties(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch customer warranties:", error);
            }
            setLoading(false);
        }
        load();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Invoices</h1>
                <p className="text-muted-foreground mt-2">
                    View invoices for your purchased warranties.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Warranty Purchase Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : warranties.length === 0 ? (
                        <div className="text-center p-8 text-muted-foreground">
                            No invoices found. Purchase a warranty to see your invoices here.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice #</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Package</TableHead>
                                    <TableHead>Sold By</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {warranties.map((warranty) => (
                                    <TableRow key={warranty.id}>
                                        <TableCell className="font-medium text-blue-600">
                                            {warranty.policyNumber}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(warranty.coverageStartDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            {warranty.warrantyPackage?.name || "N/A"}
                                        </TableCell>
                                        <TableCell>
                                            {warranty.dealer
                                                ? warranty.dealer.businessNameTrading || warranty.dealer.businessNameLegal
                                                : "Drive Safe (Direct)"}
                                        </TableCell>
                                        <TableCell className="font-bold">
                                            {formatCurrency(warranty.warrantyPrice || 0)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={warranty.status === "active" ? "default" : "secondary"}
                                            >
                                                {warranty.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/invoices/${warranty.id}`} target="_blank">
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
        </div>
    );
}
