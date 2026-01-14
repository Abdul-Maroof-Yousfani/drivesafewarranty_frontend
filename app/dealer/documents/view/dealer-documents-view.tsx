"use client";

import { useState, useEffect } from "react";
import { getDealerDocumentsAction, deleteCustomerDocumentAction } from "@/lib/actions/customer-documents";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  FileText, 
  Download, 
  Trash2, 
  Loader2,
  Search,
  User,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export function DealerDocumentsView() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDocuments = async () => {
    setIsLoading(true);
    const res = await getDealerDocumentsAction();
    if (res.status && res.data) {
      setDocuments(res.data);
      setFilteredDocs(res.data);
    } else {
      toast.error(res.message || "Failed to load documents");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredDocs(documents);
      return;
    }

    const lowerSearch = searchTerm.toLowerCase();
    const filtered = documents.filter(doc => 
      doc.name.toLowerCase().includes(lowerSearch) ||
      (doc.customer && `${doc.customer.firstName} ${doc.customer.lastName}`.toLowerCase().includes(lowerSearch))
    );
    setFilteredDocs(filtered);
  }, [searchTerm, documents]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    const res = await deleteCustomerDocumentAction(id);
    if (res.status) {
      toast.success("Document deleted");
      setDocuments(docs => docs.filter(d => d.id !== id));
    } else {
      toast.error(res.message || "Failed to delete document");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or customer..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
          Note: To upload new documents, visit a customer's profile.
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredDocs.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocs.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.file.mimetype.split("/")[1].toUpperCase()} • {formatFileSize(doc.file.size)}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {doc.customer ? (
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <Link 
                                href={`/dealer/customers/view/${doc.customer.id}`}
                                className="text-sm hover:underline text-primary"
                            >
                              {doc.customer.firstName} {doc.customer.lastName}
                            </Link>
                          </div>
                        ) : "N/A"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild title="Download">
                            <a href={doc.file.url} download={doc.name} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(doc.id, doc.name)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 bg-muted/30 rounded-lg border border-dashed">
              <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
              <p className="text-muted-foreground font-medium">No documents found</p>
              <Button variant="link" asChild className="mt-2">
                <Link href="/dealer/customers/list">Go to Customer List to upload</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
