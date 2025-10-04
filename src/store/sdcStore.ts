import { create } from 'zustand';
import { SdcRecord } from '@shared/types';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { t } from '@/lib/i18n';
type SdcState = {
  records: SdcRecord[];
  isLoading: boolean;
  error: string | null;
  fetchRecords: () => Promise<void>;
  addRecord: (record: Omit<SdcRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<SdcRecord | undefined>;
  updateRecord: (recordId: string, record: Partial<SdcRecord>) => Promise<SdcRecord | undefined>;
  deleteRecord: (recordId: string) => Promise<void>;
};
export const useSdcStore = create<SdcState>((set) => ({
  records: [],
  isLoading: false,
  error: null,
  fetchRecords: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api<{ items: SdcRecord[] }>('/api/sdc');
      set({ records: data.items.sort((a, b) => b.createdAt - a.createdAt), isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch SDC records';
      set({ error: errorMessage, isLoading: false });
      toast.error(t.fetchSdcError);
    }
  },
  addRecord: async (recordData) => {
    set({ isLoading: true });
    try {
      const newRecord = await api<SdcRecord>('/api/sdc', {
        method: 'POST',
        body: JSON.stringify(recordData),
      });
      set((state) => ({
        records: [newRecord, ...state.records],
        isLoading: false,
      }));
      toast.success(t.sdcAddedSuccess);
      return newRecord;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add SDC record';
      set({ error: errorMessage, isLoading: false });
      toast.error(t.sdcAddedError + `: ${errorMessage}`);
      return undefined;
    }
  },
  updateRecord: async (recordId, recordData) => {
    set({ isLoading: true });
    try {
      const updatedRecord = await api<SdcRecord>(`/api/sdc/${recordId}`, {
        method: 'PUT',
        body: JSON.stringify(recordData),
      });
      set((state) => ({
        records: state.records.map((r) => (r.id === recordId ? updatedRecord : r)),
        isLoading: false,
      }));
      toast.success(t.sdcUpdatedSuccess);
      return updatedRecord;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update SDC record';
      set({ error: errorMessage, isLoading: false });
      toast.error(t.sdcUpdatedError + `: ${errorMessage}`);
      return undefined;
    }
  },
  deleteRecord: async (recordId) => {
    set({ isLoading: true });
    try {
      await api(`/api/sdc/${recordId}`, {
        method: 'DELETE',
      });
      set((state) => ({
        records: state.records.filter((r) => r.id !== recordId),
        isLoading: false,
      }));
      toast.success(t.sdcDeletedSuccess);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete SDC record';
      set({ error: errorMessage, isLoading: false });
      toast.error(t.sdcDeletedError + `: ${errorMessage}`);
    }
  },
}));