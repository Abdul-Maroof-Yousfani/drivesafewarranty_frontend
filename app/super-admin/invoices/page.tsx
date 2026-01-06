"use client";

import { useEffect, useState } from "react";
import {
  getWarrantySalesAction,
  WarrantySale,
} from "@/lib/actions/warranty-sales";

export default function SuperAdminInvoicesPage() {
  const [loadingSales, setLoadingSales] = useState(true);
  const [sales, setSales] = useState<WarrantySale[]>([]);

  useEffect(() => {
    // Load initial data
    loadSales();
  }, []);

  const loadSales = async () => {
    setLoadingSales(true);
    const res = await getWarrantySalesAction();
    if (res.status) {
      setSales(res.data as WarrantySale[]);
    }
    setLoadingSales(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Invoice History</h1>
        <p className="text-muted-foreground mt-2">
          View and download invoices for all customer warranty sales.
        </p>
      </div>

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
    </div>
  );
}
