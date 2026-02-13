"use client";

import { useState, useEffect, useRef } from "react";
import { getMyDealerDocumentsAction, createDealerDocumentAction, deleteDealerDocumentAction } from "@/lib/actions/dealer-documents";
import { format } from "date-fns";
import { getDealerCustomersAction } from "@/lib/actions/dealer-customer";
import { getDealerDocumentsAction, deleteCustomerDocumentAction } from "@/lib/actions/customer-documents";
import { uploadFileAction } from "@/lib/actions/upload";
import { useDealerStatus } from "@/lib/hooks/use-dealer-status";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  FileText, 
  Download, 
  Trash2, 
  Loader2,
  Search,
  Upload,
  Plus,
  Eye,
  User,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";

export function DealerDocumentsView() {
  const { isInactive, loading: statusLoading } = useDealerStatus();
  const [dealerDocs, setDealerDocs] = useState<any[]>([]);
  const [customerDocs, setCustomerDocs] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedFilterCustomerId, setSelectedFilterCustomerId] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("dealer");

  // Upload dialog state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [docName, setDocName] = useState("");
  const [docDesc, setDocDesc] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    const [dealerRes, customerRes, customerListRes] = await Promise.all([
      getMyDealerDocumentsAction(),
      getDealerDocumentsAction(),
      getDealerCustomersAction(),
    ]);
    if (dealerRes.status && dealerRes.data) setDealerDocs(dealerRes.data);
    if (customerRes.status && customerRes.data) setCustomerDocs(customerRes.data);
    if (customerListRes.status && customerListRes.data) setCustomers(customerListRes.data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async () => {
    if (!selectedFile || !docName.trim()) {
      toast.error("Please provide a document name and select a file.");
      return;
    }
    setUploading(true);
    try {
      // Step 1: Upload the file
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("category", "documents");

      const uploadRes = await uploadFileAction(formData);
      if (!uploadRes.status || !uploadRes.data?.id) {
        toast.error(uploadRes.message || "File upload failed");
        setUploading(false);
        return;
      }

      // Step 2: Create the dealer document record
      const createRes = await createDealerDocumentAction("mine", {
        name: docName.trim(),
        description: docDesc.trim() || undefined,
        fileId: uploadRes.data.id,
      });

      if (createRes.status) {
        toast.success("Document uploaded successfully!");
        setUploadOpen(false);
        setDocName("");
        setDocDesc("");
        setSelectedFile(null);
        fetchDocuments();
      } else {
        toast.error(createRes.message || "Failed to save document");
      }
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    }
    setUploading(false);
  };

  const handleDeleteDealerDoc = async (id: string) => {
    const res = await deleteDealerDocumentAction(id);
    if (res.status) {
      toast.success("Document deleted");
      setDealerDocs(docs => docs.filter(d => d.id !== id));
    } else {
      toast.error(res.message || "Failed to delete");
    }
  };

  const handleDeleteCustomerDoc = async (id: string) => {
    const res = await deleteCustomerDocumentAction(id);
    if (res.status) {
      toast.success("Document deleted");
      setCustomerDocs(docs => docs.filter(d => d.id !== id));
    } else {
      toast.error(res.message || "Failed to delete");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const filteredDealerDocs = dealerDocs.filter(doc =>
    !searchTerm || doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomerDocs = customerDocs.filter(doc => {
    const matchesSearch = !searchTerm || 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.customer && `${doc.customer.firstName} ${doc.customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCustomer = selectedFilterCustomerId === "all" || doc.customerId === selectedFilterCustomerId;
    
    return matchesSearch && matchesCustomer;
  });

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
            placeholder="Search documents..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Dialog open={uploadOpen} onOpenChange={!isInactive && !statusLoading ? setUploadOpen : undefined}>
          <DialogTrigger asChild>
            <Button disabled={isInactive || statusLoading}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                Upload a new document to your dealer portal.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="doc-name">Document Name *</Label>
                <Input
                  id="doc-name"
                  placeholder="Enter document name"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doc-desc">Description</Label>
                <Textarea
                  id="doc-desc"
                  placeholder="Optional description"
                  value={docDesc}
                  onChange={(e) => setDocDesc(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>File *</Label>
                <div
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">{selectedFile.name}</span>
                      <span className="text-xs text-muted-foreground">({formatFileSize(selectedFile.size)})</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to select a file</p>
                      <p className="text-xs text-muted-foreground">PDF, DOC, DOCX, XLS, XLSX, Images</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadOpen(false)} disabled={uploading}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={uploading || !docName.trim() || !selectedFile}>
                {uploading ? (
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
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dealer">
            <FolderOpen className="h-4 w-4 mr-2" />
            My Documents ({dealerDocs.length})
          </TabsTrigger>
          <TabsTrigger value="customer">
            <User className="h-4 w-4 mr-2" />
            Customer Documents ({customerDocs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dealer">
          <Card>
            <CardContent className="p-0">
              {filteredDealerDocs.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document</TableHead>
                        <TableHead>Uploaded By</TableHead>
                        <TableHead>Date Added</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDealerDocs.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" />
                              <div>
                                <p className="font-medium">{doc.name}</p>
                                {doc.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-1">{doc.description}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                  {doc.file?.mimetype?.split("/")[1]?.toUpperCase() || "FILE"} • {formatFileSize(doc.file?.size || 0)}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {doc.uploadedBy ? `${doc.uploadedBy.firstName} ${doc.uploadedBy.lastName}` : "N/A"}
                          </TableCell>
                          <TableCell className="text-xs" suppressHydrationWarning>
                            {format(new Date(doc.createdAt), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" asChild title="View">
                                <a href={doc.file?.url} target="_blank" rel="noopener noreferrer">
                                  <Eye className="h-4 w-4" />
                                </a>
                              </Button>
                              <Button variant="ghost" size="icon" asChild title="Download">
                                <a href={doc.file?.url} download={doc.name} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10" 
                                    title="Delete"
                                    disabled={isInactive || statusLoading}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Document</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete &quot;{doc.name}&quot;? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteDealerDoc(doc.id)} className="bg-destructive hover:bg-destructive/90">
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 bg-muted/30 rounded-lg border border-dashed">
                  <FolderOpen className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                  <p className="text-muted-foreground font-medium">No documents uploaded yet</p>
                  <Button variant="link" className="mt-2" onClick={() => setUploadOpen(true)}>
                    Upload your first document
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customer">
          <Card>
            <CardContent className="p-0">
              <div className="p-4 border-b flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1 max-w-xs">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <Select 
                    value={selectedFilterCustomerId} 
                    onValueChange={setSelectedFilterCustomerId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Customers</SelectItem>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.firstName} {c.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedFilterCustomerId !== "all" && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedFilterCustomerId("all")}
                    className="text-xs"
                  >
                    Clear Filter
                  </Button>
                )}
              </div>
              {filteredCustomerDocs.length > 0 ? (
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
                      {filteredCustomerDocs.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" />
                              <div>
                                <p className="font-medium">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {doc.file?.mimetype?.split("/")[1]?.toUpperCase() || "FILE"} • {formatFileSize(doc.file?.size || 0)}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {doc.customer ? (
                              <div className="flex flex-col">
                                <button 
                                  onClick={() => setSelectedFilterCustomerId(doc.customerId)}
                                  className="text-sm hover:text-primary transition-colors text-left font-medium"
                                  title="Filter by this customer"
                                >
                                  {doc.customer.firstName} {doc.customer.lastName}
                                </button>
                                <Link
                                  href={`/dealer/customers/view/${doc.customerId}`}
                                  className="text-[10px] text-muted-foreground hover:underline"
                                >
                                  View Profile
                                </Link>
                              </div>
                            ) : "N/A"}
                          </TableCell>
                          <TableCell className="text-xs" suppressHydrationWarning>
                            {format(new Date(doc.createdAt), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" asChild title="View">
                                <a href={doc.file?.url} target="_blank" rel="noopener noreferrer">
                                  <Eye className="h-4 w-4" />
                                </a>
                              </Button>
                              <Button variant="ghost" size="icon" asChild title="Download">
                                <a href={doc.file?.url} download={doc.name} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10" 
                                    title="Delete"
                                    disabled={isInactive}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Document</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete &quot;{doc.name}&quot;? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteCustomerDoc(doc.id)} className="bg-destructive hover:bg-destructive/90">
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
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
                  <p className="text-muted-foreground font-medium">No customer documents found</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link href="/dealer/customers/list">Go to Customer List to upload</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
