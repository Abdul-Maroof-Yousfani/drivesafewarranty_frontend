"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getWarrantySaleByIdAction } from "@/lib/actions/warranty-sales";
import { getInvoiceByIdAction } from "@/lib/actions/invoices";
import { getInvoiceSettingsAction } from "@/lib/actions/invoice-settings";
import {
  InvoiceRenderer,
  InvoiceData,
  InvoiceSettings,
} from "@/components/invoice/invoice-renderer";
import { Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function InvoicePage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const variant = searchParams.get("variant") || "customer";
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<InvoiceData | null>(null);
  const [settings, setSettings] = useState<InvoiceSettings | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;

      try {
        const dealerId = searchParams.get("dealerId") || undefined;
        // 1. Try to fetch Invoice first (for dealer invoices)
        const invoiceRes = await getInvoiceByIdAction(id as string, dealerId);
        let invoice = null;
        let sale = null;

        if (invoiceRes.status && invoiceRes.data) {
          invoice = invoiceRes.data;
          sale = invoice.warrantySale || null;
        } else {
          // 2. If not an invoice, try fetching as Warranty Sale (for customer invoices)
          const saleRes = await getWarrantySaleByIdAction(id as string);
          if (!saleRes.status || !saleRes.data) {
            toast.error("Invoice not found");
            setLoading(false);
            return;
          }
          sale = saleRes.data;
        }

        if (!sale) {
          toast.error("Invoice data not found");
          setLoading(false);
          return;
        }

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

        // Calculate actual duration precisely using month/year diff
        const start = new Date(sale.coverageStartDate);
        const end = new Date(sale.coverageEndDate);

        // Calculate difference in months
        let durationMonths = (end.getFullYear() - start.getFullYear()) * 12;
        durationMonths -= start.getMonth();
        durationMonths += end.getMonth();

        // Adjust if end day is significantly less than start day (incomplete final month)
        // However, for warranties, end date is usually "Start + N months - 1 day" or similar.
        // A simple robust way for warranties is usually rounding to nearest 12.
        // Let's assume standard policy lengths:
        if (durationMonths >= 35 && durationMonths <= 37) durationMonths = 36;
        else if (durationMonths >= 23 && durationMonths <= 25)
          durationMonths = 24;
        else if (durationMonths >= 11 && durationMonths <= 13)
          durationMonths = 12;

        // Pick the correct dealer cost based on duration
        let correctDealerCost = Number(sale.warrantyPrice); // Fallback
        if (durationMonths === 12) {
          correctDealerCost = Number(
            sale.dealerCost12Months || correctDealerCost
          );
        } else if (durationMonths === 24) {
          correctDealerCost = Number(
            sale.dealerCost24Months || correctDealerCost
          );
        } else if (durationMonths === 36) {
          correctDealerCost = Number(
            sale.dealerCost36Months || correctDealerCost
          );
        }

        // If we have an invoice object, it's a dealer invoice (from SA to dealer)
        // Use SA's template (dealerId = null)
        // If settlement variant, also use SA's template
        // Otherwise, use the dealer's branding for customer invoices
        // If we have an invoice object AND it has a dealerId, it's a dealer invoice (settlement)
        // If invoice but no dealerId, it's a direct customer invoice
        const isDealerInvoice = !!invoice && !!invoice.dealerId;
        const settingsRes = await getInvoiceSettingsAction(
          isDealerInvoice || isSettlement ? undefined : sale.dealer?.id,
          isDealerInvoice || isSettlement ? "master" : undefined
        );

        const planLevelRaw = sale.warrantyPackage?.planLevel?.trim();
        const planLevel = planLevelRaw
          ? planLevelRaw
              .split(/\s+/)
              .filter(Boolean)
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
              .join(" ")
          : null;
        const planSuffix = planLevel
          ? ` - ${
              planLevel.toLowerCase().includes("plan")
                ? planLevel
                : `${planLevel} Plan`
            }`
          : "";

        const saleData: InvoiceData = {
          invoiceNumber: invoice?.invoiceNumber || sale.policyNumber,
          variant: (isDealerInvoice ? "settlement" : (invoice ? "customer" : variant)) as any,
          date: invoice
            ? new Date(invoice.invoiceDate).toLocaleDateString()
            : new Date(sale.saleDate).toLocaleDateString(),
          dueDate: invoice
            ? new Date(invoice.dueDate).toLocaleDateString()
            : new Date(sale.saleDate).toLocaleDateString(),
          billToName:
            isDealerInvoice || isSettlement
              ? invoice?.dealer?.businessNameLegal ||
                sale.dealer?.businessNameLegal ||
                "The Dealer"
              : sale.customer
              ? `${sale.customer.firstName} ${sale.customer.lastName}`
              : "Valued Customer",
          billToAddress:
            isDealerInvoice || isSettlement
              ? invoice?.dealer?.businessAddress ||
                sale.dealer?.businessAddress ||
                ""
              : sale.customer?.address || "",
          billToEmail:
            isDealerInvoice || isSettlement
              ? invoice?.dealer?.email || sale.dealer?.email
              : sale.customer?.email,
          items: [
            {
              description: `Warranty Package - ${sale.warrantyPackage.name}${planSuffix}`,
              quantity: 1,
              amount: invoice
                ? Number(invoice.amount)
                : isSettlement
                ? correctDealerCost
                : Number(sale.warrantyPrice),
              cost: invoice ? Number(invoice.amount) : correctDealerCost,
            },
          ],
          subtotal: invoice
            ? Number(invoice.amount)
            : isSettlement
            ? correctDealerCost
            : Number(sale.warrantyPrice),
          total: invoice
            ? Number(invoice.totalAmount || invoice.amount)
            : isSettlement
            ? correctDealerCost
            : Number(sale.warrantyPrice),
          duration: `${durationMonths} months`,
          vehicle: sale.vehicle
            ? {
                make: sale.vehicle.make,
                model: sale.vehicle.model,
                year: Number(sale.vehicle.year),
                vin: sale.vehicle.vin,
                registrationNumber: sale.vehicle.registrationNumber,
              }
            : undefined,
        };

        setData(saleData);

        // Process Settings (Default Fallback) + merge local layout offsets
        if (settingsRes.status && settingsRes.data) {
          let merged = settingsRes.data as InvoiceSettings;
          try {
            const ls =
              typeof window !== "undefined"
                ? window.localStorage.getItem("invoiceLayoutSettings")
                : null;
            if (ls) {
              const parsed = JSON.parse(ls);
              if (parsed && typeof parsed === "object") {
                merged = {
                  ...merged,
                  logoOffsetX:
                    typeof parsed.logoOffsetX === "number"
                      ? parsed.logoOffsetX
                      : merged.logoOffsetX,
                  logoOffsetY:
                    typeof parsed.logoOffsetY === "number"
                      ? parsed.logoOffsetY
                      : merged.logoOffsetY,
                  invoiceInfoOffsetX:
                    typeof parsed.invoiceInfoOffsetX === "number"
                      ? parsed.invoiceInfoOffsetX
                      : (merged as any).invoiceInfoOffsetX,
                  invoiceInfoOffsetY:
                    typeof parsed.invoiceInfoOffsetY === "number"
                      ? parsed.invoiceInfoOffsetY
                      : (merged as any).invoiceInfoOffsetY,
                  companyInfoOffsetX:
                    typeof parsed.companyInfoOffsetX === "number"
                      ? parsed.companyInfoOffsetX
                      : (merged as any).companyInfoOffsetX,
                  companyInfoOffsetY:
                    typeof parsed.companyInfoOffsetY === "number"
                      ? parsed.companyInfoOffsetY
                      : (merged as any).companyInfoOffsetY,
                  billToOffsetX:
                    typeof parsed.billToOffsetX === "number"
                      ? parsed.billToOffsetX
                      : merged.billToOffsetX,
                  billToOffsetY:
                    typeof parsed.billToOffsetY === "number"
                      ? parsed.billToOffsetY
                      : merged.billToOffsetY,
                  durationOffsetX:
                    typeof parsed.durationOffsetX === "number"
                      ? parsed.durationOffsetX
                      : (merged as any).durationOffsetX,
                  durationOffsetY:
                    typeof parsed.durationOffsetY === "number"
                      ? parsed.durationOffsetY
                      : (merged as any).durationOffsetY,
                } as InvoiceSettings;
              }
            }
          } catch {}
          setSettings(merged);
        } else {
          // Fallback to Dealer's Business Info if no custom settings exist
          // This creates a "default template" using the dealer's profile
          if (!isSettlement && sale.dealer) {
            setSettings({
              companyName:
                sale.dealer.businessNameTrading ||
                sale.dealer.businessNameLegal ||
                "Company Name",
              companyAddress: [
                sale.dealer.businessAddress,
                sale.dealer.email,
                sale.dealer.phone,
              ]
                .filter((v) => !!v)
                .join("\n"),
              primaryColor: "#0f172a", // Default Slate-900
              accentColor: "#f1f5f9", // Default Slate-100
              headerText: "INVOICE",
              billToTitle: "Bill To:",
              footerText: "Thank you for your business!",
              // logoUrl: sale.dealer.logoUrl // If we had this on dealer model
            });
          } else {
            // Minimal default
            setSettings({
              companyName: "Drive Safe",
              headerText: "INVOICE",
            });
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load invoice");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, variant]);

  const handleDownloadPDF = async () => {
    if (!data || !settings) return;

    try {
      const target = document.getElementById("invoice-content");
      if (!target) {
        toast.error("Invoice preview not found");
        return;
      }

      toast.info("Generating PDF...");

      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      try {
        await (document as any).fonts?.ready;
      } catch {}

      const images = Array.from(target.querySelectorAll("img")).filter(
        (img) => !img.complete
      );
      await Promise.all(
        images.map(
          (img) =>
            new Promise<void>((resolve) => {
              const done = () => resolve();
              img.addEventListener("load", done, { once: true });
              img.addEventListener("error", done, { once: true });
            })
        )
      );

      const rect = target.getBoundingClientRect();

      const baseOptions = {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollX: -window.scrollX,
        scrollY: -window.scrollY,
        onclone: (clonedDoc: Document) => {
          const clonedTarget = clonedDoc.getElementById("invoice-content");
          if (!clonedTarget) return;

          const view = clonedDoc.defaultView;
          if (!view) return;

          const ctx = clonedDoc.createElement("canvas").getContext("2d");
          if (!ctx) return;

          const isUnsupported = (value: string) =>
            /lab\(|oklab\(|oklch\(|color-mix\(|color\(/i.test(value);

          const normalize = (value: string) => {
            if (!value || !isUnsupported(value)) return null;
            try {
              ctx.fillStyle = "#000000";
              ctx.fillStyle = value as any;
              const out = ctx.fillStyle;
              if (!out || typeof out !== "string") return "#000000";
              return isUnsupported(out) ? "#000000" : out;
            } catch {
              return "#000000";
            }
          };

          const props: Array<
            [keyof CSSStyleDeclaration, keyof CSSStyleDeclaration]
          > = [
            ["backgroundColor", "backgroundColor"],
            ["color", "color"],
            ["borderTopColor", "borderTopColor"],
            ["borderRightColor", "borderRightColor"],
            ["borderBottomColor", "borderBottomColor"],
            ["borderLeftColor", "borderLeftColor"],
            ["outlineColor", "outlineColor"],
            ["caretColor", "caretColor"],
            ["fill", "fill"],
            ["stroke", "stroke"],
            ["textDecorationColor", "textDecorationColor"],
            ["columnRuleColor", "columnRuleColor"],
          ];

          const elementSet = new Set<HTMLElement>();
          elementSet.add(clonedTarget as HTMLElement);
          for (const el of Array.from(clonedTarget.querySelectorAll("*"))) {
            elementSet.add(el as HTMLElement);
          }
          let parent = (clonedTarget as HTMLElement).parentElement;
          while (parent) {
            elementSet.add(parent);
            parent = parent.parentElement;
          }
          const body = clonedDoc.body;
          const html = clonedDoc.documentElement;
          if (body) elementSet.add(body);
          if (html) elementSet.add(html);

          for (const el of elementSet) {
            const cs = view.getComputedStyle(el);
            for (const [computedKey, styleKey] of props) {
              const val = (cs as any)[computedKey] as string;
              const normalized = normalize(val);
              if (normalized) (el.style as any)[styleKey] = normalized;
            }
            const boxShadow = cs.boxShadow;
            if (boxShadow && isUnsupported(boxShadow))
              el.style.boxShadow = "none";
            const textShadow = (cs as any).textShadow as string | undefined;
            if (textShadow && isUnsupported(textShadow))
              (el.style as any).textShadow = "none";
          }
        },
      } as const;

      const renderCanvas = async (opts?: {
        foreignObjectRendering?: boolean;
      }) => html2canvas(target, { ...baseOptions, ...(opts || {}) });

      let canvas: HTMLCanvasElement;
      try {
        canvas = await renderCanvas();
      } catch (e: any) {
        const msg = String(e?.message || e || "");
        if (/unsupported color function|lab\(/i.test(msg)) {
          canvas = await renderCanvas({ foreignObjectRendering: true });
        } else {
          throw e;
        }
      }

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const pxToPt = (px: number) => px * 0.75;
      const contentWidthPt = pxToPt(rect.width);
      const contentHeightPt = pxToPt(rect.height);

      const margin = 0;
      const usablePageWidth = pageWidth - margin * 2;
      const usablePageHeight = pageHeight - margin * 2;

      const scale = Math.min(1, usablePageWidth / contentWidthPt);
      const drawWidth = contentWidthPt * scale;
      const drawHeight = contentHeightPt * scale;
      const x = (pageWidth - drawWidth) / 2;

      let yOffset = 0;
      while (yOffset < drawHeight) {
        pdf.addImage(
          imgData,
          "PNG",
          x,
          margin - yOffset,
          drawWidth,
          drawHeight
        );
        yOffset += usablePageHeight;
        if (yOffset < drawHeight) pdf.addPage();
      }

      pdf.save(`Invoice_${data.invoiceNumber}.pdf`);
      toast.success("PDF downloaded successfully");
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

  if (!data)
    return (
      <div className="p-8 text-center text-red-500">Invoice not found.</div>
    );

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
          <Button variant="outline" onClick={() => window.history.back()}>
            Back
          </Button>
          <Button onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>

        <div
          id="invoice-content"
          className="shadow-lg print:shadow-none bg-white w-[210mm] min-h-[297mm] mx-auto"
        >
          <InvoiceRenderer settings={settings || {}} data={data} />
        </div>
      </div>
    </div>
  );
}
