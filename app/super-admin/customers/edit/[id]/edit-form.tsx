"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Customer,
  updateCustomer,
  createCustomerVehicleAction,
  updateCustomerVehicleAction,
  deleteCustomerVehicleAction,
} from "@/lib/actions/customer";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Car } from "lucide-react";

// --- Schemas ---

const customerProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
});

const vehicleSchema = z.object({
  id: z.string().optional(), // Optional for new vehicles
  make: z.string().min(1, "Vehicle make is required"),
  model: z.string().min(1, "Vehicle model is required"),
  year: z.coerce
    .number()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  vin: z.string().optional().or(z.literal("")),
  registrationNumber: z.string().optional().or(z.literal("")),
  mileage: z.coerce.number().min(0),
  transmission: z.enum(["manual", "automatic"]).optional().or(z.literal("")),
});

type CustomerProfileValues = z.infer<typeof customerProfileSchema>;
type VehicleValues = z.infer<typeof vehicleSchema>;

// --- Components ---

export default function EditCustomerForm({ customer }: { customer: Customer }) {
  const router = useRouter();

  // Profile Form
  const profileForm = useForm<CustomerProfileValues>({
    resolver: zodResolver(customerProfileSchema),
    defaultValues: {
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
    },
  });

  const [profileLoading, setProfileLoading] = useState(false);

  const onProfileSubmit = async (data: CustomerProfileValues) => {
    setProfileLoading(true);
    try {
      const result = await updateCustomer(customer.id, data);
      if (result.status) {
        toast.success(result.message || "Profile updated successfully");
      } else {
        toast.error(result.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setProfileLoading(false);
    }
  };

  // Vehicle Management State
  const [vehicles, setVehicles] = useState(customer.vehicles || []);
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleValues | null>(
    null
  );

  const handleVehicleSaved = (savedVehicle: any, isNew: boolean) => {
    if (isNew) {
      setVehicles([...vehicles, savedVehicle]);
    } else {
      setVehicles(
        vehicles.map((v) => (v.id === savedVehicle.id ? savedVehicle : v))
      );
    }
    setIsVehicleDialogOpen(false);
    setEditingVehicle(null);
    router.refresh();
  };

  const handleVehicleDeleted = (vehicleId: string) => {
    setVehicles(vehicles.filter((v) => v.id !== vehicleId));
    router.refresh();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Customer</h1>
          <p className="text-muted-foreground mt-2">
            Manage customer details and vehicles
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Profile</CardTitle>
          <CardDescription>Update personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form
              onSubmit={profileForm.handleSubmit(onProfileSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={profileForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={profileLoading}>
                  {profileLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Vehicles</CardTitle>
            <CardDescription className="mt-1">
              Manage customer vehicles
            </CardDescription>
          </div>
          <Button
            onClick={() => {
              setEditingVehicle(null);
              setIsVehicleDialogOpen(true);
            }}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Vehicle
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {vehicles.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No vehicles found.
            </p>
          ) : (
            vehicles.map((vehicle, index) => (
              <div
                key={vehicle.id || index}
                className="flex items-center justify-between p-4 border rounded-lg bg-card"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Car className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">
                      {vehicle.make} {vehicle.model} ({vehicle.year})
                    </h4>
                    <div className="text-sm text-muted-foreground space-x-2">
                      <span>{vehicle.registrationNumber || "No Reg"}</span>
                      <span>•</span>
                      <span>
                        {vehicle.mileage ? vehicle.mileage.toLocaleString() : 0}{" "}
                        km
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingVehicle(vehicle);
                      setIsVehicleDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <DeleteVehicleButton
                    vehicleId={vehicle.id!}
                    onDelete={handleVehicleDeleted}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={isVehicleDialogOpen} onOpenChange={setIsVehicleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingVehicle ? "Edit Vehicle" : "Add Vehicle"}
            </DialogTitle>
            <DialogDescription>
              {editingVehicle
                ? "Update vehicle details."
                : "Add a new vehicle to this customer."}
            </DialogDescription>
          </DialogHeader>
          <VehicleForm
            customerId={customer.id}
            initialData={editingVehicle}
            onSuccess={(data, isNew) => handleVehicleSaved(data, isNew)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function VehicleForm({
  customerId,
  initialData,
  onSuccess,
}: {
  customerId: string;
  initialData: VehicleValues | null;
  onSuccess: (data: any, isNew: boolean) => void;
}) {
  const defaultValues = initialData || {
    make: "",
    model: "",
    year: new Date().getFullYear(),
    vin: "",
    registrationNumber: "",
    mileage: 0,
    transmission: "",
  };

  const form = useForm<VehicleValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues,
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: VehicleValues) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        transmission: data.transmission || undefined,
      };

      let result;
      if (initialData?.id) {
        // Update
        result = await updateCustomerVehicleAction(
          initialData.id,
          payload as any
        );
      } else {
        // Create
        result = await createCustomerVehicleAction(customerId, payload as any);
      }

      if (result.status) {
        toast.success(result.message || "Vehicle saved successfully");
        onSuccess(result.data, !initialData?.id);
      } else {
        toast.error(result.message || "Failed to save vehicle");
      }
    } catch (e) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="make"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Make</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mileage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mileage</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="transmission"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transmission</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select transmission" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="automatic">Automatic</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="vin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>VIN</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                <FormLabel>Reg Number</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <DialogFooter>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving" : "Save"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function DeleteVehicleButton({
  vehicleId,
  onDelete,
}: {
  vehicleId: string;
  onDelete: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;
    setLoading(true);
    try {
      const res = await deleteCustomerVehicleAction(vehicleId);
      if (res.status) {
        toast.success("Vehicle deleted");
        onDelete(vehicleId);
      } else {
        toast.error(res.message || "Failed to delete");
      }
    } catch (e) {
      toast.error("Error deleting vehicle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-destructive hover:text-destructive"
      onClick={handleDelete}
      disabled={loading}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
