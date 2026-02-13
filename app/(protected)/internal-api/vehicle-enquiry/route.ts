import { NextResponse } from "next/server";

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

export async function POST(req: Request) {
  try {
    const apiKey = process.env["x-api-key"] ;
    if (!apiKey) {
      return NextResponse.json(
        { status: false, message: "API Key not configured" },
        { status: 500 }
      );
    }

    const body = (await req.json().catch(() => null)) as
      | { registrationNumber?: string }
      | null;
    const registrationNumber = body?.registrationNumber?.trim();
    if (!registrationNumber) {
      return NextResponse.json(
        { status: false, message: "registrationNumber is required" },
        { status: 400 }
      );
    }

    const res = await fetch(
      "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({ registrationNumber }),
        cache: "no-store",
      }
    );

    const json = (await res.json().catch(() => ({}))) as Partial<
      DvlaVehicleEnquiryResponse & { errors?: unknown; message?: string }
    >;

    if (!res.ok) {
      return NextResponse.json(
        {
          status: false,
          message:
            (typeof json?.message === "string" && json.message) ||
            `DVLA lookup failed with status ${res.status}`,
          data: json,
        },
        { status: res.status }
      );
    }

    return NextResponse.json({ status: true, data: json });
  } catch {
    return NextResponse.json(
      { status: false, message: "Failed to lookup vehicle details" },
      { status: 500 }
    );
  }
}


