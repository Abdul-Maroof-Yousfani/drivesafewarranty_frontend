"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, ArrowLeft, CalendarIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { getDealerById, updateDealer } from "@/lib/actions/dealer";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const dealerSchema = z.object({
  // Business Information
  businessNameLegal: z.string().min(1, "Legal business name is required").max(100, "Name too long"),
  businessNameTrading: z.string().max(100, "Name too long").optional(),
  businessAddress: z.string().min(1, "Business address is required").max(255, "Address too long"),

  // Contact Information
  contactPersonName: z.string().min(1, "Contact person name is required").max(100, "Name too long"),
  phone: z.string().min(1, "Phone number is required").max(13, "Phone number too long").regex(/^(?:\+?\d{1,3})?[\d\s\-]{7,15}$/, "Invalid phone number (e.g., 07123456789 or +447123456789)"),
  email: z.string().email("Invalid email address").max(100, "Email too long"),

  // Business Registration
  dealerLicenseNumber: z.string().min(1, "Dealer license number is required").max(50, "License number too long"),
  businessRegistrationNumber: z
    .string()
    .min(1, "Business registration number is required")
    .max(50, "Registration number too long"),
 
  // Bank Details
  bankName: z.string().min(1, "Bank name is required").max(100, "Bank name too long"),
  accountNumber: z.string().min(1, "Account number is required").max(50, "Account number too long"),
  accountHolderName: z.string().min(1, "Account holder name is required").max(100, "Name too long"),
  routingNumber: z.string().max(50, "Routing number too long").optional(),

  // Authorized Signatory
  authorizedSignatoryName: z
    .string()
    .min(1, "Authorized signatory name is required")
    .max(100, "Name too long"),
  authorizedSignatoryTitle: z
    .string()
    .min(1, "Authorized signatory title is required")
    .max(100, "Title too long"),
  authorizedSignatoryEmail: z
    .string()
    .email("Invalid email address")
    .max(100, "Email too long")
    .optional()
    .or(z.literal("")),
  authorizedSignatoryPhone: z.string().max(13, "Phone too long").optional().refine((val) => !val || /^(?:\+?\d{1,3})?[\d\s\-]{7,15}$/.test(val), {
    message: "Invalid phone number (e.g., 07123456789 or +447123456789)",
  }),

  // Agreement
  dealerAgreementSigned: z.boolean(),
  hasHrmAccess: z.boolean(),
  onboardingDate: z.date(),
});

type DealerFormValues = z.infer<typeof dealerSchema>;

export default function EditDealerPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<DealerFormValues>({
    resolver: zodResolver(dealerSchema),
    defaultValues: {
      businessNameLegal: "",
      businessNameTrading: "",
      businessAddress: "",
      contactPersonName: "",
      phone: "",
      email: "",
      dealerLicenseNumber: "",
      businessRegistrationNumber: "",
      bankName: "",
      accountNumber: "",
      accountHolderName: "",
      routingNumber: "",
      authorizedSignatoryName: "",
      authorizedSignatoryTitle: "",
      authorizedSignatoryEmail: "",
      authorizedSignatoryPhone: "",
      dealerAgreementSigned: false,
      hasHrmAccess: false,
      onboardingDate: new Date(),
    },
  });

  useEffect(() => {
    const fetchDealer = async () => {
      if (!params.id) return;
      try {
        const result = await getDealerById(params.id as string);
        if (result.status && result.data) {
          const d = result.data;
          form.reset({
            businessNameLegal: d.businessNameLegal,
            businessNameTrading: d.businessNameTrading || "",
            businessAddress: d.businessAddress,
            contactPersonName: d.contactPersonName,
            phone: d.phone,
            email: d.email,
            dealerLicenseNumber: d.dealerLicenseNumber || "",
            businessRegistrationNumber: d.businessRegistrationNumber || "",
            bankName: d.bankDetails?.bankName || "",
            accountNumber: d.bankDetails?.accountNumber || "",
            accountHolderName: d.bankDetails?.accountHolderName || "",
            routingNumber: d.bankDetails?.routingNumber || "",
            authorizedSignatoryName: d.authorizedSignatory?.name || "",
            authorizedSignatoryTitle: d.authorizedSignatory?.title || "",
            authorizedSignatoryEmail: d.authorizedSignatory?.email || "",
            authorizedSignatoryPhone: d.authorizedSignatory?.phone || "",
            dealerAgreementSigned: !!d.dealerAgreementSigned,
            hasHrmAccess: !!d.hasHrmAccess,
            onboardingDate: d.onboardingDate ? new Date(d.onboardingDate) : new Date(),
          });
        } else {
          toast.error(result.message || "Failed to fetch dealer details");
        }
      } catch (error) {
        console.error("Error fetching dealer:", error);
        toast.error("Failed to load dealer");
      } finally {
        setLoading(false);
      }
    };
    fetchDealer();
  }, [params.id, form]);

  const onSubmit = async (data: DealerFormValues) => {
    setSaving(true);
    try {
      const updateData = {
        businessNameLegal: data.businessNameLegal,
        businessNameTrading: data.businessNameTrading,
        businessAddress: data.businessAddress,
        contactPersonName: data.contactPersonName,
        phone: data.phone,
        email: data.email,
        dealerLicenseNumber: data.dealerLicenseNumber,
        businessRegistrationNumber: data.businessRegistrationNumber,
        bankDetails: {
          bankName: data.bankName,
          accountNumber: data.accountNumber,
          accountHolderName: data.accountHolderName,
          routingNumber: data.routingNumber,
        },
        authorizedSignatory: {
          name: data.authorizedSignatoryName,
          title: data.authorizedSignatoryTitle,
          email: data.authorizedSignatoryEmail,
          phone: data.authorizedSignatoryPhone,
        },
        dealerAgreementSigned: data.dealerAgreementSigned,
        hasHrmAccess: data.hasHrmAccess,
        onboardingDate: data.onboardingDate,
      };

      const result = await updateDealer(params.id as string, updateData);

      if (result.status) {
        toast.success("Dealer updated successfully!");
        router.push(`/super-admin/dealers/view/${params.id}`);
      } else {
        toast.error(result.message || "Failed to update dealer");
      }
    } catch (error) {
      console.error("Error updating dealer:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading dealer data...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Dealer</h1>
          <p className="text-muted-foreground mt-2">
            Update dealer information and settings
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="businessNameLegal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Legal Business Name *</FormLabel>
                      <FormControl>
                        <Input maxLength={100} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="businessNameTrading"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trading Name</FormLabel>
                      <FormControl>
                        <Input maxLength={100} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="businessAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Address *</FormLabel>
                    <FormControl>
                      <Textarea maxLength={255} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dealerLicenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dealer License Number *</FormLabel>
                      <FormControl>
                        <Input maxLength={50} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="businessRegistrationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Registration Number *</FormLabel>
                      <FormControl>
                        <Input maxLength={50} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="contactPersonName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person Name *</FormLabel>
                    <FormControl>
                      <Input maxLength={100} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input type="email" maxLength={100} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input maxLength={13} placeholder="e.g. 07123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bank Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number/IBAN *</FormLabel>
                      <FormControl>
                        <Input maxLength={50} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accountHolderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Holder Name *</FormLabel>
                      <FormControl>
                        <Input maxLength={100} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="routingNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Routing Number (Optional)</FormLabel>
                    <FormControl>
                      <Input maxLength={50} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Authorized Signatory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="authorizedSignatoryName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input maxLength={100} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="authorizedSignatoryTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input maxLength={100} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="authorizedSignatoryEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input type="email" maxLength={100} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="authorizedSignatoryPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input maxLength={13} placeholder="e.g. 07123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agreement & Onboarding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="onboardingDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Onboarding Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dealerAgreementSigned"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Dealer Agreement Signed</FormLabel>
                      <FormDescription>
                        Confirm if the dealer agreement has been signed
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hasHrmAccess"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Give HRM Access</FormLabel>
                      <FormDescription>
                        Enable this to allow the dealer to access the HR Management module
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving Changes..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
