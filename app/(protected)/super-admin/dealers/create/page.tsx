"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { CalendarIcon, FileText } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { createDealer } from "@/lib/actions/dealer";
import { toast } from "sonner";

const dealerSchema = z.object({
  // Business Information
  legalName: z.string().min(1, "Legal business name is required").max(100, "Name too long"),
  tradingName: z.string().max(100, "Name too long").optional(),
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
  accountHolderName: z.string().min(1, "Account holder name is required").max(100, "Account holder name too long"),
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
  hasSignedAgreement: z.boolean().refine((val) => val === true, {
    message: "You must confirm that the dealer agreement has been signed",
  }),
  onboardingDate: z
  .date()
  .refine((val) => val instanceof Date, { message: "Onboarding date is required" }),


  // Login Credentials (set by Super Admin)
  password: z.string().min(8, "Password must be at least 8 characters").max(100, "Password too long"),
  hasHrmAccess: z.boolean(),
});

type DealerFormValues = z.infer<typeof dealerSchema>;

export default function CreateDealerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<DealerFormValues>({
    resolver: zodResolver(dealerSchema),
    defaultValues: {
      legalName: "",
      tradingName: "",
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
      hasSignedAgreement: false,
      onboardingDate: new Date(),
      password: "",
      hasHrmAccess: false,
    },
  });

  const onSubmit = async (data: DealerFormValues) => {
    setLoading(true);
    try {
      // Prepare data for API
      const dealerData = {
        legalName: data.legalName,
        tradingName: data.tradingName || undefined,
        businessAddress: data.businessAddress,
        contactPersonName: data.contactPersonName,
        phone: data.phone,
        email: data.email,
        dealerLicenseNumber: data.dealerLicenseNumber || undefined,
        businessRegistrationNumber:
          data.businessRegistrationNumber || undefined,
        bankDetails: {
          bankName: data.bankName,
          accountNumber: data.accountNumber,
          accountHolderName: data.accountHolderName,
          routingNumber: data.routingNumber || undefined,
        },
        authorizedSignatory: {
          name: data.authorizedSignatoryName,
          title: data.authorizedSignatoryTitle,
          email: data.authorizedSignatoryEmail || undefined,
          phone: data.authorizedSignatoryPhone || undefined,
        },
        dealerAgreementSigned: data.hasSignedAgreement,
        onboardingDate: data.onboardingDate,
        password: data.password, // Password set by Super Admin
        hasHrmAccess: data.hasHrmAccess,
      };

      const result = await createDealer(dealerData);

      if (result.status && result.data) {
        toast.success("Dealer created successfully!");
        // toast.info(
        //   `Credentials generated. Username: ${result.data.dealer.email} (email). Excel file: ${result.data.credentials.excelFile.filename}`
        // );
        router.push(
          `/super-admin/dealers/list?newDealerId=${result.data.dealer.id}`
        );
      } else {
        toast.error(result.message || "Failed to create dealer");
        form.setError("root", {
          message: result.message || "Failed to create dealer",
        });
      }
    } catch (error) {
      console.error("Error creating dealer:", error);
      toast.error("An unexpected error occurred");
      form.setError("root", {
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Dealer</h1>
        <p className="text-muted-foreground mt-2">
          Register a new showroom partner with Drive Safe Warranty
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Legal and trading details of the dealership
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="legalName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Legal Business Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter legal business name"
                        maxLength={100}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tradingName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trading Name (if different)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter trading name" maxLength={100} {...field} />
                    </FormControl>
                    <FormDescription>
                      Leave blank if same as legal name
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Address *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter full business address"
                        maxLength={255}
                        {...field}
                      />
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
                        <Input
                          placeholder="Enter dealer license number"
                          maxLength={50}
                          {...field}
                        />
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
                        <Input
                          placeholder="Enter registration number"
                          maxLength={50}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Primary contact details for the dealership
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="contactPersonName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter contact person name"
                        maxLength={100}
                        {...field}
                      />
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
                        <Input
                          type="email"
                          placeholder="dealer@example.com"
                          maxLength={100}
                          {...field}
                        />
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
                        <Input
                          placeholder="e.g. 07123456789"
                          maxLength={13}
                          value={field.value || ''}
                          onChange={(e) => {
                            const numericValue = e.target.value.replace(/[^0-9+]/g, '');
                            field.onChange(numericValue);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card>
            <CardHeader>
              <CardTitle>Bank Details</CardTitle>
              <CardDescription>
                Bank account information for commissions and settlements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter bank name" maxLength={100} {...field} />
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
                        <Input placeholder="Enter account number/IBAN" maxLength={50} {...field} />
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
                        <Input
                          placeholder="Enter account holder name"
                          maxLength={100}
                          {...field}
                        />
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
                      <Input
                        placeholder="Enter routing number if applicable"
                        maxLength={50}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Authorized Signatory */}
          <Card>
            <CardHeader>
              <CardTitle>Authorized Signatory Details</CardTitle>
              <CardDescription>
                Details of the person authorized to sign agreements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="authorizedSignatoryName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Signatory Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter authorized signatory name"
                          maxLength={100}
                          {...field}
                        />
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
                      <FormLabel>Signatory Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Manager, Owner" maxLength={100} {...field} />
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
                      <FormLabel>Signatory Email (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="signatory@example.com"
                          maxLength={100}
                          {...field}
                        />
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
      <FormLabel>Signatory Phone (Optional)</FormLabel>
      <FormControl>
        <Input
          placeholder="e.g. 07123456789"
          maxLength={13}
          value={field.value || ''}
          onChange={(e) => {
            const numericValue = e.target.value.replace(/[^0-9+]/g, '');
            field.onChange(numericValue);
          }}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

              </div>
            </CardContent>
          </Card>

          {/* Agreement & Onboarding */}
          <Card>
            <CardHeader>
              <CardTitle>Agreement & Onboarding</CardTitle>
              <CardDescription>
                Dealer agreement and onboarding information
              </CardDescription>
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
                name="hasSignedAgreement"
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
                        I confirm that the dealer agreement has been signed and
                        is on file
                      </FormDescription>
                      <FormMessage />
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

          {/* Login Credentials */}
          <Card>
            <CardHeader>
              <CardTitle>Login Credentials</CardTitle>
              <CardDescription>
                Set initial login credentials for the dealer. The dealer will be
                required to change the password on first login.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md bg-muted p-4 space-y-2">
                <p className="text-sm font-medium">Username:</p>
                <p className="text-sm text-muted-foreground">
                  The dealer's email address (
                  {form.watch("email") || "will be used as username"})
                </p>
              </div>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Password *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter initial password (min 8 characters)"
                          maxLength={100}
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      The dealer will be required to change this password on
                      their first login for security.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

         

          {form.formState.errors.root && (
            <div className="text-sm text-destructive">
              {form.formState.errors.root.message}
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Dealer"}
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
