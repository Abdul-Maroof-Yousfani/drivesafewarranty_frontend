"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Car, User, Shield, CreditCard } from "lucide-react";

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

import { StepIndicator } from "./components/StepIndicator";
import { PlanCard } from "./components/PlanCard";
import { CheckoutSummary, SuccessModal } from "./components/CheckoutSummary";
import {
  getDirectPurchasePackagesAction,
  createDirectPurchaseAction,
  type DirectPurchasePackage,
} from "@/lib/actions/direct-purchase";

const STEPS = ["Vehicle Details", "Customer Info", "Select Plan", "Checkout"];

// Vehicle schema
const vehicleSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce
    .number()
    .min(1900, "Year must be 1900 or later")
    .max(new Date().getFullYear() + 1, "Invalid year"),
  vin: z.string().max(17, "VIN cannot exceed 17 characters").optional().refine((val) => !val || val.length === 17, {
    message: "VIN must be exactly 17 characters",
  }),
  registrationNumber: z.string().max(8, "Registration Number too long").optional().refine((val) => !val || /^[A-Z0-9\s]{5,8}$/i.test(val), {
    message: "Invalid registration number format",
  }),
  mileage: z.coerce.number().min(0, "Mileage must be positive"),
  transmission: z.enum(["manual", "automatic"]).optional(),
});

// Customer schema
const customerSchema = z.object({
  firstName: z.string().min(2, "First name is required").max(60, "First name too long"),
  lastName: z.string().min(2, "Last name is required").max(60, "Last name too long"),
  email: z.string().email("Valid email is required").max(100, "Email too long"),
  phone: z.string().min(1, "Phone is required").regex(/^(?:\+?\d{1,3})?[\d\s\-]{7,15}$/, "Invalid phone number (e.g., 07123456789 or +447123456789)").max(13, "Phone number too long"),
  address: z.string().min(1, "Address is required").max(200, "Address too long"),
  city: z.string().max(100, "City too long").optional(),
  state: z.string().max(100, "State too long").optional(),
  zipCode: z.string().max(10, "Zip code too long").optional(),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;
type CustomerFormValues = z.infer<typeof customerSchema>;

export function DirectPurchaseForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState(0);

  // Form data
  const [vehicleData, setVehicleData] = useState<VehicleFormValues>({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    vin: "",
    registrationNumber: "",
    mileage: 0,
    transmission: undefined,
  });

  const [customerData, setCustomerData] = useState<CustomerFormValues>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  // Packages and selection
  const [packages, setPackages] = useState<DirectPurchasePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<12 | 24 | 36>(12);
  const [durations, setDurations] = useState<Record<string, 12 | 24 | 36>>({});

  // Checkout
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Success modal
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState({
    customerEmail: "",
    temporaryPassword: "",
    policyNumber: "",
  });

  // Vehicle form
  const vehicleForm = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: vehicleData,
  });

  // Customer form
  const customerForm = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: customerData,
  });

  // Load packages
  const fetchPackages = async (vehicle: VehicleFormValues) => {
    setLoading(true);
    try {
      const res = await getDirectPurchasePackagesAction({
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        mileage: vehicle.mileage,
        transmission: vehicle.transmission,
      });
      
      if (res.status && res.data) {
        setPackages(res.data);
        // Initialize durations for each package
        const initialDurations: Record<string, 12 | 24 | 36> = {};
        res.data.forEach((pkg) => {
          initialDurations[pkg.id] = 12;
        });
        setDurations(initialDurations);
      } else {
        toast.error(res.message || "Failed to load packages");
      }
    } catch (error) {
      toast.error("Failed to load packages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // We only fetch when the user specifies vehicle details
    // but we can initialize loading to false
    setLoading(false);
  }, []);

  const selectedPackage = packages.find((p) => p.id === selectedPackageId);

  const getPrice = () => {
    if (!selectedPackage) return 0;
    switch (selectedDuration) {
      case 12:
        return Number(selectedPackage.price12Months) || 0;
      case 24:
        return Number(selectedPackage.price24Months) || 0;
      case 36:
        return Number(selectedPackage.price36Months) || 0;
      default:
        return 0;
    }
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      // Validate vehicle form
      const valid = await vehicleForm.trigger();
      if (!valid) return;
      const values = vehicleForm.getValues();
      
      // Only refetch if vehicle data has changed significantly
      const hasChanged = 
        values.make !== vehicleData.make || 
        values.model !== vehicleData.model || 
        values.year !== vehicleData.year ||
        values.mileage !== vehicleData.mileage ||
        values.transmission !== vehicleData.transmission;

      setVehicleData(values);
      if (hasChanged || packages.length === 0) {
        await fetchPackages(values);
      }
    } else if (currentStep === 1) {
      // Validate customer form
      const valid = await customerForm.trigger();
      if (!valid) return;
      setCustomerData(customerForm.getValues());
    } else if (currentStep === 2) {
      // Must have package selected
      if (!selectedPackageId) {
        toast.error("Please select a warranty plan");
        return;
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = () => {
    if (!termsAccepted) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    if (!selectedPackageId) {
      toast.error("Please select a warranty plan");
      return;
    }

    startTransition(async () => {
      const res = await createDirectPurchaseAction({
        vehicle: {
          make: vehicleData.make,
          model: vehicleData.model,
          year: vehicleData.year,
          vin: vehicleData.vin || undefined,
          registrationNumber: vehicleData.registrationNumber || undefined,
          mileage: vehicleData.mileage,
          transmission: vehicleData.transmission,
        },
        customer: {
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          email: customerData.email,
          phone: customerData.phone,
          address: customerData.address,
          city: customerData.city || undefined,
          state: customerData.state || undefined,
          zipCode: customerData.zipCode || undefined,
        },
        warrantyPackageId: selectedPackageId,
        duration: selectedDuration,
        termsAccepted: true,
      });

      if (res.status && res.data) {
        setSuccessData({
          customerEmail: res.data.customerEmail,
          temporaryPassword: res.data.temporaryPassword,
          policyNumber: res.data.policyNumber,
        });
        setShowSuccess(true);
        toast.success("Warranty purchase completed successfully!");
      } else {
        toast.error(res.message || "Failed to complete purchase");
      }
    });
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    router.push("/super-admin/customers/list");
  };

  return (
    <>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <StepIndicator steps={STEPS} currentStep={currentStep} />
        </CardHeader>

        <CardContent className="pt-2">
          {/* Step 1: Vehicle Details */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-6">
                <Car className="h-6 w-6 text-[#00C853]" />
                <h2 className="text-xl font-semibold">Vehicle Information</h2>
              </div>

              <Form {...vehicleForm}>
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={vehicleForm.control}
                      name="make"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Make *</FormLabel>
                          <FormControl>
                            <Input placeholder="Toyota" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={vehicleForm.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model *</FormLabel>
                          <FormControl>
                            <Input placeholder="Camry" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={vehicleForm.control}
                      name="year"
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
                      control={vehicleForm.control}
                      name="mileage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mileage (km) *</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="50000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={vehicleForm.control}
                      name="vin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>VIN</FormLabel>
                          <FormControl>
                            <Input placeholder="Vehicle Identification Number" maxLength={17} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={vehicleForm.control}
                      name="registrationNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registration Number</FormLabel>
                          <FormControl>
                            <Input placeholder="ABC-1234" maxLength={8} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={vehicleForm.control}
                    name="transmission"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transmission</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select transmission" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="manual">Manual</SelectItem>
                            <SelectItem value="automatic">Automatic</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>
          )}

          {/* Step 2: Customer Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-6">
                <User className="h-6 w-6 text-[#00C853]" />
                <h2 className="text-xl font-semibold">Customer Information</h2>
              </div>

              <Form {...customerForm}>
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={customerForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John" maxLength={60} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={customerForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" maxLength={60} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={customerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email * (Portal login credentials will be sent here)</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            maxLength={100}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={customerForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. 07123456789"
                            maxLength={13}
                            {...field}
                            onChange={(e) => {
                              const numericValue = e.target.value.replace(
                                /[^0-9+]/g,
                                ""
                              );
                              field.onChange(numericValue);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={customerForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address *</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter full address" maxLength={200} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={customerForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" maxLength={100} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={customerForm.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="State" maxLength={100} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={customerForm.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zip Code</FormLabel>
                          <FormControl>
                            <Input placeholder="12345" maxLength={10} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </div>
          )}

          {/* Step 3: Select Plan */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="h-6 w-6 text-[#00C853]" />
                <h2 className="text-xl font-semibold">Choose Your Warranty Plan</h2>
              </div>

              {loading ? (
                <div className="text-center py-12">Loading packages...</div>
              ) : packages.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No warranty packages available
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {packages.map((pkg, index) => (
                    <PlanCard
                      key={pkg.id}
                      pkg={pkg}
                      isSelected={selectedPackageId === pkg.id}
                      selectedDuration={durations[pkg.id] || 12}
                      onSelect={() => {
                        setSelectedPackageId(pkg.id);
                        setSelectedDuration(durations[pkg.id] || 12);
                      }}
                      onDurationChange={(duration) => {
                        setDurations((prev) => ({ ...prev, [pkg.id]: duration }));
                        if (selectedPackageId === pkg.id) {
                          setSelectedDuration(duration);
                        }
                      }}
                      isFeatured={index === 1} // Middle card is featured
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Checkout */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="h-6 w-6 text-[#00C853]" />
                <h2 className="text-xl font-semibold">Review & Complete Purchase</h2>
              </div>

              <CheckoutSummary
                vehicleData={vehicleData}
                customerData={customerData}
                selectedPackage={selectedPackage || null}
                selectedDuration={selectedDuration}
                totalAmount={getPrice()}
                termsAccepted={termsAccepted}
                onTermsChange={setTermsAccepted}
                onSubmit={handleSubmit}
                isSubmitting={isPending}
              />
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep < 3 && (
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-[#00C853] to-[#00B4D8]"
              >
                {currentStep === 2 ? "Proceed to Checkout" : "Continue"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccess}
        customerEmail={successData.customerEmail}
        temporaryPassword={successData.temporaryPassword}
        policyNumber={successData.policyNumber}
        onClose={handleCloseSuccess}
      />
    </>
  );
}
