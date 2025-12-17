"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const warrantySaleSchema = z.object({
  // Dealer Information (auto-filled from logged-in dealer)
  salesRepresentativeName: z.string().min(1, "Sales representative name is required"),
  
  // Customer Information
  customerFirstName: z.string().min(1, "First name is required"),
  customerLastName: z.string().min(1, "Last name is required"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().min(1, "Phone is required"),
  customerAddress: z.string().min(1, "Address is required"),
  
  // Vehicle Details
  vehicleMake: z.string().min(1, "Vehicle make is required"),
  vehicleModel: z.string().min(1, "Vehicle model is required"),
  vehicleYear: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  vinNumber: z.string().min(1, "VIN number is required"),
  registrationNumber: z.string().min(1, "Registration number is required"),
  mileageAtSale: z.coerce.number().min(0, "Mileage must be positive"),
  
  // Warranty Details
  warrantyPlanType: z.string().min(1, "Warranty plan type is required"),
  coverageStartDate: z.date({
    required_error: "Coverage start date is required",
  }),
  coverageEndDate: z.date({
    required_error: "Coverage end date is required",
  }),
  warrantyPrice: z.coerce.number().min(0, "Price must be positive"),
  
  // Payment
  paymentMethod: z.string().min(1, "Payment method is required"),
  saleDate: z.date({
    required_error: "Sale date is required",
  }),
  
  // Consent
  customerConsent: z.boolean().refine((val) => val === true, {
    message: "Customer consent is required",
  }),
  customerSignature: z.string().optional(), // For digital signature or reference
});

type WarrantySaleFormValues = z.infer<typeof warrantySaleSchema>;

export default function DealerCreateWarrantySalePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<WarrantySaleFormValues>({
    resolver: zodResolver(warrantySaleSchema),
    defaultValues: {
      salesRepresentativeName: "",
      customerFirstName: "",
      customerLastName: "",
      customerEmail: "",
      customerPhone: "",
      customerAddress: "",
      vehicleMake: "",
      vehicleModel: "",
      vehicleYear: new Date().getFullYear(),
      vinNumber: "",
      registrationNumber: "",
      mileageAtSale: 0,
      warrantyPlanType: "",
      coverageStartDate: new Date(),
      coverageEndDate: new Date(),
      warrantyPrice: 0,
      paymentMethod: "",
      saleDate: new Date(),
      customerConsent: false,
      customerSignature: "",
    },
  });

  // Auto-calculate end date based on warranty plan type
  const handleWarrantyPlanChange = (planType: string) => {
    const startDate = form.getValues("coverageStartDate");
    if (startDate && planType) {
      const duration = planType.includes("1") ? 1 : planType.includes("2") ? 2 : planType.includes("3") ? 3 : 1;
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + duration);
      form.setValue("coverageEndDate", endDate);
    }
  };

  const onSubmit = async (data: WarrantySaleFormValues) => {
    setLoading(true);
    try {
      // TODO: Call API to create warranty sale
      console.log("Warranty sale data:", data);
      router.push("/dealer/warranty-sales");
    } catch (error) {
      console.error("Error creating warranty sale:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Warranty Sale</h1>
        <p className="text-muted-foreground mt-2">
          Sell a Drive Safe Warranty to a customer
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Sales Information */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Information</CardTitle>
              <CardDescription>Sales representative details</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="salesRepresentativeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sales Representative Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter sales representative name" {...field} />
                    </FormControl>
                    <FormDescription>
                      Name of the sales representative handling this sale
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>Customer details for the warranty purchase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customerFirstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerLastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone *</FormLabel>
                      <FormControl>
                        <Input placeholder="+1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="customerAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter customer address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Vehicle Details */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Details</CardTitle>
              <CardDescription>Information about the vehicle being covered</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vehicleMake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Make *</FormLabel>
                      <FormControl>
                        <Input placeholder="Toyota" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicleModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Model *</FormLabel>
                      <FormControl>
                        <Input placeholder="Camry" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="vehicleYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year *</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vinNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VIN Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="Vehicle VIN" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="registrationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="Registration #" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="mileageAtSale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mileage at Time of Sale *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Current mileage" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Warranty Details */}
          <Card>
            <CardHeader>
              <CardTitle>Warranty Plan Details</CardTitle>
              <CardDescription>Select warranty plan and coverage period</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="warrantyPlanType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warranty Plan Type *</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleWarrantyPlanChange(value);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select warranty plan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Silver-1">Silver 1 Year</SelectItem>
                        <SelectItem value="Silver-2">Silver 2 Years</SelectItem>
                        <SelectItem value="Silver-3">Silver 3 Years</SelectItem>
                        <SelectItem value="Gold-1">Gold 1 Year</SelectItem>
                        <SelectItem value="Gold-2">Gold 2 Years</SelectItem>
                        <SelectItem value="Gold-3">Gold 3 Years</SelectItem>
                        <SelectItem value="Platinum-1">Platinum 1 Year</SelectItem>
                        <SelectItem value="Platinum-2">Platinum 2 Years</SelectItem>
                        <SelectItem value="Platinum-3">Platinum 3 Years</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="coverageStartDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Coverage Start Date *</FormLabel>
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
                            disabled={(date) => date < new Date()}
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
                  name="coverageEndDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Coverage End Date *</FormLabel>
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
                            disabled={(date) => date < form.getValues("coverageStartDate")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="warrantyPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warranty Price *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormDescription>Price charged to the customer</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Sale & Payment */}
          <Card>
            <CardHeader>
              <CardTitle>Sale & Payment Information</CardTitle>
              <CardDescription>Sale date and payment method</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="saleDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Sale Date *</FormLabel>
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
                          disabled={(date) => date > new Date()}
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
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="debit_card">Debit Card</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Customer Consent */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Consent & Agreement</CardTitle>
              <CardDescription>Customer agreement and signature confirmation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="customerConsent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Customer Consent *</FormLabel>
                      <FormDescription>
                        I confirm that the customer has read and agreed to the warranty terms and conditions
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerSignature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Signature Reference (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Digital signature ID or reference" {...field} />
                    </FormControl>
                    <FormDescription>
                      Reference number for signed agreement document
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Warranty Sale"}
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
