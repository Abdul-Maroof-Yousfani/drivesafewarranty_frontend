"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getWarrantySaleByIdAction } from "@/lib/actions/warranty-sales";
import { getInvoiceSettingsAction } from "@/lib/actions/invoice-settings";
import { InvoiceRenderer, InvoiceData, InvoiceSettings } from "@/components/invoice/invoice-renderer";
import { Loader2, Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export default function InvoicePage() {
    const { id } = useParams();
    const searchParams = useSearchParams();
    const variant = searchParams.get("variant") || "customer";
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<InvoiceData | null>(null);
    const [settings, setSettings] = useState<InvoiceSettings | null>(null);

    useEffect(() => {
        async function load() {
            if (!id) return;

            try {
                // 1. Fetch Warranty Sale
                const saleRes = await getWarrantySaleByIdAction(id as string);
                if (!saleRes.status || !saleRes.data) {
                    toast.error("Invoice not found");
                    setLoading(false);
                    return;
                }
                const sale = saleRes.data;

                // 2. Determine and Fetch Template
                // Logic: If sale has dealerId, use dealer's template (or master if dealer has none/null)
                // Note: Our `getInvoiceSettingsAction` currently gets current user's settings.
                // We might need a way to get settings by dealerId explicitly if we are viewing as SA or customer.
                // However, `getInvoiceSettingsAction` is tied to auth context. 
                // A public or specific "get template for sale" endpoint would be better.
                // For now, let's assume we need to fetch settings differently or update the action.

                // Actually, let's look at `getInvoiceSettingsAction` again. 
                // It calls GET /api/settings. 
                // We probably need a public or specific endpoint: GET /api/invoice-settings/view?dealerId=...
                // But for this MVP, let's try to reuse or fetch general settings.
                // WAIT: The user request implies correct template application.
                // If I am a customer viewing an invoice, I need the seller's template.
                // I'll assume for now we use the general fetch but ideally we pass dealerId.

                // Let's modify the Action usage or just use what we have, but simpler:
                // Pass dealerId to get settings? 
                // The backend `getTemplate` handles logic if `dealerId` is in query. 
                // Let's update the action to support an optional dealerId.

                const isSettlement = variant === "settlement";

                // Calculate actual duration from coverage dates
                const start = new Date(sale.coverageStartDate);
                const end = new Date(sale.coverageEndDate);
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const durationMonths = Math.round(diffTime / (1000 * 60 * 60 * 24 * 30.44)); // Use 30.44 for better average month accuracy
                
                // Pick the correct dealer cost based on duration
                let correctDealerCost = Number(sale.warrantyPrice); // Fallback
                if (durationMonths <= 12) {
                    correctDealerCost = Number(sale.dealerCost12Months || correctDealerCost);
                } else if (durationMonths <= 24) {
                    correctDealerCost = Number(sale.dealerCost24Months || correctDealerCost);
                } else if (durationMonths <= 36) {
                    correctDealerCost = Number(sale.dealerCost36Months || correctDealerCost);
                }
                
                // If settlement, we always use Drive Safe (master) branding.
                // Otherwise, use the dealer's branding.
                const settingsRes = await getInvoiceSettingsAction(isSettlement ? undefined : sale.dealer?.id);

                const saleData: InvoiceData = {
                    invoiceNumber: sale.policyNumber,
                    variant: variant as any,
                    date: new Date(sale.saleDate).toLocaleDateString(),
                    dueDate: new Date(sale.saleDate).toLocaleDateString(), 
                    billToName: isSettlement 
                        ? (sale.dealer?.businessNameLegal || "The Dealer")
                        : (sale.customer ? `${sale.customer.firstName} ${sale.customer.lastName}` : "Valued Customer"),
                    billToAddress: isSettlement
                         ? sale.dealer?.businessAddress || ""
                         : sale.customer?.address || "",
                    billToEmail: isSettlement ? sale.dealer?.email : sale.customer?.email,
                    items: [
                        {
                            description: `Warranty Package - ${sale.warrantyPackage.name}`,
                            quantity: 1,
                            amount: Number(sale.warrantyPrice),
                            cost: correctDealerCost,
                        }
                    ],
                    subtotal: isSettlement ? correctDealerCost : Number(sale.warrantyPrice),
                    total: isSettlement ? correctDealerCost : Number(sale.warrantyPrice),
                    duration: `${durationMonths} months`,
                };

                setData(saleData);
                if (settingsRes.status && settingsRes.data) {
                    setSettings(settingsRes.data);
                } else {
                    // Fallback default
                    setSettings({});
                }

            } catch (err) {
                console.error(err);
                toast.error("Failed to load invoice");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    const handleDownloadPDF = async () => {
        if (!data || !settings) return;

        try {
            toast.info("Generating PDF...");
            // Dynamically import to avoid server-side rendering issues with @react-pdf/renderer
            const { pdf } = await import("@react-pdf/renderer");
            const { InvoicePDF } = await import("@/components/invoice/invoice-pdf");

            const blob = await pdf(<InvoicePDF settings={settings} data={data} />).toBlob();
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement("a");
            link.href = url;
            link.download = `Invoice_${data.invoiceNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            toast.success("PDF Downloaded successfully");
        } catch (error) {
            console.error("PDF generation failed", error);
            toast.error("Failed to generate PDF");
        }
    };

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!data) return <div className="p-8 text-center text-red-500">Invoice not found.</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white text-black">
            <div className="max-w-4xl mx-auto print:max-w-none print:mx-0">
                <style jsx global>{`
                    #invoice-content {
                        --background: #ffffff;
                        --foreground: #0f172a;
                        --card: #ffffff;
                        --card-foreground: #0f172a;
                        --popover: #ffffff;
                        --popover-foreground: #0f172a;
                        --primary: ${settings?.primaryColor || "#0f172a"};
                        --primary-foreground: #ffffff;
                        --secondary: #f1f5f9;
                        --secondary-foreground: #0f172a;
                        --muted: #f1f5f9;
                        --muted-foreground: #64748b;
                        --accent: ${settings?.accentColor || "#f1f5f9"};
                        --accent-foreground: #0f172a;
                        --destructive: #ef4444;
                        --destructive-foreground: #ffffff;
                        --border: #e2e8f0;
                        --input: #e2e8f0;
                        --ring: ${settings?.primaryColor || "#0f172a"};
                    }
                `}</style>
                {/* Toolbar */}
                <div className="mb-6 flex justify-between items-center print:hidden">
                    <Button variant="outline" onClick={() => window.history.back()}>Back</Button>
                    <Button onClick={handleDownloadPDF}>
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                    </Button>
                </div>

                <div id="invoice-content" className="shadow-lg print:shadow-none bg-white">
                    <InvoiceRenderer settings={settings || {}} data={data} />
                </div>
            </div>
        </div>
    );
}
