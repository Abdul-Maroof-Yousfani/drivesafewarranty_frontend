import { getCustomerWarrantySalesAction } from "@/lib/actions/customer-warranties";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  ShieldCheckIcon,
  AlertCircleIcon,
  PhoneIcon,
  MailIcon,
  ClockIcon,
  CheckCircle2Icon,
  CreditCardIcon,
  FileTextIcon,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

export default async function CustomerWarrantiesPage() {
  const { status, data: warranties } = await getCustomerWarrantySalesAction();

  if (!status || !warranties || warranties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <ShieldCheckIcon className="h-16 w-16 text-muted-foreground/50" />
        <h2 className="text-xl font-semibold text-muted-foreground">
          No Active Warranties Found
        </h2>
        <p className="text-sm text-muted-foreground max-w-md text-center">
          You don't have any warranty packages assigned yet. Please contact your
          dealer if you believe this is an error.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Warranties</h1>
        <p className="text-muted-foreground">
          View and manage your active warranty packages and coverage details.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
        {warranties.map((warranty) => {
          const startDate = new Date(
            warranty.coverageStartDate
          ).toLocaleDateString();
          const endDate = new Date(
            warranty.coverageEndDate
          ).toLocaleDateString();
          const isActive =
            warranty.status === "active" &&
            new Date(warranty.coverageEndDate) > new Date();
          const price =
            warranty.warrantyPrice || warranty.warrantyPackage.price;

          // Parse features if they are strings (JSON)
          let features = [];
          try {
            if (typeof warranty.warrantyPackage.includedFeatures === "string") {
              features = JSON.parse(warranty.warrantyPackage.includedFeatures);
            } else if (
              Array.isArray(warranty.warrantyPackage.includedFeatures)
            ) {
              features = warranty.warrantyPackage.includedFeatures;
            }
          } catch (e) {
            console.error("Error parsing features", e);
          }

          let benefits = [];
          try {
            if (typeof warranty.warrantyPackage.keyBenefits === "string") {
              benefits = JSON.parse(warranty.warrantyPackage.keyBenefits);
            } else if (Array.isArray(warranty.warrantyPackage.keyBenefits)) {
              benefits = warranty.warrantyPackage.keyBenefits;
            }
          } catch (e) {
            console.error("Error parsing benefits", e);
          }

          return (
            <Card
              key={warranty.id}
              className="overflow-hidden border-t-4 border-t-primary shadow-sm hover:shadow-md transition-shadow"
            >
              <CardHeader className="bg-muted/5 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-xl text-primary">
                        {warranty.warrantyPackage.name}
                      </CardTitle>
                      {warranty.warrantyPackage.planLevel && (
                        <Badge
                          variant="outline"
                          className="text-xs uppercase bg-background"
                        >
                          {warranty.warrantyPackage.planLevel}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="font-mono text-xs">
                      Policy #: {warranty.policyNumber}
                    </CardDescription>
                  </div>
                  <Badge variant={isActive ? "default" : "destructive"}>
                    {isActive ? "Active" : "Expired"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Duration & Dates */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex flex-col space-y-1">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <CalendarIcon className="h-3.5 w-3.5" /> Start Date
                    </span>
                    <span className="font-medium">{startDate}</span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <ClockIcon className="h-3.5 w-3.5" /> End Date
                    </span>
                    <span className="font-medium">{endDate}</span>
                  </div>
                </div>

                <Separator />

                {/* Coverage Highlights */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  {price !== undefined && price !== null && (
                    <div className="bg-muted/30 p-2 rounded border text-center">
                      <span className="block text-xs text-muted-foreground mb-1">
                        Price
                      </span>
                      <span className="font-semibold">
                        £{Number(price).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {warranty.warrantyPackage.excess !== null && (
                    <div className="bg-muted/30 p-2 rounded border text-center">
                      <span className="block text-xs text-muted-foreground mb-1">
                        Excess
                      </span>
                      <span className="font-semibold">
                        £{Number(warranty.warrantyPackage.excess)}
                      </span>
                    </div>
                  )}
                  {warranty.warrantyPackage.labourRatePerHour !== null && (
                    <div className="bg-muted/30 p-2 rounded border text-center">
                      <span className="block text-xs text-muted-foreground mb-1">
                        Labour Rate
                      </span>
                      <span className="font-semibold">
                        £{Number(warranty.warrantyPackage.labourRatePerHour)}/hr
                      </span>
                    </div>
                  )}
                  {warranty.warrantyPackage.fixedClaimLimit !== null && (
                    <div className="bg-muted/30 p-2 rounded border text-center">
                      <span className="block text-xs text-muted-foreground mb-1">
                        Claim Limit
                      </span>
                      <span className="font-semibold">
                        £{Number(warranty.warrantyPackage.fixedClaimLimit)}
                      </span>
                    </div>
                  )}
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="details">
                    <AccordionTrigger className="text-sm font-medium">
                      View Full Coverage Details
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        {/* Description */}
                        {warranty.warrantyPackage.description && (
                          <div className="text-sm text-muted-foreground">
                            {warranty.warrantyPackage.description}
                          </div>
                        )}

                        {/* Eligibility */}
                        {warranty.warrantyPackage.eligibility && (
                          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md border border-blue-100 dark:border-blue-900/50">
                            <h4 className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1 flex items-center gap-1.5">
                              <FileTextIcon className="h-3.5 w-3.5" />{" "}
                              Eligibility
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {warranty.warrantyPackage.eligibility}
                            </p>
                          </div>
                        )}

                        {/* Included Features */}
                        {features.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                              <ShieldCheckIcon className="h-4 w-4 text-green-600" />{" "}
                              Included Features
                            </h4>
                            <ul className="grid grid-cols-1 gap-2 text-sm">
                              {features.map((feature: any, idx: number) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2"
                                >
                                  <CheckCircle2Icon className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                  <span className="text-muted-foreground">
                                    {typeof feature === "string"
                                      ? feature
                                      : feature.label ||
                                        JSON.stringify(feature)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Key Benefits */}
                        {benefits.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                              <ShieldCheckIcon className="h-4 w-4 text-blue-600" />{" "}
                              Key Benefits
                            </h4>
                            <ul className="grid grid-cols-1 gap-2 text-sm">
                              {benefits.map((benefit: any, idx: number) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2"
                                >
                                  <CheckCircle2Icon className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                  <span className="text-muted-foreground">
                                    {typeof benefit === "string"
                                      ? benefit
                                      : benefit.label ||
                                        JSON.stringify(benefit)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {warranty.dealer && (
                    <AccordionItem value="dealer">
                      <AccordionTrigger className="text-sm font-medium">
                        Dealer Contact Information
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pt-2 text-sm">
                          <div className="font-medium">
                            {warranty.dealer.businessNameTrading ||
                              warranty.dealer.businessNameLegal}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MailIcon className="h-4 w-4" />
                            <a
                              href={`mailto:${warranty.dealer.email}`}
                              className="hover:underline"
                            >
                              {warranty.dealer.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <PhoneIcon className="h-4 w-4" />
                            <a
                              href={`tel:${warranty.dealer.phone}`}
                              className="hover:underline"
                            >
                              {warranty.dealer.phone}
                            </a>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
