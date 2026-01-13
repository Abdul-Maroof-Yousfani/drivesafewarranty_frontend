import React from "react";
import { motion } from "motion/react";

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
  notesOffsetX?: number;
  notesOffsetY?: number;
  termsOffsetX?: number;
  termsOffsetY?: number;
  footerOffsetX?: number;
  footerOffsetY?: number;
  notesHeading?: string;
  footerText?: string;
  notes?: string;
  termsHeading?: string;
  termsText?: string;
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
  const slate = {
    50: "#f8fafc",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  } as const;

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
    notesOffsetX = 0,
    notesOffsetY = 0,
    termsOffsetX = 0,
    termsOffsetY = 0,
    footerOffsetX = 0,
    footerOffsetY = 0,
    notesHeading,
    footerText,
    notes,
    termsHeading,
    termsText,
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
    if (url.startsWith("data:") || url.startsWith("blob:")) return url;

    if (url.startsWith("http")) {
      try {
        const u = new URL(url);
        u.pathname = u.pathname.replace(
          /^\/api(?=\/(uploads|dealer-storage|dealers|master)(\/|$))/,
          ""
        );
        return u.toString();
      } catch {
        return url;
      }
    }

    // For preview in browser, use relative paths for uploads to keep them on same-origin (satisfy CSP)
    // Next.js rewrites will handle the proxying to the backend.
    if (
      url.startsWith("/uploads/") ||
      url.startsWith("uploads/") ||
      url.startsWith("/dealer-storage/") ||
      url.startsWith("dealer-storage/") ||
      url.startsWith("/dealers/") ||
      url.startsWith("dealers/") ||
      url.startsWith("/master/") ||
      url.startsWith("master/")
    ) {
      return url.startsWith("/") ? url : `/${url}`;
    }

    if (typeof window === "undefined") return url;
    return `${window.location.origin}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const absoluteLogoUrl = getAbsoluteUrl(logoUrl);

  return (
    <div
      className="bg-white text-sm min-h-[800px] flex flex-col h-full w-full relative print:min-h-0 print:h-auto print:shadow-none print:border-none print:m-0"
      style={{
        fontFamily: settings.font || "sans-serif",
        color: slate[800],
      }}
    >
      {/* Header Bar */}
      <div
        style={{ backgroundColor: primaryColor }}
        className="h-8 w-full print:bg-[color:var(--primary-color)] mb-6"
      ></div>

      <div className="px-10 py-4 flex-1 flex flex-col print:pt-0 print:px-0 print:pb-8 print:mx-8">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
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
              <p
                className="whitespace-pre-line text-sm max-w-[280px]"
                style={{ color: slate[500] }}
              >
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
              className="text-3xl font-light tracking-tight uppercase mb-2"
              style={{ color: primaryColor }}
            >
              {headerText}
            </h2>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-semibold" style={{ color: slate[700] }}>
                  Invoice #:
                </span>{" "}
                {invoiceNumber}
              </p>
              <p>
                <span className="font-semibold" style={{ color: slate[700] }}>
                  Date:
                </span>{" "}
                {date}
              </p>
              {dueDate && (
                <p>
                  <span className="font-semibold" style={{ color: slate[700] }}>
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
          className="mb-3 p-5 rounded-lg print:border"
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
              <p className="font-bold text-lg" style={{ color: slate[900] }}>
                {billToName}
              </p>
              {billToAddress && (
                <p
                  className="whitespace-pre-line mt-1"
                  style={{ color: slate[600] }}
                >
                  {billToAddress}
                </p>
              )}
              {billToEmail && (
                <p className="mt-1" style={{ color: slate[600] }}>
                  {billToEmail}
                </p>
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
                  className="inline-block px-4 py-2 rounded-full border shadow-sm font-semibold"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                    color: slate[700],
                    borderColor: slate[200],
                  }}
                >
                  Plan Duration: {duration}
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Vehicle Details */}
        {vehicle && (
          <div
            className="mb-4 p-5 rounded-lg border"
            style={{ borderColor: slate[200], backgroundColor: slate[50] }}
          >
            <h3
              className="font-bold mb-4 uppercase text-xs tracking-wider opacity-80"
              style={{ color: primaryColor }}
            >
              Vehicle Details
            </h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div
                className="flex justify-between border-b pb-2"
                style={{ borderColor: slate[200] }}
              >
                <span className="font-medium" style={{ color: slate[500] }}>
                  Vehicle
                </span>
                <span className="font-bold" style={{ color: slate[800] }}>
                  {vehicle.make} {vehicle.model} ({vehicle.year})
                </span>
              </div>
              {vehicle.registrationNumber && (
                <div
                  className="flex justify-between border-b pb-2"
                  style={{ borderColor: slate[200] }}
                >
                  <span className="font-medium" style={{ color: slate[500] }}>
                    Registration
                  </span>
                  <span className="font-bold" style={{ color: slate[800] }}>
                    {vehicle.registrationNumber}
                  </span>
                </div>
              )}
              {vehicle.vin && (
                <div
                  className="flex justify-between border-b pb-2"
                  style={{ borderColor: slate[200] }}
                >
                  <span className="font-medium" style={{ color: slate[500] }}>
                    VIN
                  </span>
                  <span className="font-bold" style={{ color: slate[800] }}>
                    {vehicle.vin}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Items Table */}
        <div
          className="mb-4 p-2 border-2 rounded-lg"
          style={{ borderColor: slate[200] }}
        >
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
                  className="border-b last:border-0"
                  style={{ borderColor: slate[300] }}
                >
                  <td
                    className="py-2 font-medium"
                    style={{ color: slate[800] }}
                  >
                    {item.description}
                    {isSettlement && (
                      <div
                        className="text-xs mt-1 italic"
                        style={{ color: slate[400] }}
                      >
                        Dealer Settlement Rate
                      </div>
                    )}
                  </td>
                  <td className="py-3 text-right" style={{ color: slate[600] }}>
                    {item.quantity}
                  </td>
                  <td
                    className="py-3 text-right font-bold"
                    style={{ color: slate[900] }}
                  >
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
        <div className="flex justify-end mb-10">
          <div className="w-5/12 space-y-3">
            <div
              className="flex justify-between font-medium"
              style={{ color: slate[500] }}
            >
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {/* Tax placeholder */}
            {/* <div className="flex justify-between text-slate-500 font-medium">
                            <span>Tax (0%)</span>
                            <span>£0.00</span>
                        </div> */}
            <div
              className="h-px my-2"
              style={{ backgroundColor: slate[200] }}
            ></div>
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
            <motion.div
              className="mb-6"
              style={{ x: notesOffsetX, y: notesOffsetY }}
              drag={editable}
              dragMomentum={false}
              onDragEnd={(_, info) => {
                if (!onLayoutChange) return;
                onLayoutChange("notesOffsetX", notesOffsetX + info.offset.x);
                onLayoutChange("notesOffsetY", notesOffsetY + info.offset.y);
              }}
            >
              <h4
                className="font-bold text-xs uppercase tracking-wider mb-2"
                style={{ color: slate[500] }}
              >
                {notesHeading || "Notes"}
              </h4>
              <p
                className="text-sm leading-relaxed"
                style={{ color: slate[600] }}
              >
                {notes}
              </p>
            </motion.div>
          )}

          {termsText && (
            <motion.div
              className="mb-6"
              style={{ x: termsOffsetX, y: termsOffsetY }}
              drag={editable}
              dragMomentum={false}
              onDragEnd={(_, info) => {
                if (!onLayoutChange) return;
                onLayoutChange("termsOffsetX", termsOffsetX + info.offset.x);
                onLayoutChange("termsOffsetY", termsOffsetY + info.offset.y);
              }}
            >
              <h4
                className="font-bold text-xs uppercase tracking-wider mb-2"
                style={{ color: slate[500] }}
              >
                {termsHeading || "Terms & Conditions"}
              </h4>
              <p
                className="text-sm leading-relaxed"
                style={{ color: slate[600] }}
              >
                {termsText}
              </p>
            </motion.div>
          )}

          <motion.div
            className="border-t pt-6 text-center text-xs"
            style={{
              color: slate[400],
              borderColor: slate[200],
              x: footerOffsetX,
              y: footerOffsetY,
            }}
            drag={editable}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              if (!onLayoutChange) return;
              onLayoutChange("footerOffsetX", footerOffsetX + info.offset.x);
              onLayoutChange("footerOffsetY", footerOffsetY + info.offset.y);
            }}
          >
            <p>
              {isSettlement
                ? "Official Drive Safe Settlement Statement"
                : footerText || "Thank you for your business!"}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
