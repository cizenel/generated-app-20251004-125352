import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { t } from "@/lib/i18n";
import { FileText, Archive, GraduationCap, Upload, Trash2 } from "lucide-react";
import { useDocumentStore } from "@/store/documentStore";
import { useAuthStore } from "@/store/authStore";
import { Document } from "@shared/types";
import { DocumentUploadDialog, DocumentFormValues } from "@/components/documents/DocumentUploadDialog";
import { DeleteDocumentDialog } from "@/components/documents/DeleteDocumentDialog";
export function DocumentsPage() {
  const { documents, fetchDocuments, addDocument, deleteDocument, isLoading } = useDocumentStore();
  const { user } = useAuthStore();
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);
  const isAdmin = user?.role === 'L2' || user?.role === 'L3';
  const { archiveFiles, trainingFiles } = useMemo(() => {
    const archive = documents.filter(d => d.category === 'Archive');
    const training = documents.filter(d => d.category === 'Training');
    return { archiveFiles: archive, trainingFiles: training };
  }, [documents]);
  const handleUploadSubmit = async (values: DocumentFormValues) => {
    const path = `/docs/${values.category.toLowerCase()}/${values.fileName}`;
    await addDocument({ name: values.fileName, category: values.category, path });
    setUploadOpen(false);
  };
  const handleDeleteClick = (doc: Document) => {
    setSelectedDoc(doc);
    setDeleteOpen(true);
  };
  const handleDeleteConfirm = async () => {
    if (selectedDoc) {
      await deleteDocument(selectedDoc.id);
    }
    setDeleteOpen(false);
    setSelectedDoc(null);
  };
  const renderFileList = (files: Document[]) => (
    <ul className="space-y-3">
      {files.map((file) => (
        <li key={file.id} className="flex items-center justify-between group">
          <a
            href={file.path}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-3 -m-3 rounded-lg hover:bg-muted transition-colors duration-200 flex-grow"
          >
            <FileText className="h-5 w-5 mr-3 text-muted-foreground group-hover:text-primary" />
            <span className="font-medium text-gray-700 group-hover:text-primary">{file.name}</span>
          </a>
          {isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
              onClick={() => handleDeleteClick(file)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </li>
      ))}
      {files.length === 0 && !isLoading && (
        <p className="text-sm text-muted-foreground text-center py-4">{t.noDocumentsFound}</p>
      )}
    </ul>
  );
  const renderSkeleton = () => (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-2/3" />
    </div>
  );
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">{t.documents}</h1>
        {isAdmin && (
          <Button onClick={() => setUploadOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            {t.uploadDocument}
          </Button>
        )}
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Archive className="h-6 w-6 text-primary" />
            <CardTitle>{t.archive}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? renderSkeleton() : renderFileList(archiveFiles)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <GraduationCap className="h-6 w-6 text-primary" />
            <CardTitle>{t.training}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? renderSkeleton() : renderFileList(trainingFiles)}
          </CardContent>
        </Card>
      </div>
      {isAdmin && (
        <>
          <DocumentUploadDialog
            isOpen={isUploadOpen}
            onClose={() => setUploadOpen(false)}
            onSubmit={handleUploadSubmit}
            isLoading={isLoading}
          />
          <DeleteDocumentDialog
            document={selectedDoc}
            isOpen={isDeleteOpen}
            onClose={() => setDeleteOpen(false)}
            onConfirm={handleDeleteConfirm}
          />
        </>
      )}
    </div>
  );
}