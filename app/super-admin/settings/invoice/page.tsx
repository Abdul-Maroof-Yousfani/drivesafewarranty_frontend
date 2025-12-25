"use client";

import { InvoiceBuilder } from "@/components/invoice/invoice-builder";

export default function SuperAdminInvoiceSettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Invoice Customization</h1>
                <p className="text-muted-foreground mt-2">
                    Customize the appearance and content of invoices generated for your direct sales.
                </p>
            </div>

            <div className="h-[calc(100vh-200px)]">
                <InvoiceBuilder />
            </div>
        </div>
    );
}
