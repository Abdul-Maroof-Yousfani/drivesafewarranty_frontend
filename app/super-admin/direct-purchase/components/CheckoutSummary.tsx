"use client";

import { Car, User, Shield, CreditCard, Check, Mail, Key, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface CheckoutSummaryProps {
  vehicleData: {
    make: string;
    model: string;
    year: number;
    vin?: string;
    registrationNumber?: string;
    mileage: number;
    transmission?: string;
  };
  customerData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
  };
  selectedPackage: {
    name: string;
    description?: string | null;
  } | null;
  selectedDuration: 12 | 24 | 36;
  totalAmount: number;
  termsAccepted: boolean;
  onTermsChange: (accepted: boolean) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function CheckoutSummary({
  vehicleData,
  customerData,
  selectedPackage,
  selectedDuration,
  totalAmount,
  termsAccepted,
  onTermsChange,
  onSubmit,
  isSubmitting,
}: CheckoutSummaryProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vehicle Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Car className="h-5 w-5 text-[#00C853]" />
              Vehicle Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vehicle</span>
              <span className="font-medium">
                {vehicleData.year} {vehicleData.make} {vehicleData.model}
              </span>
            </div>
            {vehicleData.vin && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">VIN</span>
                <span className="font-medium">{vehicleData.vin}</span>
              </div>
            )}
            {vehicleData.registrationNumber && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Registration</span>
                <span className="font-medium">{vehicleData.registrationNumber}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mileage</span>
              <span className="font-medium">
                {vehicleData.mileage.toLocaleString()} km
              </span>
            </div>
            {vehicleData.transmission && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transmission</span>
                <span className="font-medium capitalize">
                  {vehicleData.transmission}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-[#00C853]" />
              Customer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">
                {customerData.firstName} {customerData.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{customerData.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium">{customerData.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Address</span>
              <span className="font-medium text-right max-w-[200px] truncate">
                {customerData.address}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warranty Package Summary */}
      <Card className="bg-gradient-to-r from-[#00C853]/5 to-[#00B4D8]/5 border-[#00C853]/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#00C853]" />
            Selected Warranty
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-lg">{selectedPackage?.name}</p>
              {selectedPackage?.description && (
                <p className="text-sm text-muted-foreground">
                  {selectedPackage.description}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-semibold">{selectedDuration} Months</p>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total Amount</span>
            <span className="text-3xl font-bold bg-gradient-to-r from-[#00C853] to-[#00B4D8] bg-clip-text text-transparent">
              ${totalAmount.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => onTermsChange(!!checked)}
              />
              <label
                htmlFor="terms"
                className="text-sm leading-relaxed cursor-pointer"
              >
                I have read and agree to the{" "}
                <a
                  href="#"
                  className="text-[#00C853] hover:underline font-medium"
                >
                  Terms and Conditions
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-[#00C853] hover:underline font-medium"
                >
                  Privacy Policy
                </a>
                . I understand that a customer account will be created and login
                credentials will be sent to the provided email address.
              </label>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Account Credentials
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">
                    After purchase, an email will be sent to{" "}
                    <strong>{customerData.email}</strong> with portal login
                    credentials.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        size="lg"
        className={cn(
          "w-full h-14 text-lg font-semibold",
          "bg-gradient-to-r from-[#00C853] to-[#00B4D8] hover:opacity-90"
        )}
        disabled={!termsAccepted || isSubmitting}
        onClick={onSubmit}
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            Complete Purchase - ${totalAmount.toLocaleString()}
          </>
        )}
      </Button>
    </div>
  );
}

interface SuccessModalProps {
  isOpen: boolean;
  customerEmail: string;
  temporaryPassword: string;
  policyNumber: string;
  onClose: () => void;
}

export function SuccessModal({
  isOpen,
  customerEmail,
  temporaryPassword,
  policyNumber,
  onClose,
}: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-background rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-[#00C853] to-[#00B4D8] p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
          <p className="text-white/80">Warranty purchase completed</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Policy Number</p>
            <p className="text-xl font-bold font-mono">{policyNumber}</p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Key className="h-4 w-4 text-[#00C853]" />
              Customer Portal Credentials
            </h3>

            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Email (Username)
                </p>
                <p className="font-medium font-mono">{customerEmail}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Temporary Password
                </p>
                <p className="font-medium font-mono text-lg">{temporaryPassword}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400">
              <Mail className="h-4 w-4 mt-0.5 shrink-0" />
              <p>
                These credentials have also been sent to the customer's email.
                The customer will be prompted to change their password on first
                login.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Close
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-[#00C853] to-[#00B4D8]"
              onClick={() => window.open("/super-admin/customers/list", "_blank")}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View Customers
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
