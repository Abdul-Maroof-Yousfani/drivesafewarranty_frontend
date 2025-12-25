import React from "react";
import { Separator } from "@/components/ui/separator";

// Types
export interface InvoiceSettings {
    companyName?: string;
    companyAddress?: string;
    logoUrl?: string;
    logoPosition?: "left" | "center" | "right";
    primaryColor?: string;
    accentColor?: string;
    headerText?: string;
    billToTitle?: string;
    footerText?: string;
    notes?: string;
}

export interface InvoiceData {
    invoiceNumber: string;
    date: string;
    dueDate?: string;
    billToName: string;
    billToAddress?: string;
    billToEmail?: string;
    items: {
        description: string;
        quantity: number;
        amount: number;
    }[];
    subtotal: number;
    tax?: number;
    total: number;
}

interface InvoiceRendererProps {
    settings: InvoiceSettings;
    data: InvoiceData;
}

export function InvoiceRenderer({ settings, data }: InvoiceRendererProps) {
    const {
        companyName,
        companyAddress,
        logoUrl,
        logoPosition = "left",
        primaryColor = "#000000",
        accentColor = "#e5e7eb",
        headerText = "INVOICE",
        billToTitle = "Bill To:",
        footerText,
        notes,
    } = settings;

    const {
        invoiceNumber,
        date,
        dueDate,
        billToName,
        billToAddress,
        billToEmail,
        items,
        subtotal,
        total,
    } = data;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency: "GBP",
        }).format(amount);
    };

    // Determine if detailed view (Dealer context) is needed
    // Logic: If explicitly passed via prop or derived? 
    // Current prop `data` has strict schema. We might need to extend it or check items.
    // For now, let's assume if it is a "Dealer Invoice" the data passed will have cost info?
    // Actually, the user requirement "Dealer Invoice -> All prices".
    // I need to add optional fields to `InvoiceData` for cost/margin if I want to display them.
    // Let's rely on `items` having rich description for now, OR add columns if data has them.
    const isDealerView = (data as any).isDealerView; // Dirty cast or update interface

    // Duration Logic
    // If warranty duration is known, show it.
    const duration = (data as any).duration; // e.g. "12 Months"

    return (
        <div className="bg-white text-sm min-h-[800px] flex flex-col font-sans h-full w-full relative print:min-h-0 print:h-auto print:shadow-none print:border-none print:m-0 text-slate-800">
            {/* Header Bar */}
            <div style={{ backgroundColor: primaryColor }} className="h-4 w-full print:bg-[color:var(--primary-color)] mb-8"></div>

            <div className="px-12 py-8 flex-1 flex flex-col print:p-0 print:mx-8">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-12">
                    <div className="flex flex-col gap-2">
                        {logoUrl && (
                            <img src={logoUrl} alt="Company Logo" className="h-20 w-auto object-contain mb-4" />
                        )}
                        <h1 className="text-3xl font-bold tracking-tight" style={{ color: primaryColor }}>{companyName}</h1>
                        <p className="text-slate-500 whitespace-pre-line text-sm max-w-[250px]">{companyAddress}</p>
                    </div>

                    <div className="text-right">
                        <h2 className="text-4xl font-light tracking-tight text-slate-900 uppercase mb-2" style={{ color: primaryColor }}>{headerText}</h2>
                        <div className="space-y-1 text-sm">
                            <p><span className="font-semibold text-slate-700">Invoice #:</span> {invoiceNumber}</p>
                            <p><span className="font-semibold text-slate-700">Date:</span> {date}</p>
                            {dueDate && <p><span className="font-semibold text-slate-700">Due Date:</span> {dueDate}</p>}
                        </div>
                    </div>
                </div>

                {/* Bill To Section with Accent Background */}
                <div className="mb-10 p-6 rounded-lg print:border print:border-slate-200" style={{ backgroundColor: accentColor }}>
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-bold mb-2 uppercase text-xs tracking-wider opacity-80" style={{ color: primaryColor }}>{billToTitle}</h3>
                            <p className="font-bold text-lg text-slate-900">{billToName}</p>
                            {billToAddress && <p className="text-slate-600 whitespace-pre-line mt-1">{billToAddress}</p>}
                            {billToEmail && <p className="text-slate-600 mt-1">{billToEmail}</p>}
                        </div>
                        {duration && (
                            <div className="text-right flex flex-col justify-center items-end">
                                <span className="inline-block px-4 py-2 rounded-full bg-white/50 border shadow-sm font-semibold text-slate-700">
                                    Plan Duration: {duration}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-10">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2" style={{ borderColor: primaryColor }}>
                                <th className="py-3 font-bold uppercase text-xs tracking-wider text-slate-700" style={{ color: primaryColor }}>Description</th>
                                <th className="py-3 text-right font-bold uppercase text-xs tracking-wider text-slate-700 w-24" style={{ color: primaryColor }}>Qty</th>
                                <th className="py-3 text-right font-bold uppercase text-xs tracking-wider text-slate-700 w-32" style={{ color: primaryColor }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={index} className="border-b border-slate-100 last:border-0">
                                    <td className="py-4 font-medium text-slate-800">
                                        {item.description}
                                        {/* Optional detailed info for Dealer View */}
                                        {isDealerView && (item as any).cost && (
                                            <div className="text-xs text-slate-400 mt-1">
                                                Dealer Cost: {formatCurrency((item as any).cost)} | Margin: {formatCurrency(item.amount - (item as any).cost)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-4 text-right text-slate-600">{item.quantity}</td>
                                    <td className="py-4 text-right font-bold text-slate-900">{formatCurrency(item.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-16">
                    <div className="w-5/12 space-y-3">
                        <div className="flex justify-between text-slate-500 font-medium">
                            <span>Subtotal</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        {/* Tax placeholder */}
                        {/* <div className="flex justify-between text-slate-500 font-medium">
                            <span>Tax (0%)</span>
                            <span>£0.00</span>
                        </div> */}
                        <div className="h-px bg-slate-200 my-2"></div>
                        <div className="flex justify-between items-center py-2 px-3 rounded" style={{ backgroundColor: primaryColor, color: "#ffffff" }}>
                            <span className="font-bold text-lg">Total</span>
                            <span className="font-bold text-xl">{formatCurrency(total)}</span>
                        </div>
                    </div>
                </div>

                {/* Notes & Footer */}
                <div className="mt-auto avoid-break-inside">
                    {notes && (
                        <div className="mb-8">
                            <h4 className="font-bold text-xs uppercase tracking-wider mb-2 text-slate-500">Notes & Terms</h4>
                            <p className="text-slate-600 text-sm leading-relaxed">{notes}</p>
                        </div>
                    )}

                    <div className="border-t pt-6 text-center text-slate-400 text-xs">
                        <p>{footerText || "Thank you for your business!"}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
