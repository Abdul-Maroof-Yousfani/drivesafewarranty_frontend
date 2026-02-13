"use client";

import { useState, useEffect } from "react";
import { getMyDocumentsAction, CustomerDocument } from "@/lib/actions/customer-documents";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
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
  Loader2,
  Calendar,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export function CustomerDocumentsView() {
  const [documents, setDocuments] = useState<CustomerDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth(); // We need the customer's ID from session

  useEffect(() => {
    const fetchDocs = async () => {
      setIsLoading(true);
      const res = await getMyDocumentsAction();
      if (res.status && res.data) {
        setDocuments(res.data);
      } else {
        toast.error(res.message || "Failed to load documents");
      }
      setIsLoading(false);
    };

    fetchDocs();
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0">
        <CardTitle className="text-2xl">My Documents</CardTitle>
        <CardDescription>
          Access all your warranty and policy related documents here.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {documents.length > 0 ? (
          <div className="rounded-xl border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Document Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold">{doc.name}</p>
                          {doc.description && (
                            <p className="text-xs text-muted-foreground font-normal line-clamp-1">
                              {doc.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground uppercase">
                        {doc.file.mimetype.split("/")[1]}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatFileSize(doc.file.size)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-4">
                      <Button asChild size="sm" variant="outline" className="gap-2">
                        <a href={doc.file.url} download={doc.name} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                          Download
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-16 bg-card rounded-2xl border border-dashed shadow-sm">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <FileText className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No documents found</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-8">
              There are currently no documents shared with you. Please contact your dealer if you are expecting any files.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
