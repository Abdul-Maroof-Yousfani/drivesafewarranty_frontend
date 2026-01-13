import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import { InvoiceData, InvoiceSettings } from "./invoice-renderer";

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: "bold",
    },
  ],
});

Font.register({
  family: "Open Sans",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf",
    },
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf",
      fontWeight: "bold",
    },
  ],
});

Font.register({
  family: "Arial", // Using Roboto as a very close free alternative
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: "bold",
    },
  ],
});

Font.register({
  family: "Verdana",
  src: "https://github.com/itfoundry/verdana-font/blob/master/Verdana.ttf?raw=true",
});

Font.register({
  family: "Georgia",
  src: "https://github.com/Stonelinks/georgia-font/blob/master/georgia.ttf?raw=true",
});

Font.register({
  family: "Gill Sans",
  src: "https://github.com/TheRealVampire/Gill-Sans-Font/blob/master/Gill%20Sans.ttf?raw=true",
});

Font.register({
  family: "Trebuchet MS",
  src: "https://github.com/Stonelinks/trebuchet-ms-font/blob/master/trebuc.ttf?raw=true",
});

const createStyles = (settings: InvoiceSettings) => {
  const primaryColor = settings.primaryColor || "#000000";
  const accentColor = settings.accentColor || "#f1f5f9";

  return StyleSheet.create({
    page: {
      flexDirection: "column",
      backgroundColor: "#ffffff",
      fontFamily: settings.font || "Helvetica",
      padding: 0, // Removed page-level padding
      paddingBottom: 20, // Small bottom buffer
    },
    headerBar: {
      backgroundColor: primaryColor,
      height: 30, // Increased height to match h-8
      width: "100%",
      marginBottom: 0,
    },
    container: {
      paddingHorizontal: 35, // Balanced padding
      paddingVertical: 22,
    },
    headerSection: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 24,
    },
    companyInfo: {
      flexDirection: "column",
      flex: 1,
    },
    logo: {
      height: 90,
      objectFit: "contain",
      width: 200,
      marginBottom: 8,
    },
    companyName: {
      fontSize: 18,
      fontWeight: "bold",
      color: primaryColor,
      marginBottom: 3,
    },
    companyAddress: {
      fontSize: 9,
      color: "#64748b",
      lineHeight: 1.4,
      maxWidth: 200,
    },
    invoiceInfo: {
      flex: 1,
      textAlign: "right",
      alignItems: "flex-end",
    },
    invoiceTitle: {
      fontSize: 24, // Restored to 24 since we have more flex space
      fontWeight: "light",
      color: primaryColor,
      textTransform: "uppercase",
      marginBottom: 6,
      maxWidth: "100%",
    },
    invoiceDetail: {
      fontSize: 10,
      color: "#0f172a",
      marginBottom: 2,
    },
    boldText: {
      fontWeight: "bold",
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginBottom: 4,
    },
    infoLabel: {
      fontSize: 10,
      fontWeight: "bold",
      color: "#334155",
      marginRight: 5,
    },
    infoValue: {
      fontSize: 10,
      color: "#0f172a",
    },
    billToCard: {
      backgroundColor: accentColor,
      padding: 15,
      borderRadius: 4,
      marginBottom: 12,
      flexDirection: "row",
    },
    billToLeft: {
      flex: 1,
    },
    billToContainer: {
      flex: 1,
    },
    billToRight: {
      flex: 1,
      alignItems: "flex-end",
      justifyContent: "center",
    },
    billToTitle: {
      fontSize: 10,
      fontWeight: "bold",
      textTransform: "uppercase",
      color: primaryColor,
      marginBottom: 8,
      opacity: 0.8,
    },
    billToLabel: {
      fontSize: 10,
      fontWeight: "bold",
      textTransform: "uppercase",
      color: primaryColor,
      marginBottom: 8,
      opacity: 0.8,
    },
    billToName: {
      fontSize: 14,
      fontWeight: "bold",
      color: "#0f172a",
    },
    billToDetails: {
      fontSize: 10,
      color: "#475569",
      marginTop: 4,
      lineHeight: 1.4,
    },
    billToAddress: {
      fontSize: 10,
      color: "#475569",
      marginTop: 4,
      lineHeight: 1.4,
    },
    durationBadge: {
      backgroundColor: "rgba(255,255,255,0.7)",
      paddingHorizontal: 6,
      paddingVertical: 6,
      borderRadius: 12,
    },
    durationText: {
      fontSize: 10,
      fontWeight: "bold",
      color: "#334155",
    },
    vehicleCard: {
      backgroundColor: "#f8fafc", // slate-50
      padding: 15,
      borderRadius: 4,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: "#e2e8f0",
    },
    vehicleTitle: {
      fontSize: 10,
      fontWeight: "bold",
      textTransform: "uppercase",
      color: primaryColor,
      marginBottom: 10,
      opacity: 0.8,
    },
    vehicleGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 20,
    },
    vehicleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "45%",
      borderBottomWidth: 1,
      borderBottomColor: "#e2e8f0",
      paddingBottom: 4,
      marginBottom: 4,
    },
    vehicleLabel: {
      fontSize: 10,
      color: "#64748b",
      fontWeight: "medium",
    },
    vehicleValue: {
      fontSize: 10,
      fontWeight: "bold",
      color: "#1e293b",
    },
    tableContainer: {
      borderWidth: 2,
      borderColor: "#e2e8f0",
      borderRadius: 8,
      padding: 8,
      marginBottom: 8,
    },
    tableHeader: {
      flexDirection: "row",
      borderBottomWidth: 2,
      borderBottomColor: primaryColor,
      paddingBottom: 8,
      marginBottom: 0, // removed marginBottom, using padding on tableRow
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#cbd5e1", // Slightly darker to match slate-300
      paddingVertical: 8,
    },
    colDescription: {
      flex: 3,
      fontSize: 10,
      fontWeight: "bold", // Helvetica bold
      color: primaryColor,
      textTransform: "uppercase",
    },
    colHeadQty: {
      width: 60,
      textAlign: "right",
      fontSize: 10,
      fontWeight: "bold",
      color: primaryColor,
      textTransform: "uppercase",
    },
    colHeadAmount: {
      width: 100,
      textAlign: "right",
      fontSize: 10,
      fontWeight: "bold",
      color: primaryColor,
      textTransform: "uppercase",
    },
    cellDescription: {
      flex: 3,
      fontSize: 10,
      color: "#1e293b",
    },
    cellQty: {
      width: 60,
      textAlign: "right",
      fontSize: 10,
      color: "#475569",
    },
    cellAmount: {
      width: 100,
      textAlign: "right",
      fontSize: 10,
      fontWeight: "bold",
      color: "#0f172a",
    },
    totalsSection: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 14,
      marginBottom: 30,
    },
    totalsContainer: {
      width: "45%",
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    totalLabel: {
      fontSize: 10,
      fontWeight: "medium",
      color: "#64748b",
    },
    totalValue: {
      fontSize: 10,
      fontWeight: "medium",
      color: "#64748b",
    },
    grandTotalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      backgroundColor: primaryColor,
      padding: 8,
      borderRadius: 4,
      marginTop: 8,
    },
    grandTotalLabel: {
      fontSize: 12,
      fontWeight: "bold",
      color: "#ffffff",
    },
    grandTotalValue: {
      fontSize: 14,
      fontWeight: "bold",
      color: "#ffffff",
    },
    footerSection: {
      position: "absolute",
      bottom: 45,
      left: 48,
      right: 48,
    },
    notesContainer: {
      marginBottom: 20,
    },
    notesTitle: {
      fontSize: 8,
      fontWeight: "bold",
      textTransform: "uppercase",
      color: "#64748b",
      marginBottom: 5,
    },
    notesText: {
      fontSize: 10,
      color: "#475569",
      lineHeight: 1.4,
    },
    footer: {
      fontSize: 10,
      color: "#94a3b8",
      textAlign: "center",
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: "#f1f5f9",
    },
    dealerDetail: {
      fontSize: 8,
      color: "#94a3b8",
      marginTop: 2,
    },
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
};

interface InvoicePDFProps {
  settings: InvoiceSettings;
  data: InvoiceData;
}

export const InvoicePDF = ({ settings, data }: InvoicePDFProps) => {
  const styles = createStyles(settings);
  const isSettlement = data.variant === "settlement";

  // Ensure logoUrl is absolute if it's a relative path
  const getAbsoluteUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith("data:") || url.startsWith("blob:")) return url;

    if (url.startsWith("http")) {
      try {
        const u = new URL(url);
        u.pathname = u.pathname.replace(
          /^\/api(?=\/(uploads|dealer-storage|dealers|master)(\/|$))/,
          ""
        );
        return u.toString();
      } catch {
        return url;
      }
    }

    // In browser, use relative paths for uploads to leverage Next.js proxy (satisfies browser context)
    if (typeof window !== "undefined") {
      if (
        url.startsWith("/uploads/") ||
        url.startsWith("uploads/") ||
        url.startsWith("/dealer-storage/") ||
        url.startsWith("dealer-storage/") ||
        url.startsWith("/dealers/") ||
        url.startsWith("dealers/") ||
        url.startsWith("/master/") ||
        url.startsWith("master/")
      ) {
        return url.startsWith("/") ? url : `/${url}`;
      }
      return `${window.location.origin}${url.startsWith("/") ? "" : "/"}${url}`;
    }

    // Outside browser (e.g. server-side), use direct backend URL
    if (
      url.startsWith("/uploads/") ||
      url.startsWith("uploads/") ||
      url.startsWith("/dealer-storage/") ||
      url.startsWith("dealer-storage/") ||
      url.startsWith("/dealers/") ||
      url.startsWith("dealers/") ||
      url.startsWith("/master/") ||
      url.startsWith("master/")
    ) {
      const backendApi = (
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3004/api"
      ).replace(/\/+$/, "");
      let backendBase = backendApi.replace(/\/api\/?$/, "");
      try {
        backendBase = new URL(backendApi).origin;
      } catch {}
      return `${backendBase}${url.startsWith("/") ? "" : "/"}${url}`;
    }

    return url;
  };

  const absoluteLogoUrl = getAbsoluteUrl(settings.logoUrl);

  // Determine logo alignment style (default to flex-start since we use offsets)
  const logoPositionStyle: any = { alignSelf: "flex-start" };

  // Scale HTML px offsets to PDF points (~0.75 factor for A4 width 595pt vs ~794px)
  const PX_TO_PT = 0.75;
  const toPt = (px?: number) =>
    typeof px === "number" ? Math.round(px * PX_TO_PT) : 0;

  const logoOffsetStyle: any = {
    marginLeft: toPt(settings.logoOffsetX),
    marginTop: toPt(settings.logoOffsetY),
  };
  const companyInfoOffsetStyle: any = {
    marginLeft: toPt((settings as any).companyInfoOffsetX),
    marginTop: toPt((settings as any).companyInfoOffsetY),
  };
  const invoiceInfoOffsetStyle: any = {
    marginLeft: toPt(settings.invoiceInfoOffsetX),
    marginTop: toPt(settings.invoiceInfoOffsetY),
  };
  const billToOffsetStyle: any = {
    marginLeft: toPt(settings.billToOffsetX),
    marginTop: toPt(settings.billToOffsetY),
  };
  const durationOffsetStyle: any = {
    marginLeft: toPt(settings.durationOffsetX),
    marginTop: toPt(settings.durationOffsetY),
  };
  const notesOffsetStyle: any = {
    transform: [
      { translateX: toPt((settings as any).notesOffsetX) },
      { translateY: toPt((settings as any).notesOffsetY) },
    ],
  };
  const termsOffsetStyle: any = {
    transform: [
      { translateX: toPt((settings as any).termsOffsetX) },
      { translateY: toPt((settings as any).termsOffsetY) },
    ],
  };
  const footerOffsetStyle: any = {
    transform: [
      { translateX: toPt((settings as any).footerOffsetX) },
      { translateY: toPt((settings as any).footerOffsetY) },
    ],
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar} />

        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerSection}>
            <View style={styles.companyInfo}>
              {absoluteLogoUrl && (
                <Image
                  src={absoluteLogoUrl}
                  style={[styles.logo, logoPositionStyle, logoOffsetStyle]}
                  cache={false}
                />
              )}
              <View style={companyInfoOffsetStyle}>
                <Text style={[styles.companyName, logoPositionStyle]}>
                  {isSettlement ? "Drive Safe" : settings.companyName}
                </Text>
                <Text style={[styles.companyAddress, logoPositionStyle]}>
                  {isSettlement
                    ? "Your Partner in Road Safety"
                    : settings.companyAddress}
                </Text>
              </View>
            </View>

            <View style={[styles.invoiceInfo, invoiceInfoOffsetStyle]}>
              <Text style={styles.invoiceTitle}>
                {isSettlement ? "SETTLEMENT" : settings.headerText || "INVOICE"}
              </Text>
              <Text style={styles.invoiceDetail}>
                <Text style={styles.boldText}>Invoice #:</Text>{" "}
                {data.invoiceNumber}
              </Text>
              <Text style={styles.invoiceDetail}>
                <Text style={styles.boldText}>Date:</Text> {data.date}
              </Text>
              {data.dueDate && (
                <Text style={styles.invoiceDetail}>
                  <Text style={styles.boldText}>Due Date:</Text> {data.dueDate}
                </Text>
              )}
            </View>
          </View>

          {/* Bill To */}
          <View style={styles.billToCard}>
            <View style={[styles.billToContainer, billToOffsetStyle]}>
              <Text style={styles.billToLabel}>
                {isSettlement
                  ? "Dealer (Bill To):"
                  : settings.billToTitle || "Bill To:"}
              </Text>
              <Text style={styles.billToName}>{data.billToName}</Text>
              {data.billToAddress && (
                <Text style={styles.billToAddress}>{data.billToAddress}</Text>
              )}
              {data.billToEmail && (
                <Text style={styles.billToAddress}>{data.billToEmail}</Text>
              )}
            </View>
            {data.duration && (
              <View style={[styles.durationBadge, durationOffsetStyle]}>
                <Text style={styles.durationText}>
                  Plan Duration: {data.duration}
                </Text>
              </View>
            )}
          </View>

          {/* Vehicle Details */}
          {data.vehicle && (
            <View style={styles.vehicleCard}>
              <Text style={styles.vehicleTitle}>Vehicle Details</Text>
              <View style={styles.vehicleGrid}>
                <View style={styles.vehicleRow}>
                  <Text style={styles.vehicleLabel}>Vehicle</Text>
                  <Text style={styles.vehicleValue}>
                    {data.vehicle.make} {data.vehicle.model} (
                    {data.vehicle.year})
                  </Text>
                </View>
                {data.vehicle.registrationNumber && (
                  <View style={styles.vehicleRow}>
                    <Text style={styles.vehicleLabel}>Registration</Text>
                    <Text style={styles.vehicleValue}>
                      {data.vehicle.registrationNumber}
                    </Text>
                  </View>
                )}
                {data.vehicle.vin && (
                  <View style={styles.vehicleRow}>
                    <Text style={styles.vehicleLabel}>VIN</Text>
                    <Text style={styles.vehicleValue}>{data.vehicle.vin}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Items Table */}
          <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={styles.colDescription}>Description</Text>
              <Text style={styles.colHeadQty}>Qty</Text>
              <Text style={styles.colHeadAmount}>Amount</Text>
            </View>

            {/* Table Body */}
            {data.items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={{ flex: 3 }}>
                  <Text style={styles.cellDescription}>{item.description}</Text>
                  {isSettlement && item.cost && (
                    <Text style={styles.dealerDetail}>
                      Customer Price: {formatCurrency(item.amount)} | Margin:{" "}
                      {formatCurrency(item.amount - item.cost)}
                    </Text>
                  )}
                </View>
                <Text style={styles.cellQty}>{item.quantity}</Text>
                <Text style={styles.cellAmount}>
                  {formatCurrency(
                    isSettlement && item.cost !== undefined
                      ? item.cost
                      : item.amount
                  )}
                </Text>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View style={styles.totalsSection}>
            <View style={styles.totalsContainer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(data.subtotal)}
                </Text>
              </View>
              {/* <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Tax (0%)</Text>
                                <Text style={styles.totalValue}>£0.00</Text>
                            </View> */}
              <View
                style={{
                  height: 1,
                  backgroundColor: "#e2e8f0",
                  marginVertical: 4,
                }}
              />
              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>Total</Text>
                <Text style={styles.grandTotalValue}>
                  {formatCurrency(data.total)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerSection}>
          {settings.notes && (
            <View style={[styles.notesContainer, notesOffsetStyle]}>
              <Text style={styles.notesTitle}>
                {(settings as any).notesHeading || "Notes"}
              </Text>
              <Text style={styles.notesText}>{settings.notes}</Text>
            </View>
          )}
          {(settings as any).termsText && (
            <View style={[styles.notesContainer, termsOffsetStyle]}>
              <Text style={styles.notesTitle}>
                {(settings as any).termsHeading || "Terms & Conditions"}
              </Text>
              <Text style={styles.notesText}>
                {(settings as any).termsText}
              </Text>
            </View>
          )}
          <View style={[styles.footer, footerOffsetStyle]}>
            <Text>
              {isSettlement
                ? "Official Drive Safe Settlement Statement"
                : settings.footerText || "Thank you for your business!"}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
