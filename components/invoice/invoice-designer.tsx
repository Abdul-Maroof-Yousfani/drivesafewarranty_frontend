"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";
import { Upload, Plus, Trash2, Palette, Download } from "lucide-react";
import { toast } from "sonner";

type RoleVariant = "super_admin" | "dealer";

type InvoiceItem = {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
};

type PaletteColors = {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
};

type Props = {
  variant: RoleVariant;
};

type DragState = { x: number; y: number; w?: number; h?: number };

function rgbToHex(r: number, g: number, b: number) {
  const toHex = (v: number) => v.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToRgb(hex: string): [number, number, number] {
  const s = hex.replace("#", "");
  const bigint = parseInt(s, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

function clamp(v: number) {
  return Math.max(0, Math.min(255, v));
}

function lighten(hex: string, amount = 20) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(clamp(r + amount), clamp(g + amount), clamp(b + amount));
}

function darken(hex: string, amount = 20) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(clamp(r - amount), clamp(g - amount), clamp(b - amount));
}

async function extractPalette(img: HTMLImageElement): Promise<string[]> {
  try {
    const mod: any = await import("colorthief");
    const CT = mod.default || mod;
    const ct = new CT();
    const palette: number[][] = await ct.getPalette(img, 6);
    return palette.map((p) => rgbToHex(p[0], p[1], p[2]));
  } catch {
    const canvas = document.createElement("canvas");
    const w = Math.max(1, Math.floor(img.naturalWidth / 10));
    const h = Math.max(1, Math.floor(img.naturalHeight / 10));
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return ["#1f2937", "#0ea5e9", "#f59e0b", "#111827"];
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    let r = 0,
      g = 0,
      b = 0,
      count = 0;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }
    const avg = rgbToHex(
      Math.round(r / count),
      Math.round(g / count),
      Math.round(b / count)
    );
    const primary = avg;
    const secondary = lighten(avg, 30);
    const accent = darken(avg, 30);
    const text = "#111827";
    return [primary, secondary, accent, text];
  }
}

export function InvoiceDesigner({ variant }: Props) {
  const [companyName, setCompanyName] = useState(
    variant === "super_admin" ? "Drive Safe Warranty Portal" : "Your Showroom"
  );
  const [companyAddress, setCompanyAddress] = useState(
    "123 Company St, Town, Country"
  );
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [palette, setPalette] = useState<string[]>([
    "#1f2937",
    "#0ea5e9",
    "#f59e0b",
    "#111827",
  ]);
  const [colors, setColors] = useState<PaletteColors>({
    primary: "#0ea5e9",
    secondary: "#1f2937",
    accent: "#f59e0b",
    text: "#111827",
  });
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [recipientType, setRecipientType] = useState<"dealer" | "customer">(
    variant === "super_admin" ? "dealer" : "customer"
  );
  const [billToName, setBillToName] = useState(
    recipientType === "customer" ? "Customer Name" : "Dealer Name"
  );
  const [billToAddress, setBillToAddress] = useState(
    "123 Street, City, Country"
  );
  const [invoiceNumber, setInvoiceNumber] = useState("INV-000001");
  const [invoiceDate, setInvoiceDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [taxRate, setTaxRate] = useState<number>(5);
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: crypto.randomUUID(),
      description: "Extended Warranty (12 months)",
      qty: 1,
      unitPrice: 1500,
    },
    {
      id: crypto.randomUUID(),
      description: "Dealer processing fee",
      qty: 1,
      unitPrice: 250,
    },
  ]);

  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + it.qty * it.unitPrice, 0),
    [items]
  );
  const taxAmount = useMemo(
    () => (subtotal * taxRate) / 100,
    [subtotal, taxRate]
  );
  const total = useMemo(() => subtotal + taxAmount, [subtotal, taxAmount]);
  const [editing, setEditing] = useState(false);
  const [drag, setDrag] = useState<Record<string, DragState>>({});
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setBillToName(
      recipientType === "customer" ? "Customer Name" : "Dealer Name"
    );
  }, [recipientType]);

  useEffect(() => {
    if (imgRef.current && logoUrl) {
      const img = imgRef.current;
      const onLoad = async () => {
        const pal = await extractPalette(img);
        setPalette(pal);
        const primary = pal[0] || colors.primary;
        const secondary = pal[1] || colors.secondary;
        const accent = pal[2] || colors.accent;
        setColors({
          primary,
          secondary,
          accent,
          text: "#111827",
        });
      };
      img.addEventListener("load", onLoad, { once: true });
      return () => img.removeEventListener("load", onLoad);
    }
  }, [logoUrl]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), description: "", qty: 1, unitPrice: 0 },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLogoUrl(url);
  };

  const cycleTheme = () => {
    const idx = palette.findIndex((c) => c === colors.primary);
    const next = palette[(idx + 1) % palette.length] || colors.primary;
    const secondary = palette[(idx + 2) % palette.length] || colors.secondary;
    const accent = palette[(idx + 3) % palette.length] || colors.accent;
    setColors({ primary: next, secondary, accent, text: "#111827" });
  };

  const downloadPDF = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    try {
      const html2canvasMod: any = await import("html2canvas");
      const jsPDFMod: any = await import("jspdf");
      const html2canvas = html2canvasMod.default || html2canvasMod;
      const JsPDFCtor = jsPDFMod.default || jsPDFMod.jsPDF;
      const canvas = await html2canvas(previewRef.current, {
        scale: Math.max(2, window.devicePixelRatio || 2),
        useCORS: true,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc: Document) => {
          const root = clonedDoc.documentElement;
          const setVar = (name: string, value: string) =>
            root.style.setProperty(name, value);
          setVar("--background", "#ffffff");
          setVar("--foreground", "#111827");
          setVar("--primary", colors.primary);
          setVar("--primary-foreground", "#ffffff");
          setVar("--secondary", colors.secondary);
          setVar("--secondary-foreground", "#ffffff");
          setVar("--accent", colors.accent);
          setVar("--accent-foreground", "#111827");
          setVar("--muted", "#f5f5f5");
          setVar("--muted-foreground", "#6b7280");
          setVar("--border", "#e5e7eb");
          setVar("--input", "#e5e7eb");
          setVar("--ring", colors.primary);
          const el = clonedDoc.getElementById("invoice-preview");
          if (el) {
            (el as HTMLElement).style.backgroundColor = "#ffffff";
          }
          clonedDoc.body.style.backgroundColor = "#ffffff";
        },
      });
      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new JsPDFCtor("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(
        pageWidth / canvas.width,
        pageHeight / canvas.height
      );
      const imgWidth = canvas.width * ratio;
      const imgHeight = canvas.height * ratio;
      const x = (pageWidth - imgWidth) / 2;
      pdf.addImage(imgData, "PNG", x, 0, imgWidth, imgHeight);
      pdf.save(`${invoiceNumber}.pdf`);
      toast.success("Invoice downloaded");
    } catch (e) {
      console.error("PDF export error", e);
      toast.error("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  function DraggableBox({
    id,
    children,
    className,
  }: {
    id: string;
    children: React.ReactNode;
    className?: string;
  }) {
    const boxRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);
    const posRef = useRef<{ x: number; y: number }>({ x: drag[id]?.x || 0, y: drag[id]?.y || 0 });
    useEffect(() => {
      const el = boxRef.current;
      const container = containerRef.current;
      if (!el || !container) return;
      let dragging = false;
      let startX = 0;
      let startY = 0;
      let origX = drag[id]?.x || 0;
      let origY = drag[id]?.y || 0;
      const onPointerDown = (ev: PointerEvent) => {
        if (!editing) return;
        ev.preventDefault();
        dragging = true;
        startX = ev.clientX;
        startY = ev.clientY;
        origX = drag[id]?.x || 0;
        origY = drag[id]?.y || 0;
        (ev.target as Element).setPointerCapture?.((ev as any).pointerId);
        el.style.willChange = "transform";
      };
      const onPointerMove = (ev: PointerEvent) => {
        if (!dragging || !editing) return;
        ev.preventDefault();
        const grid = 5;
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        const nx = Math.round((origX + dx) / grid) * grid;
        const ny = Math.round((origY + dy) / grid) * grid;
        const contRect = container.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const maxX = contRect.width - elRect.width;
        const maxY = contRect.height - elRect.height;
        const clampedX = Math.max(0, Math.min(nx, maxX));
        const clampedY = Math.max(0, Math.min(ny, maxY));
        posRef.current = { x: clampedX, y: clampedY };
        if (rafRef.current == null) {
          rafRef.current = requestAnimationFrame(() => {
            el.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;
            rafRef.current = null;
          });
        }
      };
      const onPointerUp = () => {
        dragging = false;
        setDrag((prev) => ({
          ...prev,
          [id]: { ...(prev[id] || {}), x: posRef.current.x, y: posRef.current.y },
        }));
        el.style.willChange = "auto";
      };
      el.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      return () => {
        el.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
      };
    }, [editing, drag[id]?.x, drag[id]?.y]);
    const style = editing
      ? {
          transform: `translate(${drag[id]?.x || 0}px, ${drag[id]?.y || 0}px)`,
          resize: "both" as const,
          overflow: "auto" as const,
          outline: `1px dashed ${colors.primary}`,
          cursor: "move",
          userSelect: "none" as const,
        }
      : undefined;
    return (
      <div ref={boxRef} className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
        <p className="text-muted-foreground mt-2">
          Dynamic template with theme extracted from logo
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center justify-between">
              <span>Preview</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={cycleTheme}
                >
                  <Palette className="h-4 w-4" /> Theme
                </Button>
                <Button
                  className="gap-2"
                  onClick={downloadPDF}
                  disabled={isExporting}
                >
                  <Download className="h-4 w-4" />{" "}
                  {isExporting ? "Exporting..." : "Download PDF"}
                </Button>
                <Button
                  variant={editing ? "default" : "outline"}
                  onClick={() => setEditing((v) => !v)}
                >
                  {editing ? "Editing On" : "Edit Layout"}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div
              ref={containerRef}
              className="rounded-lg border overflow-hidden"
            >
              <div
                ref={previewRef}
                id="invoice-preview"
                className={cn(
                  "p-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4",
                  editing && "relative"
                )}
                style={{ borderBottom: `2px solid ${colors.primary}` }}
              >
                <DraggableBox
                  id="headerLeft"
                  className="flex items-start gap-4"
                >
                  <div className="h-16 w-16 rounded-lg border flex items-center justify-center overflow-hidden bg-muted">
                    {logoUrl ? (
                      <img
                        ref={imgRef}
                        src={logoUrl}
                        alt="Logo"
                        className="h-full w-full object-contain"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{companyName}</div>
                    <div className="text-sm text-muted-foreground">
                      {companyAddress}
                    </div>
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4" /> Upload Logo
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoSelect}
                      />
                    </div>
                  </div>
                </DraggableBox>
                <DraggableBox id="headerRight" className="text-right">
                  <div
                    className="text-3xl font-bold tracking-wider"
                    style={{ color: colors.primary }}
                  >
                    INVOICE
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Invoice #</div>
                    <div className="font-medium">{invoiceNumber}</div>
                    <div className="text-muted-foreground">Invoice date</div>
                    <div className="font-medium">
                      {new Date(invoiceDate).toLocaleDateString()}
                    </div>
                    <div className="text-muted-foreground">Due date</div>
                    <div className="font-medium">
                      {new Date(dueDate).toLocaleDateString()}
                    </div>
                  </div>
                </DraggableBox>
              </div>

              <div className="p-6 grid md:grid-cols-2 gap-6 gap-y-5">
                <DraggableBox id="billTo">
                  <div
                    className="font-medium"
                    style={{ color: colors.primary }}
                  >
                    Bill To
                  </div>
                  <div className="mt-1">{billToName}</div>
                  <div className="text-sm text-muted-foreground">
                    {billToAddress}
                  </div>
                </DraggableBox>
                <DraggableBox
                  id="items"
                  className="rounded-md border w-full md:col-span-2 "
                >
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">QTY</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="w-40 text-right">
                          Unit Price
                        </TableHead>
                        <TableHead className="w-40 text-right">
                          Amount
                        </TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((it) => (
                        <TableRow key={it.id}>
                          <TableCell>
                            <Input
                              type="number"
                              value={it.qty}
                              onChange={(e) => {
                                const v = Number(e.target.value || 0);
                                setItems((prev) =>
                                  prev.map((x) =>
                                    x.id === it.id ? { ...x, qty: v } : x
                                  )
                                );
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={it.description}
                              onChange={(e) => {
                                const v = e.target.value;
                                setItems((prev) =>
                                  prev.map((x) =>
                                    x.id === it.id
                                      ? { ...x, description: v }
                                      : x
                                  )
                                );
                              }}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              value={it.unitPrice}
                              onChange={(e) => {
                                const v = Number(e.target.value || 0);
                                setItems((prev) =>
                                  prev.map((x) =>
                                    x.id === it.id ? { ...x, unitPrice: v } : x
                                  )
                                );
                              }}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(it.qty * it.unitPrice)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(it.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="p-3 border-t flex justify-between">
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={addItem}
                    >
                      <Plus className="h-4 w-4" /> Add Item
                    </Button>
                    <div className="flex items-center gap-3">
                      <Label htmlFor="taxRate">Tax (%)</Label>
                      <Input
                        id="taxRate"
                        type="number"
                        value={taxRate}
                        onChange={(e) =>
                          setTaxRate(Number(e.target.value || 0))
                        }
                        className="w-24"
                      />
                    </div>
                  </div>
                </DraggableBox>
              </div>

              <div className="px-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-2"></div>
                  <DraggableBox id="totals" className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Subtotal
                      </span>
                      <span className="font-medium">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Sales Tax ({taxRate}%)
                      </span>
                      <span className="font-medium">
                        {formatCurrency(taxAmount)}
                      </span>
                    </div>
                    <div
                      className="flex items-center justify-between px-3 py-2 rounded-md font-semibold"
                      style={{
                        backgroundColor: lighten(colors.primary, 220),
                        color: colors.primary,
                        border: `1px solid ${colors.primary}`,
                      }}
                    >
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </DraggableBox>
                </div>
              </div>

              <DraggableBox id="terms" className="p-6">
                <div className="font-medium" style={{ color: colors.primary }}>
                  Terms and Conditions
                </div>
                <div className="text-sm text-muted-foreground">
                  Payment is due in 14 days. Please make checks payable to:{" "}
                  {companyName}.
                </div>
              </DraggableBox>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Template Settings</CardTitle>
            <CardDescription>Customize branding and recipient</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <div className="flex gap-2">
                <Badge
                  variant={variant === "super_admin" ? "default" : "secondary"}
                >
                  Super Admin
                </Badge>
                <Badge variant={variant === "dealer" ? "default" : "secondary"}>
                  Dealer
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Company Address</Label>
              <Input
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Recipient Type</Label>
              <div className="flex gap-2">
                <Button
                  variant={recipientType === "customer" ? "default" : "outline"}
                  onClick={() => setRecipientType("customer")}
                >
                  Customer
                </Button>
                <Button
                  variant={recipientType === "dealer" ? "default" : "outline"}
                  onClick={() => setRecipientType("dealer")}
                >
                  Dealer
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Bill To Name</Label>
              <Input
                value={billToName}
                onChange={(e) => setBillToName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Bill To Address</Label>
              <Input
                value={billToAddress}
                onChange={(e) => setBillToAddress(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Invoice Number</Label>
                <Input
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Invoice Date</Label>
                <Input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Theme Colors</Label>
              <div className="flex items-center gap-2">
                {palette.slice(0, 4).map((c, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      setColors((prev) => ({ ...prev, primary: c }))
                    }
                    className={cn(
                      "h-8 w-8 rounded-md border",
                      c === colors.primary &&
                        "ring-2 ring-offset-2 ring-primary"
                    )}
                    style={{ backgroundColor: c }}
                    aria-label="Theme color"
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
