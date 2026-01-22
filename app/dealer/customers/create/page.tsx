"use client";

import { useState } from "react";
import { Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const vehicleSchema = z.object({
  make: z.string().min(1, "Vehicle make is required"),
  year: z.coerce
    .number()
    .min(1900, "Year must be 1900 or later")
    .max(new Date().getFullYear() + 1, "Year is too far in future"),
  vin: z.string().min(1, "VIN is required"),
  registrationNumber: z.string().min(1, "Registration number is required"),
  mileage: z.coerce
    .number()
    .min(0, "Mileage must be a non-negative number")
    .max(1000000, "Mileage is too high"),
  transmission: z.enum(["manual", "automatic"]).optional().or(z.literal("")),
});

const customerSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name is too long"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name is too long"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 characters")
    .max(15, "Phone number is too long"),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(255, "Address is too long"),
  vehicles: z.array(vehicleSchema).min(1, "At least one vehicle is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export default function CreateCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [dvlaLoadingIndex, setDvlaLoadingIndex] = useState<number | null>(null);
  const [dvlaDataByIndex, setDvlaDataByIndex] = useState<
    Record<number, any | null>
  >({});

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema) as any,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      vehicles: [
        {
          make: "",
          year: new Date().getFullYear(),
          vin: "",
          registrationNumber: "",
          mileage: 0,
          transmission: "",
        },
      ],
      password: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "vehicles",
  });

  const lookupVehicle = async (index: number) => {
    const registrationNumber = form
      .getValues(`vehicles.${index}.registrationNumber`)
      ?.trim();
    const vin = form.getValues(`vehicles.${index}.vin`)?.trim();

    if (!registrationNumber || !vin) {
      toast.error("Registration number and VIN are required");
      return;
    }

    setDvlaLoadingIndex(index);
    try {
      const res = await fetch("/api/vehicle-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationNumber: registrationNumber.toUpperCase(),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as any;

      if (!res.ok || !json?.status) {
        toast.error(json?.message || "Failed to fetch vehicle details");
        setDvlaDataByIndex((p) => ({ ...p, [index]: null }));
        return;
      }

      const data = json.data;
      setDvlaDataByIndex((p) => ({ ...p, [index]: data }));
      if (data?.make)
        form.setValue(`vehicles.${index}.make`, data.make, {
          shouldValidate: true,
        });
      if (typeof data?.yearOfManufacture === "number") {
        form.setValue(`vehicles.${index}.year`, data.yearOfManufacture, {
          shouldValidate: true,
        });
      }
      toast.success("Vehicle details fetched");
    } catch {
      toast.error("Failed to fetch vehicle details");
      setDvlaDataByIndex((p) => ({ ...p, [index]: null }));
    } finally {
      setDvlaLoadingIndex(null);
    }
  };

  const onSubmit = async (data: CustomerFormValues) => {
    setLoading(true);
    try {
      const { createDealerCustomerAction } = await import(
        "@/lib/actions/dealer-customer"
      );

      // Ensure vehicles array is properly formatted
      const vehiclesData = data.vehicles.map((vehicle, idx) => ({
        make: vehicle.make.trim(),
        model: "Unknown", // Model not available from DVLA
        year: vehicle.year,
        vin: vehicle.vin?.trim() || null,
        registrationNumber: vehicle.registrationNumber?.trim() || null,
        mileage: vehicle.mileage || 0,
        transmission: vehicle.transmission || undefined,
        dvlaTaxStatus: dvlaDataByIndex[idx]?.taxStatus,
        dvlaTaxDueDate: dvlaDataByIndex[idx]?.taxDueDate,
        dvlaMotStatus: dvlaDataByIndex[idx]?.motStatus,
        dvlaMotExpiryDate: dvlaDataByIndex[idx]?.motExpiryDate,
        dvlaYearOfManufacture: dvlaDataByIndex[idx]?.yearOfManufacture,
        dvlaEngineCapacity: dvlaDataByIndex[idx]?.engineCapacity,
        dvlaCo2Emissions: dvlaDataByIndex[idx]?.co2Emissions,
        dvlaFuelType: dvlaDataByIndex[idx]?.fuelType,
        dvlaMarkedForExport: dvlaDataByIndex[idx]?.markedForExport,
        dvlaColour: dvlaDataByIndex[idx]?.colour,
        dvlaTypeApproval: dvlaDataByIndex[idx]?.typeApproval,
        dvlaDateOfLastV5CIssued: dvlaDataByIndex[idx]?.dateOfLastV5CIssued,
        dvlaWheelplan: dvlaDataByIndex[idx]?.wheelplan,
        dvlaMonthOfFirstRegistration:
          dvlaDataByIndex[idx]?.monthOfFirstRegistration,
      }));

      // Map form data to action expected format
      const result = await createDealerCustomerAction({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        address: data.address.trim(),
        vehicles: vehiclesData,
        password: data.password,
      });

      if (result.status) {
        toast.success(result.message || "Customer created successfully");
        router.push(`/dealer/customers/list?newItemId=${result.data?.id}`);
      } else {
        const errorMessage = result.message || "Failed to create customer";
        toast.error(errorMessage);
        form.setError("root", {
          message: errorMessage,
        });
        console.error("Customer creation failed:", result);
      }
    } catch (error) {
      console.error("Error creating customer:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(errorMessage);
      form.setError("root", { message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Create New Customer
        </h1>
        <p className="text-muted-foreground mt-2">
          Add a new customer to your system
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
          <CardDescription>Enter customer and vehicle details</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Customer Details */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
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
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="1234567890"
                        value={field.value || ""}
                        onChange={(e) => {
                          const numericValue = e.target.value.replace(
                            /[^0-9]/g,
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
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter customer address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-t pt-3">
                <h3 className="text-lg font-semibold mb-2">
                  Account Information
                </h3>
              </div>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Set initial password"
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
                      Customer must change this on first login.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Vehicle Information */}
              <div className="border-t pt-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">Vehicle Information</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        make: "",
                        year: new Date().getFullYear(),
                        vin: "",
                        registrationNumber: "",
                        mileage: 0,
                        transmission: "",
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Vehicle
                  </Button>
                </div>

                <div className="space-y-6">
                  {fields.map((field, index) => (
                    <Card key={field.id} className="relative">
                      <CardContent className="pt-2">
                        {fields.length > 1 && (
                          <div className="absolute top-2 right-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive/90"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        <h4 className="text-sm font-medium mb-4 text-muted-foreground">
                          Vehicle {index + 1}
                        </h4>

                        {/* Step 1: VIN and Registration Number */}
                        <div className="space-y-2">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <p className="text-sm text-blue-800 font-medium">
                              Enter VIN number and Registration number below,
                              then click &quot;Get Vehicle Details&quot; to
                              automatically populate vehicle information.
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`vehicles.${index}.vin`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>VIN Number *</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter VIN number"
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
                              control={form.control}
                              name={`vehicles.${index}.registrationNumber`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Registration Number *</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter registration number"
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

                          <div className="flex justify-end mt-5">
                            <Button
                              type="button"
                              variant="default"
                              size="sm"
                              onClick={() => lookupVehicle(index)}
                              disabled={dvlaLoadingIndex === index}
                              className="bg-gradient-to-r from-[#00C853] to-[#00B4D8] hover:from-[#00B4D8] hover:to-[#00C853]"
                            >
                              {dvlaLoadingIndex === index ? (
                                <>Loading...</>
                              ) : (
                                <>Get Vehicle Details</>
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Step 2: Show fields only after DVLA data is fetched */}
                        {dvlaDataByIndex[index] && (
                          <div className=" space-y-">
                            <div className="rounded-lg  p-4">
                              <h5 className="text-sm font-semibold mb-3 text-gray-900">
                                Vehicle Details
                              </h5>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <Label>Make</Label>
                                  <Input
                                    value={dvlaDataByIndex[index]?.make || "-"}
                                    readOnly
                                    disabled
                                    className="bg-gray-100 cursor-not-allowed"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Year</Label>
                                  <Input
                                    value={
                                      dvlaDataByIndex[index]
                                        ?.yearOfManufacture ?? "-"
                                    }
                                    readOnly
                                    disabled
                                    className="bg-gray-100 cursor-not-allowed"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Fuel Type</Label>
                                  <Input
                                    value={
                                      dvlaDataByIndex[index]?.fuelType || "-"
                                    }
                                    readOnly
                                    disabled
                                    className="bg-gray-100 cursor-not-allowed"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Colour</Label>
                                  <Input
                                    value={
                                      dvlaDataByIndex[index]?.colour || "-"
                                    }
                                    readOnly
                                    disabled
                                    className="bg-gray-100 cursor-not-allowed"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>MOT Status</Label>
                                  <Input
                                    value={
                                      dvlaDataByIndex[index]?.motStatus || "-"
                                    }
                                    readOnly
                                    disabled
                                    className="bg-gray-100 cursor-not-allowed"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Tax Status</Label>
                                  <Input
                                    value={
                                      dvlaDataByIndex[index]?.taxStatus || "-"
                                    }
                                    readOnly
                                    disabled
                                    className="bg-gray-100 cursor-not-allowed"
                                  />
                                </div>
                              </div>

                              {/* Auto-filled fields */}
                              <div className="grid grid-cols-2 gap-4 mt-4">
                                <FormField
                                  control={form.control}
                                  name={`vehicles.${index}.mileage`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Mileage (km) *</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          placeholder="Enter current mileage"
                                          {...field}
                                          onChange={(e) =>
                                            field.onChange(
                                              parseInt(e.target.value) || 0
                                            )
                                          }
                                          value={field.value}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`vehicles.${index}.transmission`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Transmission</FormLabel>
                                      <FormControl>
                                        <Select
                                          value={field.value}
                                          onValueChange={field.onChange}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select transmission" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="manual">
                                              Manual
                                            </SelectItem>
                                            <SelectItem value="automatic">
                                              Automatic
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {form.formState.errors.vehicles && (
                  <p className="text-sm font-medium text-destructive mt-2">
                    {form.formState.errors.vehicles.message}
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Customer"}
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
        </CardContent>
      </Card>
    </div>
  );
}
