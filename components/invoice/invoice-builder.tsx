"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Palette, Layout, FileText, Globe } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Schema for invoice settings
const invoiceSettingsSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required"),
  companyAddress: z.string().trim().min(1, "Company address is required"),
  logoUrl: z.string().default(""),
  logoOffsetX: z.number().default(0),
  logoOffsetY: z.number().default(0),
  invoiceInfoOffsetX: z.number().default(0),
  invoiceInfoOffsetY: z.number().default(0),
  companyInfoOffsetX: z.number().default(0),
  companyInfoOffsetY: z.number().default(0),
  primaryColor: z
    .string()
    .trim()
    .min(1, "Primary color is required")
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Invalid hex color"),
  accentColor: z
    .string()
    .trim()
    .min(1, "Accent color is required")
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Invalid hex color"),
  headerText: z.string().trim().min(1, "Header text is required"),
  billToTitle: z.string().trim().min(1, "Bill-to title is required"),
  billToOffsetX: z.number().default(0),
  billToOffsetY: z.number().default(0),
  durationOffsetX: z.number().default(0),
  durationOffsetY: z.number().default(0),
  notesOffsetX: z.number().default(0),
  notesOffsetY: z.number().default(0),
  termsOffsetX: z.number().default(0),
  termsOffsetY: z.number().default(0),
  footerOffsetX: z.number().default(0),
  footerOffsetY: z.number().default(0),
  footerText: z.string().trim().min(1, "Footer text is required"),
  notesHeading: z.string().trim().min(1, "Notes heading is required"),
  notes: z.string().trim().min(1, "Notes are required"),
  termsHeading: z.string().trim().min(1, "Terms heading is required"),
  termsText: z.string().default(""),
  font: z
    .enum([
      "Helvetica",
      "Times-Roman",
      "Courier",
      "Roboto",
      "Open Sans",
      "Arial",
      "Verdana",
      "Georgia",
      "Gill Sans",
      "Trebuchet MS",
    ])
    .default("Helvetica"),
});

type InvoiceSettingsFormValues = z.infer<typeof invoiceSettingsSchema>;

const defaultSettings: InvoiceSettingsFormValues = {
  companyName: "",
  companyAddress: "",
  logoUrl: "",
  logoOffsetX: 0,
  logoOffsetY: 0,
  invoiceInfoOffsetX: 0,
  invoiceInfoOffsetY: 0,
  companyInfoOffsetX: 0,
  companyInfoOffsetY: 0,
  primaryColor: "#0f172a",
  accentColor: "#f1f5f9",
  headerText: "INVOICE",
  billToTitle: "Bill To:",
  billToOffsetX: 0,
  billToOffsetY: 0,
  durationOffsetX: 0,
  durationOffsetY: 0,
  notesOffsetX: 0,
  notesOffsetY: 0,
  termsOffsetX: 0,
  termsOffsetY: 0,
  footerOffsetX: 0,
  footerOffsetY: 0,
  footerText: "Thank you for your business!",
  notesHeading: "Notes",
  notes: "Payment is due immediately upon receipt.",
  termsHeading: "Terms & Conditions",
  termsText: "",
  font: "Helvetica",
};

import { InvoiceRenderer, InvoiceData } from "./invoice-renderer";

const mockInvoiceData: InvoiceData = {
  invoiceNumber: "#INV-000000000000000",
  date: new Date().toLocaleDateString(),
  dueDate: new Date().toLocaleDateString(),
  billToName: "John Doe",
  billToAddress: "123 Customer Lane\nCity, Country",
  items: [
    { description: "Warranty Package - Gold Plan", quantity: 1, amount: 499.0 },
    { description: "Admin Fee", quantity: 1, amount: 50.0 },
  ],
  subtotal: 549.0,
  total: 549.0,
  duration: "12 months",
  vehicle: {
    make: "Toyota",
    model: "Corolla",
    year: 2018,
    vin: "JTDBR32E123456789",
    registrationNumber: "ABC-1234",
  },
};

// --- Mock Invoice Preview Wrapper ---
const InvoicePreview = ({
  settings,
  editable,
  onLayoutChange,
}: {
  settings: InvoiceSettingsFormValues;
  editable: boolean;
  onLayoutChange: (key: keyof InvoiceSettingsFormValues, value: number) => void;
}) => {
  return (
    <div className="border rounded-md shadow-sm bg-white overflow-hidden">
      <InvoiceRenderer
        settings={settings}
        data={mockInvoiceData}
        editable={editable}
        onLayoutChange={onLayoutChange}
      />
    </div>
  );
};

import {
  getInvoiceSettingsAction,
  saveInvoiceSettingsAction,
} from "@/lib/actions/invoice-settings";
import { uploadLogoAction } from "@/lib/actions/upload";

// --- Invoice Builder Component ---
export function InvoiceBuilder() {
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [editingLayout, setEditingLayout] = useState(false);

  const form = useForm<InvoiceSettingsFormValues>({
    resolver: zodResolver(invoiceSettingsSchema) as any,
    defaultValues: defaultSettings,
  });

  // Watch values for live preview
  const formValues = form.watch();

  // Load existing settings
  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const res = await getInvoiceSettingsAction();
        if (res.status && res.data) {
          // Merge defaults with fetched data to ensure all fields exist
          form.reset({
            ...defaultSettings,
            ...res.data,
            // Ensure nulls/undefined from backend are handled
            companyName: res.data.companyName || "",
            companyAddress: res.data.companyAddress || "",
            logoUrl: res.data.logoUrl || "",
            logoOffsetX:
              typeof res.data.logoOffsetX === "number"
                ? res.data.logoOffsetX
                : 0,
            logoOffsetY:
              typeof res.data.logoOffsetY === "number"
                ? res.data.logoOffsetY
                : 0,
            invoiceInfoOffsetX:
              typeof res.data.invoiceInfoOffsetX === "number"
                ? res.data.invoiceInfoOffsetX
                : 0,
            invoiceInfoOffsetY:
              typeof res.data.invoiceInfoOffsetY === "number"
                ? res.data.invoiceInfoOffsetY
                : 0,
            companyInfoOffsetX:
              typeof res.data.companyInfoOffsetX === "number"
                ? res.data.companyInfoOffsetX
                : 0,
            companyInfoOffsetY:
              typeof res.data.companyInfoOffsetY === "number"
                ? res.data.companyInfoOffsetY
                : 0,
            headerText: res.data.headerText || defaultSettings.headerText,
            billToTitle: res.data.billToTitle || defaultSettings.billToTitle,
            billToOffsetX:
              typeof res.data.billToOffsetX === "number"
                ? res.data.billToOffsetX
                : 0,
            billToOffsetY:
              typeof res.data.billToOffsetY === "number"
                ? res.data.billToOffsetY
                : 0,
            durationOffsetX:
              typeof res.data.durationOffsetX === "number"
                ? res.data.durationOffsetX
                : 0,
            durationOffsetY:
              typeof res.data.durationOffsetY === "number"
                ? res.data.durationOffsetY
                : 0,
            notesOffsetX:
              typeof res.data.notesOffsetX === "number"
                ? res.data.notesOffsetX
                : 0,
            notesOffsetY:
              typeof res.data.notesOffsetY === "number"
                ? res.data.notesOffsetY
                : 0,
            termsOffsetX:
              typeof res.data.termsOffsetX === "number"
                ? res.data.termsOffsetX
                : 0,
            termsOffsetY:
              typeof res.data.termsOffsetY === "number"
                ? res.data.termsOffsetY
                : 0,
            footerOffsetX:
              typeof res.data.footerOffsetX === "number"
                ? res.data.footerOffsetX
                : 0,
            footerOffsetY:
              typeof res.data.footerOffsetY === "number"
                ? res.data.footerOffsetY
                : 0,
            footerText: res.data.footerText || defaultSettings.footerText,
            notesHeading: res.data.notesHeading || defaultSettings.notesHeading,
            notes: res.data.notes || defaultSettings.notes,
            termsHeading: res.data.termsHeading || defaultSettings.termsHeading,
            termsText: res.data.termsText || defaultSettings.termsText,
            font: (res.data.font as any) || defaultSettings.font,
          });

          try {
            const ls =
              typeof window !== "undefined"
                ? window.localStorage.getItem("invoiceLayoutSettings")
                : null;
            if (ls) {
              const parsed = JSON.parse(ls);
              if (parsed && typeof parsed === "object") {
                form.setValue(
                  "logoOffsetX",
                  typeof parsed.logoOffsetX === "number"
                    ? parsed.logoOffsetX
                    : 0
                );
                form.setValue(
                  "logoOffsetY",
                  typeof parsed.logoOffsetY === "number"
                    ? parsed.logoOffsetY
                    : 0
                );
                form.setValue(
                  "invoiceInfoOffsetX",
                  typeof parsed.invoiceInfoOffsetX === "number"
                    ? parsed.invoiceInfoOffsetX
                    : 0
                );
                form.setValue(
                  "invoiceInfoOffsetY",
                  typeof parsed.invoiceInfoOffsetY === "number"
                    ? parsed.invoiceInfoOffsetY
                    : 0
                );
                form.setValue(
                  "companyInfoOffsetX",
                  typeof parsed.companyInfoOffsetX === "number"
                    ? parsed.companyInfoOffsetX
                    : 0
                );
                form.setValue(
                  "companyInfoOffsetY",
                  typeof parsed.companyInfoOffsetY === "number"
                    ? parsed.companyInfoOffsetY
                    : 0
                );
                form.setValue(
                  "billToOffsetX",
                  typeof parsed.billToOffsetX === "number"
                    ? parsed.billToOffsetX
                    : 0
                );
                form.setValue(
                  "billToOffsetY",
                  typeof parsed.billToOffsetY === "number"
                    ? parsed.billToOffsetY
                    : 0
                );
                form.setValue(
                  "durationOffsetX",
                  typeof parsed.durationOffsetX === "number"
                    ? parsed.durationOffsetX
                    : 0
                );
                form.setValue(
                  "durationOffsetY",
                  typeof parsed.durationOffsetY === "number"
                    ? parsed.durationOffsetY
                    : 0
                );
                form.setValue(
                  "notesOffsetX",
                  typeof parsed.notesOffsetX === "number"
                    ? parsed.notesOffsetX
                    : 0
                );
                form.setValue(
                  "notesOffsetY",
                  typeof parsed.notesOffsetY === "number"
                    ? parsed.notesOffsetY
                    : 0
                );
                form.setValue(
                  "termsOffsetX",
                  typeof parsed.termsOffsetX === "number"
                    ? parsed.termsOffsetX
                    : 0
                );
                form.setValue(
                  "termsOffsetY",
                  typeof parsed.termsOffsetY === "number"
                    ? parsed.termsOffsetY
                    : 0
                );
                form.setValue(
                  "footerOffsetX",
                  typeof parsed.footerOffsetX === "number"
                    ? parsed.footerOffsetX
                    : 0
                );
                form.setValue(
                  "footerOffsetY",
                  typeof parsed.footerOffsetY === "number"
                    ? parsed.footerOffsetY
                    : 0
                );
              }
            }
          } catch {}
        }
      } catch (error) {
        console.error("Failed to load settings", error);
        toast.error("Could not load invoice settings");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [form]);

  const onSubmit = async (data: InvoiceSettingsFormValues) => {
    setLoading(true);
    try {
      let finalLogoUrl = data.logoUrl;

      // Upload logo if a new file is selected
      if (logoFile) {
        const formData = new FormData();
        formData.append("file", logoFile);
        formData.append("fileType", "logo");

        const uploadRes = await uploadLogoAction(formData);
        if (uploadRes.status && uploadRes.data?.url) {
          finalLogoUrl = uploadRes.data.url;
        } else {
          const errorMsg = uploadRes.message || "Failed to upload logo";
          toast.error(`${errorMsg}. Saving other settings...`);
          console.error("Logo upload error:", uploadRes);
        }
      }

      const res = await saveInvoiceSettingsAction({
        ...data,
        logoUrl: finalLogoUrl,
      });

      if (res.status) {
        toast.success("Invoice settings saved successfully");
        // Update form with the new logo URL to reset file state logic if needed
        form.setValue("logoUrl", finalLogoUrl);
        setLogoFile(null);
        try {
          const layout = {
            logoOffsetX: form.getValues("logoOffsetX"),
            logoOffsetY: form.getValues("logoOffsetY"),
            invoiceInfoOffsetX: form.getValues("invoiceInfoOffsetX"),
            invoiceInfoOffsetY: form.getValues("invoiceInfoOffsetY"),
            companyInfoOffsetX: form.getValues("companyInfoOffsetX"),
            companyInfoOffsetY: form.getValues("companyInfoOffsetY"),
            billToOffsetX: form.getValues("billToOffsetX"),
            billToOffsetY: form.getValues("billToOffsetY"),
            durationOffsetX: form.getValues("durationOffsetX"),
            durationOffsetY: form.getValues("durationOffsetY"),
            notesOffsetX: form.getValues("notesOffsetX"),
            notesOffsetY: form.getValues("notesOffsetY"),
            termsOffsetX: form.getValues("termsOffsetX"),
            termsOffsetY: form.getValues("termsOffsetY"),
            footerOffsetX: form.getValues("footerOffsetX"),
            footerOffsetY: form.getValues("footerOffsetY"),
          };
          if (typeof window !== "undefined") {
            window.localStorage.setItem(
              "invoiceLayoutSettings",
              JSON.stringify(layout)
            );
          }
        } catch {}
      } else {
        toast.error(res.message || "Failed to save settings");
      }
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-100px)]">
      {/* Left Panel: Controls */}
      <div className="lg:col-span-5 h-full overflow-y-auto pr-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="company" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="company">
                  <Globe className="h-4 w-4 mr-2" /> Company
                </TabsTrigger>
                <TabsTrigger value="design">
                  <Palette className="h-4 w-4 mr-2" /> Design
                </TabsTrigger>
                <TabsTrigger value="content">
                  <FileText className="h-4 w-4 mr-2" /> Content
                </TabsTrigger>
              </TabsList>

              <TabsContent value="company" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Company Details</CardTitle>
                    <CardDescription>
                      Set your business details visible on the invoice.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your Business Name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="companyAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Address</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="123 Street, City, Country"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="logoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logo</FormLabel>
                          <FormControl>
                            <div className="flex flex-col gap-2">
                              {(field.value || logoFile) && (
                                <div className="relative w-32 h-16 border rounded bg-gray-50 flex items-center justify-center mb-2">
                                  <img
                                    src={
                                      logoFile
                                        ? URL.createObjectURL(logoFile)
                                        : field.value
                                    }
                                    alt="Logo Preview"
                                    className="max-w-full max-h-full object-contain"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                    onClick={() => {
                                      field.onChange("");
                                      setLogoFile(null);
                                    }}
                                  >
                                    <span className="sr-only">Remove</span>
                                    <span aria-hidden="true">&times;</span>
                                  </Button>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    setLogoFile(file);

                                    // Create a local blob URL for preview
                                    const previewUrl =
                                      URL.createObjectURL(file);
                                    // Update form state so Live Preview (which watches form) sees it
                                    form.setValue("logoUrl", previewUrl);

                                    // Clean up blob URL on unmount or change if needed,
                                    // but for now this is the simplest fix.
                                  }}
                                />
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Upload a logo image (PNG, JPG). Upload happens when
                            saving.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="design" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>
                      Customize colors and layout.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="font"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Font Style</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select font" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem
                                value="Helvetica"
                                style={{ fontFamily: "Helvetica, sans-serif" }}
                              >
                                Helvetica (Standard)
                              </SelectItem>
                              <SelectItem
                                value="Times-Roman"
                                style={{ fontFamily: "Times New Roman, serif" }}
                              >
                                Times Roman (Serif)
                              </SelectItem>
                              <SelectItem
                                value="Courier"
                                style={{ fontFamily: "Courier New, monospace" }}
                              >
                                Courier (Monospace)
                              </SelectItem>
                              <SelectItem
                                value="Roboto"
                                style={{ fontFamily: "Roboto, sans-serif" }}
                              >
                                Roboto (Sans)
                              </SelectItem>
                              <SelectItem
                                value="Open Sans"
                                style={{ fontFamily: "Open Sans, sans-serif" }}
                              >
                                Open Sans (Sans)
                              </SelectItem>
                              <SelectItem
                                value="Arial"
                                style={{ fontFamily: "Arial, sans-serif" }}
                              >
                                Arial
                              </SelectItem>
                              <SelectItem
                                value="Verdana"
                                style={{ fontFamily: "Verdana, sans-serif" }}
                              >
                                Verdana
                              </SelectItem>
                              <SelectItem
                                value="Georgia"
                                style={{ fontFamily: "Georgia, serif" }}
                              >
                                Georgia
                              </SelectItem>
                              <SelectItem
                                value="Gill Sans"
                                style={{ fontFamily: "Gill Sans, sans-serif" }}
                              >
                                Gill Sans
                              </SelectItem>
                              <SelectItem
                                value="Trebuchet MS"
                                style={{
                                  fontFamily: "Trebuchet MS, sans-serif",
                                }}
                              >
                                Trebuchet MS
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="primaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Color</FormLabel>
                            <div className="flex gap-2">
                              <div className="w-10 h-10 rounded border overflow-hidden">
                                <input
                                  type="color"
                                  className="w-14 h-14 -m-2 cursor-pointer p-0 border-0"
                                  {...field}
                                />
                              </div>
                              <FormControl>
                                <Input {...field} placeholder="#000000" />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="accentColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Accent Color</FormLabel>
                            <div className="flex gap-2">
                              <div className="w-10 h-10 rounded border overflow-hidden">
                                <input
                                  type="color"
                                  className="w-14 h-14 -m-2 cursor-pointer p-0 border-0"
                                  {...field}
                                />
                              </div>
                              <FormControl>
                                <Input {...field} placeholder="#e5e7eb" />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="content" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Invoice Text</CardTitle>
                    <CardDescription>
                      Default text for your invoices.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="headerText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Header Label</FormLabel>
                          <FormControl>
                            <Input placeholder="INVOICE" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="billToTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bill To Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Bill To:" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="notesHeading"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes Heading</FormLabel>
                          <FormControl>
                            <Input placeholder="Notes" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes Text</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Notes..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="termsHeading"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Terms & Conditions Heading</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Terms & Conditions"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="termsText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Terms & Conditions Text</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Terms & Conditions..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="footerText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Footer Text</FormLabel>
                          <FormControl>
                            <Input placeholder="Thank you..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="sticky bottom-0 bg-background/95 backdrop-blur py-4 border-t z-10">
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Save Template
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Right Panel: Live Preview */}
      <div className="lg:col-span-7 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-muted-foreground flex items-center">
            <Layout className="mr-2 h-4 w-4" /> Live Preview
          </h3>
          <div className="text-xs text-muted-foreground">
            This is how your invoice will look
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={editingLayout ? "default" : "secondary"}
              size="sm"
              onClick={() => setEditingLayout(!editingLayout)}
            >
              {editingLayout ? "Editing Layout (On)" : "Edit Layout"}
            </Button>
            {editingLayout && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  form.setValue("logoOffsetX", 0);
                  form.setValue("logoOffsetY", 0);
                  form.setValue("invoiceInfoOffsetX", 0);
                  form.setValue("invoiceInfoOffsetY", 0);
                  form.setValue("companyInfoOffsetX", 0);
                  form.setValue("companyInfoOffsetY", 0);
                  form.setValue("billToOffsetX", 0);
                  form.setValue("billToOffsetY", 0);
                  form.setValue("durationOffsetX", 0);
                  form.setValue("durationOffsetY", 0);
                  form.setValue("notesOffsetX", 0);
                  form.setValue("notesOffsetY", 0);
                  form.setValue("termsOffsetX", 0);
                  form.setValue("termsOffsetY", 0);
                  form.setValue("footerOffsetX", 0);
                  form.setValue("footerOffsetY", 0);
                }}
              >
                Reset Positions
              </Button>
            )}
          </div>
        </div>
        <div className="flex-1 bg-muted/30 border rounded-lg p-6 overflow-y-auto shadow-inner flex items-center justify-center">
          <div className="w-full max-w-[210mm] shadow-2xl transition-all duration-300 ease-in-out">
            {/* Fixed width simulation for A4 approx width on screen */}
            <InvoicePreview
              settings={formValues}
              editable={editingLayout}
              onLayoutChange={(key, value) => {
                form.setValue(key, value, {
                  shouldDirty: true,
                  shouldTouch: true,
                });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
