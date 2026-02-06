"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Customer,
  updateCustomer,
  createCustomer,
  createCustomerVehicleAction,
  updateCustomerVehicleAction,
  deleteCustomerVehicleAction,
} from "@/lib/actions/customer";
import { createDealerCustomerAction } from "@/lib/actions/dealer-customer";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Car, Eye, EyeOff, ChevronUp, ChevronDown } from "lucide-react";

// --- Schemas ---

const vehicleSchema = z.object({
  id: z.string().optional(),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  vin: z.string().min(1, "VIN is required"),
  registrationNumber: z.string().min(1, "Registration number is required"),
  mileage: z.coerce.number().min(0).default(0),
  transmission: z.string().optional().or(z.literal("")),
});

const customerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
  vehicles: z.array(vehicleSchema).optional(),
});


type CustomerFormValues = z.infer<typeof customerSchema>;
type VehicleValues = z.infer<typeof vehicleSchema>;

interface VehicleFormProps {
  customerId: string;
  initialData?: VehicleValues | null;
  onSuccess: (vehicle: any, isNew: boolean) => void;
  onCancel: () => void;
}


interface CustomerSharedFormProps {
  role: "admin" | "dealer";
  customer?: Customer; // If present, Edit mode. If absent, Create mode.
}

export function CustomerSharedForm({ role, customer }: CustomerSharedFormProps) {
  const router = useRouter();
  const isEditMode = !!customer;
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // --- Form Setup ---
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema) as any,
    defaultValues: {
      firstName: customer?.firstName || "",
      lastName: customer?.lastName || "",
      email: customer?.email || "",
      phone: customer?.phone || "",
      address: customer?.address || "",
      password: "",
      vehicles: (customer?.vehicles || []).map((v: any) => ({
        ...v,
        make: v.make || "",
        model: v.model || "",
        year: v.year || new Date().getFullYear(),
        vin: v.vin || "",
        registrationNumber: v.registrationNumber || "",
        mileage: v.mileage || 0,
        transmission: v.transmission || "",
      })),
    },
  });

  // --- Vehicle Management (Edit Mode) ---
  const [vehicles, setVehicles] = useState(customer?.vehicles || []);
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleValues | null>(null);

  // --- Vehicle Management (Create Mode) ---
  const { fields: createVehicles, append: appendVehicle, remove: removeVehicle } = useFieldArray({
    control: form.control,
    name: "vehicles",
  });
  // State for DVLA data in Create Mode
  const [dvlaLoadingIndex, setDvlaLoadingIndex] = useState<number | null>(null);
  const [dvlaDataByIndex, setDvlaDataByIndex] = useState<Record<number, any>>({});

  // --- Actions ---

  const onSubmit = async (data: CustomerFormValues) => {
    setLoading(true);
    try {
      if (isEditMode) {
        // Edit Mode: Update Profile Only (Vehicles handled separately)
        const result = await updateCustomer(customer!.id, {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            address: data.address,
        });

        if (result.status) {
          toast.success("Profile updated successfully");
          router.refresh();
        } else {
          toast.error(result.message || "Failed to update profile");
        }
      } else {
        // Create Mode: Create Customer + Vehicles
        // Transform vehicles with DVLA data
        const vehiclesData = (data.vehicles || []).map((v, idx) => ({
            ...v,
             model: v.model || "Unknown",
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
             dvlaMonthOfFirstRegistration: dvlaDataByIndex[idx]?.monthOfFirstRegistration,
        }));

        let result;
        if (role === "admin") {
             result = await createCustomer({ ...data, vehicles: vehiclesData } as any);
        } else {
             // For dealer, we need to ensure the payload matches expected
             result = await createDealerCustomerAction({
                ...data,
                vehicles: vehiclesData as any,
                password: data.password || "password123", // Fallback if no password provided (though schema validates)
             });
        }

        if (result.status) {
            toast.success("Customer created successfully");
            const basePath = role === 'admin' ? '/super-admin' : '/dealer';
            router.push(`${basePath}/customers/list?newItemId=${result.data?.id}`);
        } else {
            toast.error(result.message || "Failed to create customer");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // --- Create Mode Helpers ---
  const lookupVehicleCreate = async (index: number) => {
    const registrationNumber = form.getValues(`vehicles.${index}.registrationNumber`)?.trim();
    const vin = form.getValues(`vehicles.${index}.vin`)?.trim();

    if (!registrationNumber || !vin) {
      toast.error("Registration number and VIN are required");
      return;
    }

    setDvlaLoadingIndex(index);
    try {
      const res = await fetch("/internal-api/vehicle-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationNumber: registrationNumber.toUpperCase() }),
      });
      const json = (await res.json().catch(() => ({}))) as any;

      if (!res.ok || !json?.status) {
        toast.error(json?.message || "Failed to fetch vehicle details");
        setDvlaDataByIndex((p) => ({ ...p, [index]: null }));
        return;
      }

      const data = json.data;
      setDvlaDataByIndex((p) => ({ ...p, [index]: data }));
      if (data?.make) form.setValue(`vehicles.${index}.make`, data.make, { shouldValidate: true });
      if (typeof data?.yearOfManufacture === "number") {
        form.setValue(`vehicles.${index}.year`, data.yearOfManufacture, { shouldValidate: true });
      }
      toast.success("Vehicle details fetched");
    } catch {
      toast.error("Failed to fetch vehicle details");
    } finally {
      setDvlaLoadingIndex(null);
    }
  };

  // --- Edit Mode Helpers ---
  const handleVehicleSaved = (savedVehicle: any, isNew: boolean) => {
    if (isNew) {
      setVehicles([...vehicles, savedVehicle]);
    } else {
      setVehicles(vehicles.map((v: any) => (v.id === savedVehicle.id ? savedVehicle : v)));
    }
    setIsVehicleDialogOpen(false);
    setEditingVehicle(null);
    router.refresh();
  };

  const handleVehicleDeleted = (vehicleId: string) => {
    setVehicles(vehicles.filter((v: any) => v.id !== vehicleId));
    router.refresh();
  };

  // --- Render ---

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
            {isEditMode ? "Edit Customer" : "Create New Customer"}
        </h1>
        <p className="text-muted-foreground mt-2">
            {isEditMode ? "Manage customer details and vehicles" : "Add a new customer to the system"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
          <CardDescription>Enter customer details</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...(form as any)}>
            <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl><Input placeholder="John" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as any}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl><Input placeholder="Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control as any}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                        <Input
                            placeholder="1234567890"
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value.replace(/[^0-9]/g, ""))}
                        />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl><Textarea placeholder="Enter customer address" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!isEditMode && (
                <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                     <FormField
                        control={form.control as any}
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
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            </FormControl>
                            <FormDescription>Customer will be prompted to change this password on their first login.</FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
              )}

              {/* Create Mode: Integrated Vehicle Form */}
              {!isEditMode && (
                 <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Vehicle Information</h3>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => appendVehicle({
                                make: "", model: "", year: new Date().getFullYear(),
                                vin: "", registrationNumber: "", mileage: 0, transmission: ""
                            })}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Vehicle
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {createVehicles.map((field, index) => (
                            <Card key={field.id} className="relative">
                                <CardContent className="pt-6">
                                     {createVehicles.length > 1 && (
                                        <div className="absolute top-2 right-2">
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeVehicle(index)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                     )}
                                    {/* Simplified vehicle inputs for shortness - reusing logic from detailed form */}
                                   
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                         <FormField control={form.control as any} name={`vehicles.${index}.vin`} render={({field}) => (
                                              <FormItem><FormLabel>VIN</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                         )} />
                                          <FormField control={form.control as any} name={`vehicles.${index}.registrationNumber`} render={({field}) => (
                                              <FormItem><FormLabel>Registration Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                         )} />
                                    </div>
                                    <Button
                                         type="button" variant="outline" size="sm" onClick={() => lookupVehicleCreate(index)}
                                         disabled={dvlaLoadingIndex === index}
                                    >
                                        {dvlaLoadingIndex === index ? "Loading..." : "Get Vehicle Details"}
                                    </Button>

                                    {(dvlaDataByIndex[index] || form.formState.errors.vehicles?.[index]) && (
                                    <div className="grid grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                         {/* 1. FETCHED / READ-ONLY DATA SECTION */}
                                         <FormField control={form.control as any} name={`vehicles.${index}.make`} render={({field}) => (
                                              <FormItem><FormLabel>Make</FormLabel><FormControl><Input {...field} disabled={!!dvlaDataByIndex[index]?.make} /></FormControl><FormMessage /></FormItem>
                                         )} />
                                         <FormField control={form.control as any} name={`vehicles.${index}.year`} render={({field}) => (
                                              <FormItem><FormLabel>Year</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value)||0)} disabled={!!dvlaDataByIndex[index]?.yearOfManufacture} /></FormControl><FormMessage /></FormItem>
                                         )} />

                                         <FormItem>
                                              <FormLabel>Colour</FormLabel>
                                              <FormControl><Input disabled value={dvlaDataByIndex[index]?.colour || ''} /></FormControl>
                                         </FormItem>
                                         <FormItem>
                                              <FormLabel>Fuel Type</FormLabel>
                                              <FormControl><Input disabled value={dvlaDataByIndex[index]?.fuelType || ''} /></FormControl>
                                         </FormItem>

                                         <FormItem>
                                              <FormLabel>Tax Status</FormLabel>
                                              <FormControl><Input disabled value={dvlaDataByIndex[index]?.taxStatus || ''} className={dvlaDataByIndex[index]?.taxStatus === 'Taxed' ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'} /></FormControl>
                                         </FormItem>
                                         <FormItem>
                                              <FormLabel>MOT Status</FormLabel>
                                              <FormControl><Input disabled value={dvlaDataByIndex[index]?.motStatus || ''} className={dvlaDataByIndex[index]?.motStatus === 'Valid' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'} /></FormControl>
                                         </FormItem>

                                         {/* 2. MANUAL INPUT SECTION - Grouped at the bottom */}
                                       

                                         <FormField control={form.control as any} name={`vehicles.${index}.model`} render={({field}) => (
                                              <FormItem className="col-span-2"><FormLabel>Model</FormLabel><FormControl><Input {...field} placeholder="Enter specific model details..." /></FormControl><FormMessage /></FormItem>
                                         )} />

                                          <FormField control={form.control as any} name={`vehicles.${index}.mileage`} render={({field}) => (
                                              <FormItem><FormLabel>Mileage</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value)||0)} /></FormControl><FormMessage /></FormItem>
                                         )} />
                                         
                                         <FormField control={form.control as any} name={`vehicles.${index}.transmission`} render={({field}) => (
                                              <FormItem><FormLabel>Transmission</FormLabel><FormControl>
                                                 <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="manual">Manual</SelectItem>
                                                        <SelectItem value="automatic">Automatic</SelectItem>
                                                    </SelectContent>
                                                 </Select>
                                              </FormControl><FormMessage /></FormItem>
                                         )} />
                                    </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                 </div>
              )}

              <div className="flex justify-end gap-2">
                 <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                 <Button type="submit" disabled={loading}>{loading ? "Saving..." : (isEditMode ? "Save Changes" : "Create Customer")}</Button>
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Edit Mode: Separate Vehicle Management Section */}
      {isEditMode && (
         <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Vehicles</CardTitle>
                    <CardDescription>Manage customer vehicles</CardDescription>
                </div>
                <Button size="sm" onClick={() => { setEditingVehicle(null); setIsVehicleDialogOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" /> Add Vehicle
                </Button>
            </CardHeader>
            <CardContent>
                 <div className="space-y-4">
                     {(vehicles || []).map((vehicle: any) => (
                         <div key={vehicle.id} className="flex items-center justify-between p-4 border rounded-lg">
                             <div className="flex items-center gap-4">
                                 <div className="p-2 bg-primary/10 rounded-full"><Car className="h-5 w-5 text-primary" /></div>
                                 <div>
                                     <h4 className="font-semibold">{vehicle.make} {vehicle.model}</h4>
                                     <div className="text-sm text-muted-foreground">{vehicle.registrationNumber}</div>
                                 </div>
                             </div>
                             <div className="flex gap-2">
                                <Button variant="ghost" size="icon" onClick={() => { 
                                     setEditingVehicle({
                                         ...vehicle,
                                         make: vehicle.make || "",
                                         model: vehicle.model || "",
                                         year: vehicle.year || new Date().getFullYear(),
                                         vin: vehicle.vin || "",
                                         registrationNumber: vehicle.registrationNumber || "",
                                         mileage: vehicle.mileage || 0,
                                         transmission: vehicle.transmission || "",
                                     }); 
                                     setIsVehicleDialogOpen(true); 
                                 }}> <Edit className="h-4 w-4" /> </Button>
                                 <DeleteVehicleButton vehicleId={vehicle.id} onDelete={handleVehicleDeleted} />
                             </div>
                         </div>
                     ))}
                 </div>
            </CardContent>
         </Card>
      )}


      {/* Vehicle Dialog for Edit Mode */}
      {isEditMode && (
        <Dialog open={isVehicleDialogOpen} onOpenChange={setIsVehicleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingVehicle ? "Edit Vehicle" : "Add Vehicle"}</DialogTitle>
              <DialogDescription>
                {editingVehicle ? "Update vehicle details." : "Add a new vehicle to this customer."}
              </DialogDescription>
            </DialogHeader>
            <VehicleForm
              customerId={customer!.id}
              initialData={editingVehicle}
              onSuccess={handleVehicleSaved}
              onCancel={() => setIsVehicleDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}


// --- Sub Components ---


function VehicleForm({ customerId, initialData, onSuccess, onCancel }: VehicleFormProps) {
    const [loading, setLoading] = useState(false);
    const [dvlaLoading, setDvlaLoading] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [dvlaData, setDvlaData] = useState<any | null>(() => {
        if (initialData?.id && ((initialData as any).dvlaFuelType || (initialData as any).dvlaTaxStatus)) {
            const d = initialData as any;
            return {
                make: d.make,
                yearOfManufacture: d.dvlaYearOfManufacture || d.year,
                fuelType: d.dvlaFuelType,
                colour: d.dvlaColour,
                motStatus: d.dvlaMotStatus,
                taxStatus: d.dvlaTaxStatus,
            };
        }
        return null;
    });



    const form = useForm<VehicleValues>({
        resolver: zodResolver(vehicleSchema) as any,
        defaultValues: {
            make: initialData?.make || "",
            model: initialData?.model || "",
            year: initialData?.year || new Date().getFullYear(),
            vin: initialData?.vin || "",
            registrationNumber: initialData?.registrationNumber || "",
            mileage: initialData?.mileage || 0,
            transmission: initialData?.transmission || "",
        }
    });


    const lookupVehicle = async () => {
        const registrationNumber = form.getValues("registrationNumber")?.trim();
        const vin = form.getValues("vin")?.trim();
    
        if (!registrationNumber || !vin) {
          toast.error("Registration number and VIN are required");
          return;
        }
    
        setDvlaLoading(true);
        try {
          const res = await fetch("/internal-api/vehicle-enquiry", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ registrationNumber: registrationNumber.toUpperCase() }),
          });
          const json = (await res.json().catch(() => ({}))) as any;
          if (!res.ok || !json?.status) {
            toast.error(json?.message || "Failed to fetch vehicle details");
            setDvlaData(null);
            return;
          }
          const data = json.data;
          setDvlaData(data);
          if (data?.make) form.setValue("make", data.make, { shouldValidate: true });
          if (typeof data?.yearOfManufacture === "number") {
            form.setValue("year", data.yearOfManufacture, { shouldValidate: true });
          }
          toast.success("Vehicle details fetched");
          setShowDetails(true);
        } catch {
          toast.error("Failed to fetch vehicle details");
          setDvlaData(null);
        } finally {
          setDvlaLoading(false);
        }
      };

    const onSubmit = async (data: VehicleValues) => {
        setLoading(true);
        try {
            const payload: any = {
                ...data,
                transmission: data.transmission || undefined,
                ...(dvlaData
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
                  : {}),
              };

            let result;
            if (initialData?.id) {
                result = await updateCustomerVehicleAction(initialData.id, payload);
            } else {
                result = await createCustomerVehicleAction(customerId, payload);
            }

            if (result.status) {
                toast.success("Vehicle saved");
                onSuccess(result.data, !initialData?.id);
            } else {
                toast.error(result.message || "Failed");
            }
        } catch(e) { toast.error("Error saving vehicle"); }
        finally { setLoading(false); }
    };

    return (
        <Form {...(form as any)}>
            <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control as any} name="make" render={({field}) => (
                        <FormItem><FormLabel>Make</FormLabel><FormControl><Input {...field} disabled={!!initialData?.id} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control as any} name="model" render={({field}) => (
                        <FormItem><FormLabel>Model</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control as any} name="vin" render={({field}) => (
                        <FormItem><FormLabel>VIN</FormLabel><FormControl><Input {...field} onChange={e => field.onChange(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} disabled={!!initialData?.id} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control as any} name="registrationNumber" render={({field}) => (
                        <FormItem><FormLabel>Reg Number</FormLabel><FormControl><Input {...field} onChange={e => field.onChange(e.target.value.toUpperCase().replace(/\s+/g, ""))} disabled={!!initialData?.id} /></FormControl><FormMessage /></FormItem>
                    )} />
                 </div>

                  {/* Create Mode: Hide details until fetched. Edit Mode: Show if data exists or allow manual override if needed (though Edit usually has data) */}
                  {/* But for consistent UX, let's show details if present, and fields if present OR initialData exists (Edit Mode always shows) */}
                  {(dvlaData || initialData?.id) && (
                     <>
                        {dvlaData && (
                            <div className="mt-4 mb-4 p-3 bg-muted/50 rounded-md text-sm border border-border/50 animate-in fade-in zoom-in-95 duration-200">
                                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                                    <p><span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wider">Make</span> {dvlaData.make}</p>
                                    <p><span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wider">Year</span> {dvlaData.yearOfManufacture}</p>
                                    <p><span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wider">Colour</span> {dvlaData.colour}</p>
                                    <p><span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wider">Fuel Type</span> {dvlaData.fuelType}</p>
                                    <div className="col-span-2 mt-2 pt-2 border-t border-border/50 flex gap-4">
                                        <div><span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wider">Tax Status</span> <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${dvlaData.taxStatus === 'Taxed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{dvlaData.taxStatus}</span></div>
                                        <div><span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wider">MOT Status</span> <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${dvlaData.motStatus === 'Valid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{dvlaData.motStatus}</span></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <FormField control={form.control as any} name="year" render={({field}) => (
                                <FormItem><FormLabel>Year</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value)||0)} disabled={!!initialData?.id} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control as any} name="mileage" render={({field}) => (
                                <FormItem><FormLabel>Mileage</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value)||0)} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        <FormField control={form.control as any} name="transmission" render={({field}) => (
                                <FormItem><FormLabel>Transmission</FormLabel><FormControl>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="manual">Manual</SelectItem>
                                            <SelectItem value="automatic">Automatic</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl><FormMessage /></FormItem>
                            )} />
                     </>
                  )}

                {!initialData?.id && (
                    <div className="flex justify-between items-center bg-muted/20 p-2 rounded-lg border border-border/40">
                         <div className="flex gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={lookupVehicle} disabled={dvlaLoading} className="h-8 text-[11px] font-bold uppercase tracking-wider">
                                {dvlaLoading ? "Fetching..." : "Fetch Vehicle Details"}
                            </Button>
                             {(dvlaData) && (
                                <Button type="button" variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)} className="h-8 text-[11px] font-bold uppercase tracking-wider gap-1.5">
                                    {showDetails ? <>Hide Details <ChevronUp className="h-3 w-3" /></> : <>View All Details <ChevronDown className="h-3 w-3" /></>}
                                </Button>
                            )}
                         </div>
                    </div>
                )}

                 <DialogFooter>
                     <Button type="submit" disabled={loading}>Save</Button>
                 </DialogFooter>
            </form>
        </Form>
    );
}


function DeleteVehicleButton({ vehicleId, onDelete }: { vehicleId: string; onDelete: (id: string) => void }) {
    const handleDelete = async () => {
         await deleteCustomerVehicleAction(vehicleId);
         onDelete(vehicleId);
    };
    return (
        <AlertDialog>
           <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
           <AlertDialogContent>
               <AlertDialogHeader><AlertDialogTitle>Delete?</AlertDialogTitle><AlertDialogDescription>Confirm deletion.</AlertDialogDescription></AlertDialogHeader>
               <AlertDialogFooter>
                   <AlertDialogCancel>Cancel</AlertDialogCancel>
                   <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
               </AlertDialogFooter>
           </AlertDialogContent>
        </AlertDialog>
    )
}
