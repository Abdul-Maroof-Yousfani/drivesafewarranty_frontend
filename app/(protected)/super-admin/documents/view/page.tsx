import { SuperAdminDocumentsView } from "./super-admin-documents-view";

export default function ViewDocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground mt-2">
          Manage all dealer and customer documents
        </p>
      </div>
      <SuperAdminDocumentsView />
    </div>
  );
}
