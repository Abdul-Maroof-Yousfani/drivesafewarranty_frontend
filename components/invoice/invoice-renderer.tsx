import React from "react";
import { motion } from "motion/react";

import { Separator } from "@/components/ui/separator";

// Types
export interface InvoiceSettings {
  companyName?: string;
  companyAddress?: string;
  logoUrl?: string;
  logoOffsetX?: number;
  logoOffsetY?: number;
  invoiceInfoOffsetX?: number;
  invoiceInfoOffsetY?: number;
  companyInfoOffsetX?: number;
  companyInfoOffsetY?: number;
  primaryColor?: string;
  accentColor?: string;
  headerText?: string;
  billToTitle?: string;
  billToOffsetX?: number;
  billToOffsetY?: number;
  durationOffsetX?: number;
  durationOffsetY?: number;
  footerText?: string;
  notes?: string;
  font?: string;
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
    cost?: number;
  }[];
  subtotal: number;
  tax?: number;
  total: number;
  variant?: "customer" | "settlement";
  duration?: string;
  vehicle?: {
    make: string;
    model: string;
    year: number;
    vin?: string | null;
    registrationNumber?: string | null;
  };
}

interface InvoiceRendererProps {
  settings: InvoiceSettings;
  data: InvoiceData;
  editable?: boolean;
  onLayoutChange?: (key: keyof InvoiceSettings, value: number) => void;
}

export function InvoiceRenderer({
  settings,
  data,
  editable = false,
  onLayoutChange,
}: InvoiceRendererProps) {
  const {
    companyName,
    companyAddress,
    logoUrl,
    logoOffsetX = 0,
    logoOffsetY = 0,
    invoiceInfoOffsetX = 0,
    invoiceInfoOffsetY = 0,
    companyInfoOffsetX = 0,
    companyInfoOffsetY = 0,
    primaryColor = "#000000",
    accentColor = "#e5e7eb",
    headerText = "INVOICE",
    billToTitle = "Bill To:",
    billToOffsetX = 0,
    billToOffsetY = 0,
    durationOffsetX = 0,
    durationOffsetY = 0,
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
    variant = "customer",
    duration,
    vehicle,
  } = data;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount);
  };

  const isSettlement = variant === "settlement";

  // Ensure logoUrl is handled correctly for preview
  const getAbsoluteUrl = (url?: string) => {
    if (!url) return undefined;
    if (
      url.startsWith("http") ||
      url.startsWith("data:") ||
      url.startsWith("blob:")
    )
      return url;

    // For preview in browser, use relative paths for uploads to keep them on same-origin (satisfy CSP)
    // Next.js rewrites will handle the proxying to the backend.
    if (
      url.startsWith("/uploads/") ||
      url.startsWith("uploads/") ||
      url.startsWith("/dealer-storage/") ||
      url.startsWith("dealer-storage/") ||
      url.startsWith("/dealers/") ||
      url.startsWith("dealers/")
    ) {
      return url.startsWith("/") ? url : `/${url}`;
    }

    if (typeof window === "undefined") return url;
    return `${window.location.origin}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const absoluteLogoUrl = getAbsoluteUrl(logoUrl);

  return (
    <div
      className="bg-white text-sm min-h-[800px] flex flex-col h-full w-full relative print:min-h-0 print:h-auto print:shadow-none print:border-none print:m-0 text-slate-800"
      style={{ fontFamily: settings.font || "sans-serif" }}
    >
      {/* Header Bar */}
      <div
        style={{ backgroundColor: primaryColor }}
        className="h-8 w-full print:bg-[color:var(--primary-color)] mb-8"
      ></div>

      <div className="px-10 py-4 flex-1 flex flex-col print:p-0 print:mx-8">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-12">
          <div className="relative flex flex-col gap-1 w-1/2 items-start text-left">
            {absoluteLogoUrl && (
              <motion.img
                src={absoluteLogoUrl}
                alt="Company Logo"
                className="h-32 w-auto object-contain mb-2"
                style={{ x: logoOffsetX, y: logoOffsetY }}
                drag={editable}
                dragMomentum={false}
                onDragEnd={(_, info) => {
                  if (!onLayoutChange) return;
                  onLayoutChange("logoOffsetX", logoOffsetX + info.offset.x);
                  onLayoutChange("logoOffsetY", logoOffsetY + info.offset.y);
                }}
              />
            )}
            <motion.div
              style={{ x: companyInfoOffsetX, y: companyInfoOffsetY }}
              drag={editable}
              dragMomentum={false}
              onDragEnd={(_, info) => {
                if (!onLayoutChange) return;
                onLayoutChange(
                  "companyInfoOffsetX",
                  companyInfoOffsetX + info.offset.x
                );
                onLayoutChange(
                  "companyInfoOffsetY",
                  companyInfoOffsetY + info.offset.y
                );
              }}
            >
              <h1
                className="text-2xl font-bold tracking-tight leading-tight"
                style={{ color: primaryColor }}
              >
                {companyName}
              </h1>
              <p className="text-slate-500 whitespace-pre-line text-sm max-w-[280px]">
                {companyAddress}
              </p>
            </motion.div>
          </div>

          <motion.div
            className="text-right"
            style={{ x: invoiceInfoOffsetX, y: invoiceInfoOffsetY }}
            drag={editable}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              if (!onLayoutChange) return;
              onLayoutChange(
                "invoiceInfoOffsetX",
                invoiceInfoOffsetX + info.offset.x
              );
              onLayoutChange(
                "invoiceInfoOffsetY",
                invoiceInfoOffsetY + info.offset.y
              );
            }}
          >
            <h2
              className="text-3xl font-light tracking-tight text-slate-900 uppercase mb-2"
              style={{ color: primaryColor }}
            >
              {headerText}
            </h2>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-semibold text-slate-700">Invoice #:</span>{" "}
                {invoiceNumber}
              </p>
              <p>
                <span className="font-semibold text-slate-700">Date:</span>{" "}
                {date}
              </p>
              {dueDate && (
                <p>
                  <span className="font-semibold text-slate-700">
                    Due Date:
                  </span>{" "}
                  {dueDate}
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Bill To Section with Accent Background */}
        <div
          className="mb-8 p-5 rounded-lg print:border print:border-slate-200"
          style={{ backgroundColor: accentColor }}
        >
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              style={{ x: billToOffsetX, y: billToOffsetY }}
              drag={editable}
              dragMomentum={false}
              onDragEnd={(_, info) => {
                if (!onLayoutChange) return;
                onLayoutChange("billToOffsetX", billToOffsetX + info.offset.x);
                onLayoutChange("billToOffsetY", billToOffsetY + info.offset.y);
              }}
            >
              <h3
                className="font-bold mb-2 uppercase text-xs tracking-wider opacity-80"
                style={{ color: primaryColor }}
              >
                {isSettlement ? "Dealer (Bill To):" : billToTitle}
              </h3>
              <p className="font-bold text-lg text-slate-900">{billToName}</p>
              {billToAddress && (
                <p className="text-slate-600 whitespace-pre-line mt-1">
                  {billToAddress}
                </p>
              )}
              {billToEmail && (
                <p className="text-slate-600 mt-1">{billToEmail}</p>
              )}
            </motion.div>
            {duration && (
              <motion.div
                className="text-right flex flex-col justify-center items-end"
                style={{ x: durationOffsetX, y: durationOffsetY }}
                drag={editable}
                dragMomentum={false}
                onDragEnd={(_, info) => {
                  if (!onLayoutChange) return;
                  onLayoutChange(
                    "durationOffsetX",
                    durationOffsetX + info.offset.x
                  );
                  onLayoutChange(
                    "durationOffsetY",
                    durationOffsetY + info.offset.y
                  );
                }}
              >
                <span
                  className="inline-block px-4 py-2 rounded-full border shadow-sm font-semibold text-slate-700"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.7)" }}
                >
                  Plan Duration: {duration}
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Vehicle Details */}
        {vehicle && (
          <div className="mb-10 p-5 rounded-lg border border-slate-200 bg-slate-50">
            <h3
              className="font-bold mb-4 uppercase text-xs tracking-wider opacity-80"
              style={{ color: primaryColor }}
            >
              Vehicle Details
            </h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Vehicle</span>
                <span className="font-bold text-slate-800">
                  {vehicle.make} {vehicle.model} ({vehicle.year})
                </span>
              </div>
              {vehicle.registrationNumber && (
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">
                    Registration
                  </span>
                  <span className="font-bold text-slate-800">
                    {vehicle.registrationNumber}
                  </span>
                </div>
              )}
              {vehicle.vin && (
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">VIN</span>
                  <span className="font-bold text-slate-800">
                    {vehicle.vin}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Items Table */}
        <div className="mb-10 p-2 border-2 rounded-lg border-slate-200">
          <table className="w-full text-left  ">
            <thead>
              <tr
                className="border-b-2  "
                style={{ borderColor: primaryColor }}
              >
                <th
                  className="py-3 font-bold uppercase text-xs tracking-wider text-slate-700"
                  style={{ color: primaryColor }}
                >
                  Description
                </th>
                <th
                  className="py-3 text-right font-bold uppercase text-xs tracking-wider text-slate-700 w-24"
                  style={{ color: primaryColor }}
                >
                  Qty
                </th>
                <th
                  className="py-3 text-right font-bold uppercase text-xs tracking-wider text-slate-700 w-32"
                  style={{ color: primaryColor }}
                >
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-300 last:border-0"
                >
                  <td className="py-2 font-medium text-slate-800">
                    {item.description}
                    {isSettlement && (
                      <div className="text-xs text-slate-400 mt-1 italic">
                        Dealer Settlement Rate
                      </div>
                    )}
                  </td>
                  <td className="py-3 text-right text-slate-600">
                    {item.quantity}
                  </td>
                  <td className="py-3 text-right font-bold text-slate-900">
                    {formatCurrency(
                      isSettlement ? item.cost ?? item.amount : item.amount
                    )}
                  </td>
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
            <div
              className="flex justify-between items-center py-2 px-3 rounded"
              style={{ backgroundColor: primaryColor, color: "#ffffff" }}
            >
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-xl">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Notes & Footer */}
        <div className="mt-auto avoid-break-inside">
          {notes && (
            <div className="mb-8">
              <h4 className="font-bold text-xs uppercase tracking-wider mb-2 text-slate-500">
                Notes & Terms
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed">{notes}</p>
            </div>
          )}

          <div className="border-t pt-6 text-center text-slate-400 text-xs">
            <p>
              {isSettlement
                ? "Official Drive Safe Settlement Statement"
                : footerText || "Thank you for your business!"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
