"use client";

import { useState, useEffect } from "react";
import { 
  getCustomerDocumentsAction, 
  createCustomerDocumentAction, 
  deleteCustomerDocumentAction,
  CustomerDocument 
} from "@/lib/actions/customer-documents";
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
  Upload, 
  Download, 
  Trash2, 
  Loader2,
  Plus,
  X
} from "lucide-react";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadFileAction } from "@/lib/actions/upload";

interface DocumentsTabProps {
  customerId: string;
}

export function DocumentsTab({ customerId }: DocumentsTabProps) {
  const [documents, setDocuments] = useState<CustomerDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [docName, setDocName] = useState("");
  const [docDesc, setDocDesc] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    const res = await getCustomerDocumentsAction(customerId);
    if (res.status && res.data) {
      setDocuments(res.data);
    } else {
      toast.error(res.message || "Failed to load documents");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, [customerId]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !docName) {
      toast.error("Please provide document name and select a file");
      return;
    }

    setIsUploading(true);
    try {
      // 1. Upload the physical file
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("category", "documents");

      const uploadRes = await uploadFileAction(formData);
      if (!uploadRes.status || !uploadRes.data) {
        throw new Error(uploadRes.message || "File upload failed");
      }

      // 2. Create the document record
      const createRes = await createCustomerDocumentAction(customerId, {
        name: docName,
        description: docDesc,
        fileId: uploadRes.data.id,
      });

      if (createRes.status) {
        toast.success("Document uploaded successfully");
        setIsDialogOpen(false);
        setDocName("");
        setDocDesc("");
        setSelectedFile(null);
        fetchDocuments();
      } else {
        throw new Error(createRes.message || "Failed to create document record");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

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
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Documents</CardTitle>
          <CardDescription>Manage files and documents for this customer</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleUpload}>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>
                  Upload a new file for this customer. It will be stored in your dealer storage.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Document Name</Label>
                  <Input 
                    id="name" 
                    value={docName} 
                    onChange={(e) => setDocName(e.target.value)} 
                    placeholder="e.g. ID Proof, Policy Document"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea 
                    id="description" 
                    value={docDesc} 
                    onChange={(e) => setDocDesc(e.target.value)} 
                    placeholder="Brief details about the document"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="file">File (Image or PDF)</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      id="file" 
                      type="file" 
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="cursor-pointer"
                      required
                    />
                    {selectedFile && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setSelectedFile(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {selectedFile && (
                    <p className="text-xs text-muted-foreground">
                      Size: {formatFileSize(selectedFile.size)}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isUploading || !selectedFile || !docName}>
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {documents.length > 0 ? (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <div>
                          <p>{doc.name}</p>
                          {doc.description && (
                            <p className="text-xs text-muted-foreground font-normal">
                              {doc.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="uppercase text-xs font-semibold text-muted-foreground">
                      {doc.file.mimetype.split("/")[1]}
                    </TableCell>
                    <TableCell>{formatFileSize(doc.file.size)}</TableCell>
                    <TableCell>
                      {doc.createdBy ? (
                        <div className="text-xs">
                          <p className="font-medium">{doc.createdBy.firstName} {doc.createdBy.lastName}</p>
                          <p className="text-muted-foreground">{doc.createdBy.email}</p>
                        </div>
                      ) : "System"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          asChild
                          title="Download"
                        >
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
            <p className="text-muted-foreground font-medium">No documents yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Upload documents like ID proofs, vehicle photos, or policy documents.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
