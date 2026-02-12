"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Car,
  User,
  Shield,
  CreditCard,
  Check,
  Mail,
  Key,
  ExternalLink,
  Star,
  Pencil,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import {
  getDirectPurchasePackagesAction,
  createDirectPurchaseAction,
  type DirectPurchasePackage,
} from "@/lib/actions/direct-purchase";

const STEPS = ["Vehicle Details", "Customer Info", "Select Plan", "Checkout"];

type DvlaVehicleEnquiryResponse = {
  registrationNumber?: string;
  taxStatus?: string;
  taxDueDate?: string;
  motStatus?: string;
  make?: string;
  yearOfManufacture?: number;
  engineCapacity?: number;
  co2Emissions?: number;
  fuelType?: string;
  markedForExport?: boolean;
  colour?: string;
  typeApproval?: string;
  dateOfLastV5CIssued?: string;
  motExpiryDate?: string;
  wheelplan?: string;
  monthOfFirstRegistration?: string;
};

// Vehicle schema - model removed (DVLA doesn't return it, user won't enter it)
const vehicleSchema = z.object({
  registrationNumber: z.string().min(1, "Registration number is required"),
  vin: z.string().min(1, "VIN is required"),
  make: z.string().min(1, "Make is required"),
  year: z.coerce
    .number()
    .min(1900, "Year must be 1900 or later")
    .max(2030, "Invalid year (max 2030)"),
  mileage: z.coerce.number().min(0, "Mileage must be positive"),
  transmission: z.enum(["manual", "automatic"]).optional(),
});

// Customer schema
const customerSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  address: z.string().min(5, "Address is required"),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;
type CustomerFormValues = z.infer<typeof customerSchema>;

// Step Indicator Component - Light Mode with clickable completed steps
function StepIndicator({
  steps,
  currentStep,
  onStepClick,
}: {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}) {
  return (
    <div className="w-full mb-10 px-4">
      <div className="flex items-center w-full">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const stepNumber = index + 1;
          const isClickable = isCompleted && onStepClick;
          const isLast = index === steps.length - 1;

          return (
            <div
              key={step}
              className={cn(
                "flex items-center",
                isLast ? "flex-none" : "flex-1"
              )}
            >
              <div className="relative flex flex-col items-center group">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 z-10 relative",
                    isCompleted &&
                      "bg-gradient-to-r from-[#00C853] to-[#00B4D8] text-white",
                    isCurrent &&
                      "bg-gradient-to-r from-[#00C853] to-[#00B4D8] text-white ring-4 ring-[#00C853]/20",
                    !isCompleted && !isCurrent && "bg-gray-200 text-gray-500",
                    isClickable &&
                      "cursor-pointer hover:scale-110 hover:shadow-lg"
                  )}
                  onClick={() => isClickable && onStepClick(index)}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : stepNumber}
                </div>
                <span
                  className={cn(
                    "absolute top-12 whitespace-nowrap text-xs font-medium transition-colors",
                    isCompleted || isCurrent
                      ? "text-gray-900"
                      : "text-gray-500",
                    isClickable && "group-hover:text-[#00C853]"
                  )}
                >
                  {step}
                </span>
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-4 rounded-full transition-all duration-300",
                    isCompleted
                      ? "bg-gradient-to-r from-[#00C853] to-[#00B4D8]"
                      : "bg-gray-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Plan Card Component - Light Mode
function PlanCard({
  pkg,
  isSelected,
  selectedDuration,
  onSelect,
  onDurationChange,
  isFeatured = false,
}: {
  pkg: DirectPurchasePackage;
  isSelected: boolean;
  selectedDuration: 12 | 24 | 36;
  onSelect: () => void;
  onDurationChange: (duration: 12 | 24 | 36) => void;
  isFeatured?: boolean;
}) {
  const [showAllBenefits, setShowAllBenefits] = useState(false);

  const getPrice = () => {
    switch (selectedDuration) {
      case 12:
        return Number(pkg.price12Months) || 0;
      case 24:
        return Number(pkg.price24Months) || 0;
      case 36:
        return Number(pkg.price36Months) || 0;
      default:
        return 0;
    }
  };

  const price = getPrice();
  // Filter benefits slightly more loosely to catch 'benefit' and 'feature'
  const allBenefits =
    pkg.items?.filter(
      (item) =>
        item.type.toLowerCase() === "benefit" ||
        item.type.toLowerCase() === "feature"
    ) || [];
  const visibleBenefits = showAllBenefits
    ? allBenefits
    : allBenefits.slice(0, 6);

  return (
    <div
      className={cn(
        "relative rounded-2xl p-6 transition-all duration-300 cursor-pointer",
        isFeatured
          ? "bg-gradient-to-br from-[#00C853] to-[#00B4D8] text-white shadow-xl scale-105"
          : "bg-white border-2 border-gray-200 hover:border-[#00C853]/50 shadow-md",
        isSelected && !isFeatured && "ring-2 ring-[#00C853] border-[#00C853]",
        isSelected && isFeatured && "ring-4 ring-white/50"
      )}
      onClick={onSelect}
    >
      {isFeatured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0D1B2A] text-white px-4 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
          <Star className="h-3 w-3 fill-current" />
          RECOMMENDED
        </div>
      )}

      <div className="text-center mb-6">
        <h3
          className={cn(
            "text-xl font-bold mb-2",
            isFeatured ? "text-white" : "text-gray-900"
          )}
        >
          {pkg.name}
        </h3>
        {pkg.description && (
          <p
            className={cn(
              "text-sm",
              isFeatured ? "text-white/80" : "text-gray-500"
            )}
          >
            {pkg.description}
          </p>
        )}
      </div>

      <div className="text-center mb-6">
        <div
          className={cn(
            "text-4xl font-bold",
            isFeatured ? "text-white" : "text-gray-900"
          )}
        >
          £{price.toLocaleString()}
        </div>
        <div
          className={cn(
            "text-sm",
            isFeatured ? "text-white/70" : "text-gray-500"
          )}
        >
          for {selectedDuration} months
        </div>
      </div>

      <div className="mb-6" onClick={(e) => e.stopPropagation()}>
        <Select
          value={selectedDuration.toString()}
          onValueChange={(val) => onDurationChange(Number(val) as 12 | 24 | 36)}
        >
          <SelectTrigger
            className={cn(
              "w-full",
              isFeatured ? "bg-white/20 border-white/30 text-white" : ""
            )}
          >
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12">12 Months</SelectItem>
            <SelectItem value="24">24 Months</SelectItem>
            <SelectItem value="36">36 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3 mb-6">
        {visibleBenefits.length > 0 ? (
          visibleBenefits.map((item) => (
            <div key={item.id} className="flex items-start gap-2">
              <div
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                  isFeatured ? "bg-white/20" : "bg-[#00C853]/10"
                )}
              >
                <Check
                  className={cn(
                    "h-3 w-3",
                    isFeatured ? "text-white" : "text-[#00C853]"
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-sm",
                  isFeatured ? "text-white/90" : "text-gray-700"
                )}
              >
                {item.warrantyItem?.label || "Benefit"}
              </span>
            </div>
          ))
        ) : (
          <div
            className={cn(
              "text-sm italic",
              isFeatured ? "text-white/70" : "text-gray-500"
            )}
          >
            Includes comprehensive coverage.
          </div>
        )}

        {allBenefits.length > 6 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowAllBenefits(!showAllBenefits);
            }}
            className={cn(
              "text-sm font-medium hover:underline flex items-center gap-1 mt-4 transition-colors focus:outline-none",
              isFeatured
                ? "text-white/90 hover:text-white"
                : "text-[#00C853] hover:text-[#00C853]/80"
            )}
          >
            {showAllBenefits ? (
              <>
                Show Less <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                View all {allBenefits.length} benefits{" "}
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        )}
      </div>

      <Button
        className={cn(
          "w-full font-semibold",
          isFeatured
            ? "bg-white text-[#00C853] hover:bg-white/90"
            : isSelected
            ? "bg-[#00C853] text-white hover:bg-[#00C853]/90"
            : "bg-gray-100 text-gray-700 hover:bg-[#00C853]/10"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        {isSelected ? "Selected ✓" : "Select Plan"}
      </Button>
    </div>
  );
}

// Success Modal Component - Light Mode
function SuccessModal({
  isOpen,
  customerEmail,
  temporaryPassword,
  policyNumber,
}: {
  isOpen: boolean;
  customerEmail: string;
  temporaryPassword: string;
  policyNumber: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="bg-gradient-to-r from-[#00C853] to-[#00B4D8] p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Purchase Successful!</h2>
          <p className="text-white/80">Your warranty is now active</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Warranty Number</p>
            <p className="text-xl font-bold font-mono text-gray-900">
              {policyNumber}
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-start gap-2 text-sm text-amber-600 bg-amber-50 p-4 rounded-lg">
              <Mail className="h-5 w-5 mt-0.5 shrink-0" />
              <p>
                Your portal credentials and warranty details have been sent to{" "}
                <strong>{customerEmail}</strong>. Please check your email inbox
                (and spam folder) to log in.
              </p>
            </div>
          </div>

          <Button
            className="w-full bg-gradient-to-r from-[#00C853] to-[#00B4D8]"
            onClick={() =>
              (window.location.href = "http://customer.localhost:3003")
            }
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Go to Customer Portal
          </Button>
        </div>
      </div>
    </div>
  );
}

export function DirectPurchaseForm({
  preSelectedPackageId,
}: {
  preSelectedPackageId?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState(0);
  const [dvlaLoading, setDvlaLoading] = useState(false);
  const [dvlaData, setDvlaData] = useState<DvlaVehicleEnquiryResponse | null>(
    null
  );

  const [vehicleData, setVehicleData] = useState<VehicleFormValues>({
    registrationNumber: "",
    vin: "",
    make: "",
    year: 2024, // Use a static year for initial hydration, will be updated in useEffect if needed or by user
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

  const [packages, setPackages] = useState<DirectPurchasePackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null
  );
  const [selectedDuration, setSelectedDuration] = useState<12 | 24 | 36>(12);
  const [durations, setDurations] = useState<Record<string, 12 | 24 | 36>>({});
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState({
    customerEmail: "",
    temporaryPassword: "",
    policyNumber: "",
  });

  const vehicleForm = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema) as any,
    defaultValues: vehicleData,
  });

  const customerForm = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: customerData,
  });

  const fetchEligiblePackages = useCallback(
    async (vData: VehicleFormValues) => {
      setLoading(true);
      try {
        const res = await getDirectPurchasePackagesAction({
          make: vData.make,
          model: "Unknown", // Model not available from DVLA, using placeholder for eligibility check
          year: Number(vData.year),
          mileage: Number(vData.mileage),
          transmission: vData.transmission,
        });

        if (res.status && res.data) {
          setPackages(res.data);
          const initialDurations: Record<string, 12 | 24 | 36> = {};
          res.data.forEach((pkg) => {
            initialDurations[pkg.id] = 12;
          });
          setDurations(initialDurations);

          // Handle preSaved/Selected Logic
          if (preSelectedPackageId) {
            const isEligible = res.data.find(
              (p) => p.id === preSelectedPackageId
            );
            if (isEligible) {
              setSelectedPackageId(preSelectedPackageId);
              // Optional: Toast to confirm selection
              toast.success("Your selected warranty package is available!");
            } else {
              toast.error(
                "The warranty package you selected is not eligible for this vehicle."
              );
              // We do NOT select it, allowing them to choose others
            }
          }

          // Deselect if current package is no longer in list (and not handled by preSelect)
          if (
            !preSelectedPackageId &&
            selectedPackageId &&
            !res.data.find((p) => p.id === selectedPackageId)
          ) {
            setSelectedPackageId(null);
          }
        } else {
          toast.error(res.message || "Failed to load packages");
          setPackages([]);
        }
      } catch (err) {
        toast.error("Error loading eligible packages");
      } finally {
        setLoading(false);
      }
    },
    [selectedPackageId, preSelectedPackageId]
  );

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
      // Require DVLA lookup before proceeding
      if (!dvlaData) {
        toast.error("Please fetch vehicle details first (Registration + VIN).");
        return;
      }
      const valid = await vehicleForm.trigger();
      if (!valid) return;
      const values = vehicleForm.getValues();
      const confirmedValues: VehicleFormValues = {
        ...values,
        registrationNumber: values.registrationNumber?.toUpperCase(),
        vin: values.vin?.toUpperCase(),
        year: Number(values.year),
        mileage: Number(values.mileage),
      };
      setVehicleData(confirmedValues);
      // Fetch packages right after vehicle details are entered
      await fetchEligiblePackages(confirmedValues);
    } else if (currentStep === 1) {
      const valid = await customerForm.trigger();
      if (!valid) return;
      const values = customerForm.getValues();
      setCustomerData(values);
    } else if (currentStep === 2) {
      if (!selectedPackageId) {
        toast.error("Please select a warranty plan");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleDvlaLookup = async () => {
    const registrationNumber = vehicleForm
      .getValues("registrationNumber")
      ?.trim();
    const vin = vehicleForm.getValues("vin")?.trim();

    if (!registrationNumber || !vin) {
      toast.error("Registration number and VIN are required");
      return;
    }

    setDvlaLoading(true);
    try {
      const res = await fetch("/internal-api/vehicle-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationNumber: registrationNumber.toUpperCase(),
        }),
      });

      const json = (await res.json().catch(() => ({}))) as
        | { status: true; data: DvlaVehicleEnquiryResponse }
        | { status: false; message?: string };

      if (!res.ok || !("status" in json) || (json as any).status !== true) {
        toast.error(
          (json as any)?.message || "Failed to fetch vehicle details"
        );
        setDvlaData(null);
        return;
      }

      const data = (json as any).data as DvlaVehicleEnquiryResponse;
      setDvlaData(data);

      // Auto-fill make/year from DVLA (model is not returned by DVLA)
      if (data.make)
        vehicleForm.setValue("make", data.make, { shouldValidate: true });
      if (typeof data.yearOfManufacture === "number") {
        vehicleForm.setValue("year", data.yearOfManufacture as any, {
          shouldValidate: true,
        });
      }

      toast.success("Vehicle details fetched");
    } catch {
      toast.error("Failed to fetch vehicle details");
      setDvlaData(null);
    } finally {
      setDvlaLoading(false);
    }
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
      const dvlaSnapshot = dvlaData
        ? {
            dvlaTaxStatus: dvlaData.taxStatus,
            dvlaTaxDueDate: dvlaData.taxDueDate,
            dvlaMotStatus: dvlaData.motStatus,
            dvlaMotExpiryDate: dvlaData.motExpiryDate,
            dvlaYearOfManufacture: dvlaData.yearOfManufacture,
            dvlaEngineCapacity: dvlaData.engineCapacity,
            dvlaCo2Emissions: dvlaData.co2Emissions,
            dvlaFuelType: dvlaData.fuelType,
            dvlaMarkedForExport: dvlaData.markedForExport,
            dvlaColour: dvlaData.colour,
            dvlaTypeApproval: dvlaData.typeApproval,
            dvlaDateOfLastV5CIssued: dvlaData.dateOfLastV5CIssued,
            dvlaWheelplan: dvlaData.wheelplan,
            dvlaMonthOfFirstRegistration: dvlaData.monthOfFirstRegistration,
          }
        : {};
      const res = await createDirectPurchaseAction({
        vehicle: {
          make: vehicleData.make,
          model: "Unknown", // Model not available from DVLA, backend will handle this
          year: Number(vehicleData.year),
          vin: vehicleData.vin || undefined,
          registrationNumber: vehicleData.registrationNumber || undefined,
          mileage: Number(vehicleData.mileage),
          transmission: vehicleData.transmission,
          ...(dvlaSnapshot as any),
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

  return (
    <>
      <Card className="max-w-6xl mx-auto bg-white shadow-xl border-t-4 border-t-[#00C853]">
        <CardContent className="pt-8 px-8 pb-8">
          <StepIndicator
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={(step) => setCurrentStep(step)}
          />

          {/* Step 1: Vehicle */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-6">
                <Car className="h-6 w-6 text-[#00C853]" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Vehicle Information
                </h2>
              </div>
              <Form {...vehicleForm}>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      name="vin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>VIN *</FormLabel>
                          <FormControl>
                            <Input
                            
                              placeholder="Vehicle Identification Number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    .toUpperCase()
                                    .replace(/[^A-Z0-9]/g, "")
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="registrationNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registration Number *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="ABCD123"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    .toUpperCase()
                                    .replace(/\s+/g, "")
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={handleDvlaLookup}
                      disabled={dvlaLoading}
                      className="bg-gradient-to-r from-[#00C853] to-[#00B4D8]"
                    >
                      {dvlaLoading ? "Fetching..." : "Fetch Vehicle Details"}
                    </Button>
                  </div>

                  {dvlaData && (
                    <div className="rounded-xl border bg-gray-50 p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Make (DVLA)</Label>
                          <Input
                            value={dvlaData.make || "-"}
                            readOnly
                            disabled
                            className="bg-muted/50 cursor-not-allowed"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Year (DVLA)</Label>
                          <Input
                            value={dvlaData.yearOfManufacture ?? "-"}
                            readOnly
                            disabled
                            className="bg-gray-100 cursor-not-allowed"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Fuel Type</Label>
                          <Input
                            value={dvlaData.fuelType || "-"}
                            readOnly
                            disabled
                            className="bg-gray-100 cursor-not-allowed"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Colour</Label>
                          <Input
                            value={dvlaData.colour || "-"}
                            readOnly
                            disabled
                            className="bg-gray-100 cursor-not-allowed"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>MOT Status</Label>
                          <Input
                            value={dvlaData.motStatus || "-"}
                            readOnly
                            disabled
                            className="bg-gray-100 cursor-not-allowed"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tax Status</Label>
                          <Input
                            value={dvlaData.taxStatus || "-"}
                            readOnly
                            disabled
                            className="bg-gray-100 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          name="make"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Make *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Make"
                                  {...field}
                                  readOnly
                                  disabled
                                  className="bg-muted/50 cursor-not-allowed"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          name="year"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Year *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  value={field.value}
                                  readOnly
                                  disabled
                                  className="bg-muted/50 cursor-not-allowed"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          name="mileage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mileage (km) *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="50000"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
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
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="manual">Manual</SelectItem>
                                  <SelectItem value="automatic">
                                    Automatic
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                </form>
              </Form>
            </div>
          )}

          {/* Step 2: Customer */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-6">
                <User className="h-6 w-6 text-[#00C853]" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Your Information
                </h2>
              </div>
              <Form {...customerForm}>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      name="firstName"
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
                      name="lastName"
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
                  <FormField
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Email * (Portal credentials will be sent here)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="1234567890"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value.replace(/[^0-9]/g, "")
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address *</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Full address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="State" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zip</FormLabel>
                          <FormControl>
                            <Input placeholder="12345" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </div>
          )}

          {/* Step 3: Plans */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="h-6 w-6 text-[#00C853]" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Choose Your Plan
                </h2>
              </div>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C853] mx-auto mb-4" />
                  <p className="text-gray-500">
                    Checking eligibility and loading plans...
                  </p>
                </div>
              ) : packages.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    No Eligible Plans Found
                  </h3>
                  <p className="text-gray-500 max-w-sm mx-auto mt-2">
                    Based on your vehicle details, we couldn't find any
                    compatible warranty plans. Please check the vehicle
                    information or contact support.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() => setCurrentStep(0)}
                  >
                    Edit Vehicle Details
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      onDurationChange={(d) => {
                        setDurations((p) => ({ ...p, [pkg.id]: d }));
                        if (selectedPackageId === pkg.id)
                          setSelectedDuration(d);
                      }}
                      isFeatured={
                        index === 1 || (packages.length === 1 && index === 0)
                      }
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
                <h2 className="text-xl font-semibold text-gray-900">
                  Confirm & Purchase
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border relative group">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[#00C853] hover:text-[#00C853] hover:bg-[#00C853]/10"
                    onClick={() => setCurrentStep(0)}
                  >
                    <Pencil className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                    <Car className="h-4 w-4 text-[#00C853]" /> Vehicle
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      {vehicleData.year} {vehicleData.make}
                    </p>
                    <p>Mileage: {vehicleData.mileage.toLocaleString()} km</p>
                    {vehicleData.vin && <p>VIN: {vehicleData.vin}</p>}
                    {vehicleData.registrationNumber && (
                      <p>Reg: {vehicleData.registrationNumber}</p>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border relative group">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[#00C853] hover:text-[#00C853] hover:bg-[#00C853]/10"
                    onClick={() => setCurrentStep(1)}
                  >
                    <Pencil className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                    <User className="h-4 w-4 text-[#00C853]" /> Customer
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      {customerData.firstName} {customerData.lastName}
                    </p>
                    <p>{customerData.email}</p>
                    <p>{customerData.phone}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#00C853]/10 to-[#00B4D8]/10 rounded-xl p-6 border border-[#00C853]/30 relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[#00C853] hover:text-[#00C853] hover:bg-[#00C853]/10"
                  onClick={() => setCurrentStep(2)}
                >
                  <Pencil className="h-4 w-4 mr-1" /> Change Plan
                </Button>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {selectedPackage?.name}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {selectedDuration} months coverage
                    </p>
                  </div>
                  <div className="text-right mt-5">
                    <p className="text-3xl font-bold bg-gradient-to-r from-[#00C853] to-[#00B4D8] bg-clip-text text-transparent">
                      £{getPrice().toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#00C853]/20">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-[#00C853]/10 flex items-center justify-center">
                      <Shield className="h-3 w-3 text-[#00C853]" />
                    </div>
                    <span className="font-medium">Warranty Start Date:</span>
                    <span>
                      {new Date().toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {selectedPackage?.items &&
                    selectedPackage.items.length > 0 && (
                      <div className="pt-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          Features & Benefits
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {selectedPackage?.items &&
                            selectedPackage.items
                              .filter(
                                (item) =>
                                  item.type.toLowerCase() === "benefit" ||
                                  item.type.toLowerCase() === "feature"
                              )
                              .slice(0, 6) // Limit to top 6 to avoid clutter
                              .map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-start gap-2 text-sm text-gray-700"
                                >
                                  <Check className="h-4 w-4 text-[#00C853] mt-0.5 shrink-0" />
                                  <span className="text-xs">
                                    {item.warrantyItem.label}
                                  </span>
                                </div>
                              ))}
                        </div>
                        {selectedPackage.items.filter(
                          (item) =>
                            item.type.toLowerCase() === "benefit" ||
                            item.type.toLowerCase() === "feature"
                        ).length > 6 && (
                          <p className="text-xs text-gray-500 mt-2 italic">
                            + {selectedPackage.items.length - 6} more benefits
                            included
                          </p>
                        )}
                      </div>
                    )}
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(c) => setTermsAccepted(!!c)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  I agree to the{" "}
                  <a href="#" className="text-[#00C853] hover:underline">
                    Terms
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-[#00C853] hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <Button
                size="lg"
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-[#00C853] to-[#00B4D8]"
                disabled={!termsAccepted || isPending}
                onClick={handleSubmit}
              >
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />{" "}
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" /> Complete Purchase -
                    £{getPrice().toLocaleString()}
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Navigation */}
          {currentStep < 3 && (
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-[#00C853] to-[#00B4D8]"
              >
                {currentStep === 2 ? "Proceed to Checkout" : "Continue"}{" "}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <SuccessModal
        isOpen={showSuccess}
        customerEmail={successData.customerEmail}
        temporaryPassword={successData.temporaryPassword}
        policyNumber={successData.policyNumber}
      />
    </>
  );
}
