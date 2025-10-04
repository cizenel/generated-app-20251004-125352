import { create } from 'zustand';
import { Definition, DefinitionType } from '@shared/types';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { t } from '@/lib/i18n';
type DefinitionState = {
  definitions: Record<DefinitionType, Definition[]>;
  isLoading: boolean;
  error: string | null;
  fetchDefinitions: (type: DefinitionType) => Promise<void>;
  addDefinition: (type: DefinitionType, definition: { name: string }) => Promise<Definition | undefined>;
  updateDefinition: (type: DefinitionType, defId: string, definition: { name: string }) => Promise<Definition | undefined>;
  deleteDefinition: (type: DefinitionType, defId: string) => Promise<void>;
};
export const useDefinitionStore = create<DefinitionState>((set, get) => ({
  definitions: {
    Sponsor: [],
    Center: [],
    Investigator: [],
    ProjectCode: [],
    WorkDone: [],
  },
  isLoading: false,
  error: null,
  fetchDefinitions: async (type) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api<{ items: Definition[] }>(`/api/definitions/${type}`);
      set((state) => ({
        definitions: { ...state.definitions, [type]: data.items },
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to fetch ${type}`;
      set({ error: errorMessage, isLoading: false });
      toast.error(t.fetchDefinitionsError(type));
    }
  },
  addDefinition: async (type, definitionData) => {
    set({ isLoading: true });
    try {
      const newDefinition = await api<Definition>(`/api/definitions/${type}`, {
        method: 'POST',
        body: JSON.stringify(definitionData),
      });
      set((state) => ({
        definitions: {
          ...state.definitions,
          [type]: [...state.definitions[type], newDefinition],
        },
        isLoading: false,
      }));
      toast.success(t.definitionAddedSuccess(type));
      return newDefinition;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to add ${type}`;
      set({ error: errorMessage, isLoading: false });
      toast.error(t.definitionAddedError(type) + `: ${errorMessage}`);
      return undefined;
    }
  },
  updateDefinition: async (type, defId, definitionData) => {
    set({ isLoading: true });
    try {
      const updatedDefinition = await api<Definition>(`/api/definitions/${type}/${defId}`, {
        method: 'PUT',
        body: JSON.stringify(definitionData),
      });
      set((state) => ({
        definitions: {
          ...state.definitions,
          [type]: state.definitions[type].map((d) => (d.id === defId ? updatedDefinition : d)),
        },
        isLoading: false,
      }));
      toast.success(t.definitionUpdatedSuccess(type));
      return updatedDefinition;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to update ${type}`;
      set({ error: errorMessage, isLoading: false });
      toast.error(t.definitionUpdatedError(type) + `: ${errorMessage}`);
      return undefined;
    }
  },
  deleteDefinition: async (type, defId) => {
    set({ isLoading: true });
    try {
      await api(`/api/definitions/${type}/${defId}`, {
        method: 'DELETE',
      });
      set((state) => ({
        definitions: {
          ...state.definitions,
          [type]: state.definitions[type].filter((d) => d.id !== defId),
        },
        isLoading: false,
      }));
      toast.success(t.definitionDeletedSuccess(type));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to delete ${type}`;
      set({ error: errorMessage, isLoading: false });
      toast.error(t.definitionDeletedError(type) + `: ${errorMessage}`);
    }
  },
}));