"use client";

import { InvoiceBuilder } from "@/components/invoice/invoice-builder";

export default function DealerInvoiceSettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Invoice Branding</h1>
                <p className="text-muted-foreground mt-2">
                    Personalize the invoices your customers receive. Set your logo, colors, and business details.
                </p>
            </div>

            <div className="h-[calc(100vh-200px)]">
                <InvoiceBuilder />
            </div>
        </div>
    );
}
