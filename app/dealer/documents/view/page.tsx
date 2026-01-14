import { DealerDocumentsView } from "./dealer-documents-view";

export default function DealerViewDocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">View Documents</h1>
        <p className="text-muted-foreground mt-2">
          View all documents you've uploaded for your customers
        </p>
      </div>
      <DealerDocumentsView />
    </div>
  );
}
