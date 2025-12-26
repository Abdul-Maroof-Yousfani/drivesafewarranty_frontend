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
    companyName: z.string().optional(),
    companyAddress: z.string().optional(),
    logoUrl: z.string().optional(),
    logoPosition: z.enum(["left", "center", "right"]).default("left"),
    primaryColor: z.string().default("#0f172a"),
    accentColor: z.string().default("#f1f5f9"),
    headerText: z.string().default("INVOICE"),
    billToTitle: z.string().default("Bill To:"),
    footerText: z.string().default("Thank you for your business!"),
    notes: z.string().default("Payment is due immediately upon receipt."),
});

type InvoiceSettingsFormValues = z.infer<typeof invoiceSettingsSchema>;

const defaultSettings: InvoiceSettingsFormValues = {
    companyName: "",
    companyAddress: "",
    logoUrl: "",
    logoPosition: "left",
    primaryColor: "#0f172a",
    accentColor: "#f1f5f9",
    headerText: "INVOICE",
    billToTitle: "Bill To:",
    footerText: "Thank you for your business!",
    notes: "Payment is due immediately upon receipt.",
};

import { InvoiceRenderer, InvoiceData } from "./invoice-renderer";

const mockInvoiceData: InvoiceData = {
    invoiceNumber: "#INV-00001",
    date: new Date().toLocaleDateString(),
    dueDate: new Date().toLocaleDateString(),
    billToName: "John Doe",
    billToAddress: "123 Customer Lane\nCity, Country",
    items: [
        { description: "Warranty Package - Gold Plan", quantity: 1, amount: 499.00 },
        { description: "Admin Fee", quantity: 1, amount: 50.00 },
    ],
    subtotal: 549.00,
    total: 549.00,
};

// --- Mock Invoice Preview Wrapper ---
const InvoicePreview = ({ settings }: { settings: InvoiceSettingsFormValues }) => {
    return (
        <div className="border rounded-md shadow-sm bg-white overflow-hidden">
            <InvoiceRenderer settings={settings} data={mockInvoiceData} />
        </div>
    );
};


import { getInvoiceSettingsAction, saveInvoiceSettingsAction } from "@/lib/actions/invoice-settings";
import { uploadLogoAction } from "@/lib/actions/upload";

// --- Invoice Builder Component ---
export function InvoiceBuilder() {
    const [loading, setLoading] = useState(false);

    const form = useForm<InvoiceSettingsFormValues>({
        resolver: zodResolver(invoiceSettingsSchema),
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
                        // Ensure nulls are handled (if backend returns null for fields)
                        companyName: res.data.companyName || "",
                        companyAddress: res.data.companyAddress || "",
                        logoUrl: res.data.logoUrl || "",
                        headerText: res.data.headerText || defaultSettings.headerText,
                        billToTitle: res.data.billToTitle || defaultSettings.billToTitle,
                        footerText: res.data.footerText || defaultSettings.footerText,
                        notes: res.data.notes || defaultSettings.notes,
                    });
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
            const res = await saveInvoiceSettingsAction(data);
            if (res.status) {
                toast.success("Invoice settings saved successfully");
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
                                        <CardDescription>Set your business details visible on the invoice.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="companyName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Company Name</FormLabel>
                                                    <FormControl><Input placeholder="Your Business Name" {...field} /></FormControl>
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
                                                    <FormControl><Textarea placeholder="123 Street, City, Country" {...field} /></FormControl>
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
                                                            {field.value && (
                                                                <div className="relative w-32 h-16 border rounded bg-gray-50 flex items-center justify-center mb-2">
                                                                    <img src={field.value} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                                                                    <Button
                                                                        type="button"
                                                                        variant="destructive"
                                                                        size="icon"
                                                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                                                        onClick={() => field.onChange("")}
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
                                                                    onChange={async (e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (!file) return;

                                                                        const formData = new FormData();
                                                                        formData.append("file", file);
                                                                        formData.append("fileType", "logo");

                                                                        try {
                                                                            toast.info("Uploading logo...");
                                                                            // This requires an authenticated upload endpoint. 
                                                                            // Since we are inside the component, we need to use a client-side fetch or a server action helper.
                                                                            // Uploading directly via fetch is simplest here as we have client-side context (cookies).
                                                                            // NOTE: This assumes /api/uploads is accessible and uses standard middleware.
                                                                            // A better way would be a server action, but processing FormData in server action for files is tricky in Next.js pages router or simpler setups.
                                                                            // Let's use direct fetch for now, assuming standard API token mechanism in cookies or we need to pass token.
                                                                            // Wait, previous actions used `getAccessToken`. We might need that here.

                                                                            // Let's create a helper function inside or use axios if available, or just fetch with token from cookies?
                                                                            // The `getAccessToken` is a server side utility in `lib/actions`.
                                                                            // On client, we rely on httpOnly cookies effectively for API routes if configured, OR we need the token.
                                                                            // Ideally, `uploadRoutes.js` uses `authenticate` middleware which checks Authorization header.
                                                                            // Our Actions use `getAccessToken` and pass it in header.
                                                                            // On Client, we can't easily get the HttpOnly cookie value to put in header.
                                                                            // BUT, if the cookie is set on the domain, it sends automatically? 
                                                                            // `authMiddleware.js` checks `req.headers.authorization`. It DOES NOT check cookies primarily for access token (only for refresh).
                                                                            // So we need to get the token. 
                                                                            // Options:
                                                                            // 1. Create a Server Action `uploadFileAction(formData)` (Next.js 14 supports this well).
                                                                            // 2. Client side fetch but we need the token.

                                                                            // I will use Option 1: Create a Server Action for upload in `lib/actions/upload.ts`.
                                                                            // BUT for this step, I'll stub the fetch and then create the action in the next step to ensure it works properly.
                                                                            // I will use a hypothetical `uploadLogoAction`.

                                                                            const res = await uploadLogoAction(formData);
                                                                            if (res.status && res.data?.url) {
                                                                                field.onChange(res.data.url);
                                                                                toast.success("Logo uploaded!");
                                                                            } else {
                                                                                toast.error(res.message || "Upload failed");
                                                                            }
                                                                        } catch (err) {
                                                                            console.error(err);
                                                                            toast.error("Upload error");
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </FormControl>
                                                    <FormDescription>Upload a logo image (PNG, JPG).</FormDescription>
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
                                        <CardDescription>Customize colors and layout.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="logoPosition"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Logo Position</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select position" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="left">Left</SelectItem>
                                                            <SelectItem value="center">Center</SelectItem>
                                                            <SelectItem value="right">Right</SelectItem>
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
                                                            <FormControl><Input {...field} placeholder="#000000" /></FormControl>
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
                                                            <FormControl><Input {...field} placeholder="#e5e7eb" /></FormControl>
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
                                        <CardDescription>Default text for your invoices.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="headerText"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Header Label</FormLabel>
                                                    <FormControl><Input placeholder="INVOICE" {...field} /></FormControl>
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
                                                    <FormControl><Input placeholder="Bill To:" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="notes"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Default Notes</FormLabel>
                                                    <FormControl><Textarea placeholder="Terms & Conditions..." {...field} /></FormControl>
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
                                                    <FormControl><Input placeholder="Thank you..." {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>

                        <div className="sticky bottom-0 bg-background/95 backdrop-blur py-4 border-t z-10">
                            <Button type="submit" disabled={loading} className="w-full" size="lg">
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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
                </div>
                <div className="flex-1 bg-muted/30 border rounded-lg p-6 overflow-y-auto shadow-inner flex items-center justify-center">
                    <div className="w-full max-w-[210mm] shadow-2xl transition-all duration-300 ease-in-out">
                        {/* Fixed width simulation for A4 approx width on screen */}
                        <InvoicePreview settings={formValues} />
                    </div>
                </div>
            </div>
        </div>
    );
}
