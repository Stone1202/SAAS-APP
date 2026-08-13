import { create } from 'zustand';
import { communicationService, scriptService, aiSuggestionService } from '../services/tenant-service';
import type { CommunicationRecord, Script, AiScriptSuggestion } from '../contracts/schemas';

interface CommunicationState {
  records: CommunicationRecord[];
  scripts: Script[];
  aiSuggestions: AiScriptSuggestion[];
  loading: boolean;
  error: string | null;
  loadRecords: () => Promise<void>;
  loadScripts: () => Promise<void>;
  loadAiSuggestions: () => Promise<void>;
  createRecord: (data: any) => Promise<void>;
  createScript: (data: any) => Promise<void>;
  adoptSuggestion: (id: string) => Promise<void>;
}

export const useCommunicationStore = create<CommunicationState>((set) => ({
  records: [],
  scripts: [],
  aiSuggestions: [],
  loading: false,
  error: null,

  loadRecords: async () => {
    set({ loading: true, error: null });
    try {
      const records = await communicationService.getAll();
      set({ records, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  loadScripts: async () => {
    try {
      const scripts = await scriptService.getAll();
      set({ scripts });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  loadAiSuggestions: async () => {
    try {
      const aiSuggestions = await aiSuggestionService.getAll();
      set({ aiSuggestions });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  createRecord: async (data) => {
    const record = await communicationService.create(data);
    set((s) => ({ records: [record, ...s.records] }));
  },

  createScript: async (data) => {
    const script = await scriptService.create(data);
    set((s) => ({ scripts: [...s.scripts, script] }));
  },

  adoptSuggestion: async (id) => {
    const updated = await aiSuggestionService.adopt(id);
    set((s) => ({
      aiSuggestions: s.aiSuggestions.map((a) => (a.id === id ? updated : a)),
    }));
  },
}));
