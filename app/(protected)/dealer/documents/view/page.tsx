import { DealerDocumentsView } from "./dealer-documents-view";

export default function DealerViewDocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground mt-2">
          Manage your documents and view customer uploads
        </p>
      </div>
      <DealerDocumentsView />
    </div>
  );
}
