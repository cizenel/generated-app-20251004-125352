import { create } from 'zustand';
import { Document } from '@shared/types';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { t } from '@/lib/i18n';
type DocumentState = {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  fetchDocuments: () => Promise<void>;
  addDocument: (document: { name: string; category: 'Archive' | 'Training'; path: string }) => Promise<Document | undefined>;
  deleteDocument: (docId: string) => Promise<void>;
};
export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],
  isLoading: false,
  error: null,
  fetchDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api<{ items: Document[] }>('/api/documents');
      set({ documents: data.items.sort((a, b) => b.createdAt - a.createdAt), isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch documents';
      set({ error: errorMessage, isLoading: false });
      toast.error("Dökümanlar getirilirken bir hata oluştu.");
    }
  },
  addDocument: async (documentData) => {
    set({ isLoading: true });
    try {
      const newDocument = await api<Document>('/api/documents', {
        method: 'POST',
        body: JSON.stringify(documentData),
      });
      set((state) => ({
        documents: [newDocument, ...state.documents],
        isLoading: false,
      }));
      toast.success(t.documentUploadSuccess);
      return newDocument;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t.documentUploadError;
      set({ error: errorMessage, isLoading: false });
      toast.error(`${t.documentUploadError}: ${errorMessage}`);
      return undefined;
    }
  },
  deleteDocument: async (docId) => {
    set({ isLoading: true });
    try {
      await api(`/api/documents/${docId}`, {
        method: 'DELETE',
      });
      set((state) => ({
        documents: state.documents.filter((d) => d.id !== docId),
        isLoading: false,
      }));
      toast.success(t.documentDeleteSuccess);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t.documentDeleteError;
      set({ error: errorMessage, isLoading: false });
      toast.error(`${t.documentDeleteError}: ${errorMessage}`);
    }
  },
}));