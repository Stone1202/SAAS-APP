import { create } from 'zustand';
import { todoService } from '../services/tenant-service';
import type { Todo } from '../contracts/schemas';

interface TodoState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  loadAll: (filters?: { status?: string; type?: string }) => Promise<void>;
  complete: (id: string) => Promise<void>;
  create: (data: any) => Promise<void>;
}

export const useTodoStore = create<TodoState>((set) => ({
  todos: [],
  loading: false,
  error: null,

  loadAll: async (filters) => {
    set({ loading: true, error: null });
    try {
      const todos = await todoService.getAll(filters);
      set({ todos, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  complete: async (id) => {
    const updated = await todoService.complete(id);
    set((s) => ({
      todos: s.todos.map((t) => (t.id === id ? updated : t)),
    }));
  },

  create: async (data) => {
    const todo = await todoService.create(data);
    set((s) => ({ todos: [todo, ...s.todos] }));
  },
}));
