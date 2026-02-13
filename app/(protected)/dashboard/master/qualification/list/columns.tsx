"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HighlightText } from "@/components/common/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Autocomplete, AutocompleteOption } from "@/components/ui/autocomplete";
import { EllipsisIcon, Loader2, Pencil, Trash2 } from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Qualification,
  updateQualification,
  deleteQualification,
} from "@/lib/actions/qualification";
import { getInstitutes, Institute } from "@/lib/actions/institute";
import {
  getCountries,
  getStatesByCountry,
  getCitiesByState,
  Country,
  State,
  City,
} from "@/lib/actions/city";

export type QualificationRow = Qualification & { id: string };

export const columns: ColumnDef<QualificationRow>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 28,
  },
  {
    header: "Institute Name",
    accessorKey: "instituteName",
    size: 300,
    minSize: 250,
    maxSize: 350,
    enableSorting: true,
    cell: ({ row }) => (
      <div className="max-w-[280px] whitespace-normal wrap-break-word">
        <HighlightText text={row.original.instituteName} className="block" />
      </div>
    ),
  },
  {
    header: "Qualification",
    accessorKey: "qualification",
    size: 200,
    enableSorting: true,
    cell: ({ row }) => <HighlightText text={row.original.qualification} />,
  },
  {
    header: "Country",
    accessorKey: "country",
    size: 150,
    enableSorting: true,
    cell: ({ row }) => <HighlightText text={row.original.country} />,
  },
  {
    header: "City",
    accessorKey: "city",
    size: 150,
    enableSorting: true,
    cell: ({ row }) => <HighlightText text={row.original.city} />,
  },
  {
    header: "Status",
    accessorKey: "status",
    size: 100,
    enableSorting: true,
    cell: ({ row }) => (
      <Badge
        variant={row.original.status === "inactive" ? "secondary" : "default"}
      >
        {row.original.status || "active"}
      </Badge>
    ),
  },
  {
    header: "Created At",
    accessorKey: "createdAt",
    size: 150,
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    enableSorting: true,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <RowActions row={row} />,
    size: 60,
    enableHiding: false,
  },
];

type RowActionsProps = {
  row: Row<QualificationRow>;
};

function RowActions({ row }: RowActionsProps) {
  const qual = row.original;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);

  // Data states
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [statesMap, setStatesMap] = useState<Map<string, State[]>>(new Map());
  const [citiesMap, setCitiesMap] = useState<Map<string, City[]>>(new Map());
  const [loadingInstitutes, setLoadingInstitutes] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState<Map<string, boolean>>(
    new Map()
  );
  const [loadingCities, setLoadingCities] = useState<Map<string, boolean>>(
    new Map()
  );

  const [editData, setEditData] = useState({
    instituteId: qual.instituteId || "",
    instituteName: qual.instituteName,
    qualification: qual.qualification,
    countryId: "",
    stateId: "",
    cityId: "",
    country: qual.country,
    city: qual.city,
    status: qual.status,
  });

  // Load data when dialog opens
  useEffect(() => {
    if (editDialog) {
      const loadData = async () => {
        setLoadingInstitutes(true);
        setLoadingCountries(true);

        try {
          // Load institutes
          const institutesResult = await getInstitutes();
          if (institutesResult.status && institutesResult.data) {
            setInstitutes(institutesResult.data);
            // Find and set current institute ID
            const currentInstitute = institutesResult.data.find(
              (inst) => inst.name === qual.instituteName
            );
            if (currentInstitute) {
              setEditData((prev) => ({
                ...prev,
                instituteId: currentInstitute.id,
              }));
            }
          }

          // Load countries
          const countriesResult = await getCountries();
          if (countriesResult.status && countriesResult.data) {
            setCountries(countriesResult.data);
            // Find and set current country ID
            const currentCountry = countriesResult.data.find(
              (c) => c.name === qual.country || c.nicename === qual.country
            );
            if (currentCountry) {
              setEditData((prev) => ({
                ...prev,
                countryId: currentCountry.id,
              }));
              // Load states for current country
              await handleCountryChange(currentCountry.id);
            }
          }
        } catch (error) {
          console.error("Error loading data:", error);
          toast.error("Failed to load data");
        } finally {
          setLoadingInstitutes(false);
          setLoadingCountries(false);
        }
      };

      loadData();
    }
  }, [editDialog, qual.instituteName, qual.country]);

  const handleCountryChange = async (countryId: string) => {
    setEditData((prev) => ({ ...prev, countryId, stateId: "", cityId: "" }));

    if (!countryId) return;

    if (statesMap.has(countryId)) {
      // If states already loaded, find and set current state
      const states = statesMap.get(countryId) || [];
      const currentState = states.find((s) => {
        // Try to match by finding city in this state
        const cities = citiesMap.get(s.id) || [];
        return cities.some((c) => c.name === qual.city);
      });
      if (currentState) {
        setEditData((prev) => ({ ...prev, stateId: currentState.id }));
        await handleStateChange(currentState.id);
      }
      return;
    }

    setLoadingStates((prev) => new Map(prev).set(countryId, true));

    try {
      const result = await getStatesByCountry(countryId);
      if (result.status && result.data) {
        setStatesMap((prev) => new Map(prev).set(countryId, result.data!));
        // Try to find current state by loading cities for each state
        for (const state of result.data) {
          try {
            const citiesResult = await getCitiesByState(state.id);
            if (citiesResult.status && citiesResult.data) {
              setCitiesMap((prev) =>
                new Map(prev).set(state.id, citiesResult.data!)
              );
              const currentCity = citiesResult.data.find(
                (c) => c.name === qual.city
              );
              if (currentCity) {
                setEditData((prev) => ({
                  ...prev,
                  stateId: state.id,
                  cityId: currentCity.id,
                }));
                break;
              }
            }
          } catch (err) {
            // Continue to next state if this one fails
            continue;
          }
        }
      }
    } catch (error) {
      console.error("Error loading states:", error);
      toast.error("Failed to load states");
    } finally {
      setLoadingStates((prev) => {
        const newMap = new Map(prev);
        newMap.set(countryId, false);
        return newMap;
      });
    }
  };

  const handleStateChange = async (stateId: string) => {
    setEditData((prev) => ({ ...prev, stateId, cityId: "" }));

    if (!stateId) return;

    if (citiesMap.has(stateId)) {
      // If cities already loaded, find and set current city
      const cities = citiesMap.get(stateId) || [];
      const currentCity = cities.find((c) => c.name === qual.city);
      if (currentCity) {
        setEditData((prev) => ({ ...prev, cityId: currentCity.id }));
      }
      return;
    }

    setLoadingCities((prev) => new Map(prev).set(stateId, true));

    try {
      const result = await getCitiesByState(stateId);
      if (result.status && result.data) {
        setCitiesMap((prev) => new Map(prev).set(stateId, result.data!));
        // Find and set current city
        const currentCity = result.data.find((c) => c.name === qual.city);
        if (currentCity) {
          setEditData((prev) => ({ ...prev, cityId: currentCity.id }));
        }
      }
    } catch (error) {
      console.error("Error loading cities:", error);
      toast.error("Failed to load cities");
    } finally {
      setLoadingCities((prev) => {
        const newMap = new Map(prev);
        newMap.set(stateId, false);
        return newMap;
      });
    }
  };

  const handleEditSubmit = async () => {
    if (
      !editData.instituteId ||
      !editData.qualification.trim() ||
      !editData.countryId ||
      !editData.stateId ||
      !editData.cityId
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Find selected values to get names
    const selectedInstitute = institutes.find(
      (inst) => inst.id === editData.instituteId
    );
    const selectedCountry = countries.find((c) => c.id === editData.countryId);
    const selectedState = statesMap
      .get(editData.countryId)
      ?.find((s) => s.id === editData.stateId);
    const selectedCity = citiesMap
      .get(editData.stateId)
      ?.find((c) => c.id === editData.cityId);

    if (
      !selectedInstitute ||
      !selectedCountry ||
      !selectedState ||
      !selectedCity
    ) {
      toast.error("Please select all fields");
      return;
    }

    startTransition(async () => {
      const result = await updateQualification(qual.id, {
        instituteId: editData.instituteId,
        instituteName: selectedInstitute.name,
        qualification: editData.qualification,
        country: selectedCountry.nicename || selectedCountry.name,
        city: selectedCity.name,
        status: editData.status,
      });
      if (result.status) {
        toast.success(result.message);
        setEditDialog(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  const instituteOptions: AutocompleteOption[] = institutes.map(
    (institute) => ({
      value: institute.id,
      label: institute.name,
    })
  );

  const countryOptions: AutocompleteOption[] = countries.map((country) => ({
    value: country.id,
    label: country.nicename || country.name,
  }));

  const getStateOptions = (): AutocompleteOption[] => {
    if (!editData.countryId) return [];
    const states = statesMap.get(editData.countryId) || [];
    return states.map((state) => ({
      value: state.id,
      label: state.name,
    }));
  };

  const getCityOptions = (): AutocompleteOption[] => {
    if (!editData.stateId) return [];
    const cities = citiesMap.get(editData.stateId) || [];
    return cities.map((city) => ({
      value: city.id,
      label: city.name,
    }));
  };

  const handleDeleteConfirm = async () => {
    startTransition(async () => {
      const result = await deleteQualification(qual.id);
      if (result.status) {
        toast.success(result.message);
        setDeleteDialog(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex justify-end">
            <Button
              size="icon"
              variant="ghost"
              className="shadow-none"
              aria-label="Actions"
            >
              <EllipsisIcon size={16} />
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditDialog(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Qualification</DialogTitle>
            <DialogDescription>
              Update the qualification details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Institute Name *</Label>
              <Autocomplete
                options={instituteOptions}
                value={editData.instituteId}
                onValueChange={(value) =>
                  setEditData((prev) => {
                    const selected = institutes.find(
                      (inst) => inst.id === value
                    );
                    return {
                      ...prev,
                      instituteId: value,
                      instituteName: selected?.name || prev.instituteName,
                    };
                  })
                }
                placeholder="Select institute..."
                searchPlaceholder="Search institute..."
                disabled={isPending || loadingInstitutes}
                isLoading={loadingInstitutes}
                emptyMessage="No institutes found"
              />
            </div>
            <div className="space-y-2">
              <Label>Qualification *</Label>
              <Input
                value={editData.qualification}
                onChange={(e) =>
                  setEditData({ ...editData, qualification: e.target.value })
                }
                disabled={isPending}
                placeholder="Qualification"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Country *</Label>
                <Autocomplete
                  options={countryOptions}
                  value={editData.countryId}
                  onValueChange={handleCountryChange}
                  placeholder="Select country..."
                  searchPlaceholder="Search country..."
                  disabled={isPending || loadingCountries}
                  isLoading={loadingCountries}
                  emptyMessage="No countries found"
                />
              </div>
              <div className="space-y-2">
                <Label>State *</Label>
                <Autocomplete
                  options={getStateOptions()}
                  value={editData.stateId}
                  onValueChange={handleStateChange}
                  placeholder="Select state..."
                  searchPlaceholder="Search state..."
                  disabled={isPending || !editData.countryId}
                  isLoading={loadingStates.get(editData.countryId) || false}
                  emptyMessage={
                    !editData.countryId
                      ? "Please select a country first"
                      : "No states found"
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>City *</Label>
                <Autocomplete
                  options={getCityOptions()}
                  value={editData.cityId}
                  onValueChange={(value) =>
                    setEditData((prev) => {
                      const selected = citiesMap
                        .get(prev.stateId)
                        ?.find((c) => c.id === value);
                      return {
                        ...prev,
                        cityId: value,
                        city: selected?.name || prev.city,
                      };
                    })
                  }
                  placeholder="Select city..."
                  searchPlaceholder="Search city..."
                  disabled={isPending || !editData.stateId}
                  isLoading={loadingCities.get(editData.stateId) || false}
                  emptyMessage={
                    !editData.stateId
                      ? "Please select a state first"
                      : "No cities found"
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialog(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Qualification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{qual.qualification}&quot;
              from {qual.instituteName}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
