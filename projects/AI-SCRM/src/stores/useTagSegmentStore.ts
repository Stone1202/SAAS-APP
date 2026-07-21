import { create } from 'zustand';
import { tagService, segmentService } from '../services/tenant-service';
import type { Tag, TagGroup, Segment } from '../contracts/schemas';

interface TagSegmentState {
  tagGroups: TagGroup[];
  tags: Tag[];
  segments: Segment[];
  loading: boolean;
  loadAll: () => Promise<void>;
  createGroup: (data: any) => Promise<void>;
  createTag: (data: any) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  createSegment: (data: any) => Promise<void>;
}

export const useTagSegmentStore = create<TagSegmentState>((set) => ({
  tagGroups: [],
  tags: [],
  segments: [],
  loading: false,

  loadAll: async () => {
    set({ loading: true });
    try {
      const [tagGroups, tags, segments] = await Promise.all([
        tagService.getAllGroups(),
        tagService.getAllTags(),
        segmentService.getAll(),
      ]);
      set({ tagGroups, tags, segments, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createGroup: async (data) => {
    const group = await tagService.createGroup(data);
    set((s) => ({ tagGroups: [...s.tagGroups, group] }));
  },

  createTag: async (data) => {
    const tag = await tagService.createTag(data);
    set((s) => ({ tags: [...s.tags, tag] }));
  },

  deleteTag: async (id) => {
    await tagService.deleteTag(id);
    set((s) => ({ tags: s.tags.filter((t) => t.id !== id) }));
  },

  createSegment: async (data) => {
    const segment = await segmentService.create(data);
    set((s) => ({ segments: [...s.segments, segment] }));
  },
}));
