/**
 * usePrototypeMermaid — 原型总览页 Mermaid 渲染
 *
 * v3.1.39 新增：动态渲染流程图/状态机。
 */
import { ref, onMounted } from 'vue';

let mermaidModule: typeof import('mermaid') | null = null;

export function usePrototypeMermaid() {
  const rendered = ref<Record<string, string>>({});
  const loading = ref(false);
  const error = ref<string>('');

  async function ensureMermaid() {
    if (mermaidModule) return mermaidModule;
    mermaidModule = await import('mermaid');
    mermaidModule.default.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    });
    return mermaidModule;
  }

  async function renderAll(sources: { key: string; code: string; type: 'flowchart' | 'stateDiagram' }[]) {
    loading.value = true;
    error.value = '';
    try {
      const m = await ensureMermaid();
      const out: Record<string, string> = {};
      for (const item of sources) {
        try {
          const id = `mermaid-${item.key}-${Date.now()}`;
          const result = await m.default.render(id, item.code);
          out[item.key] = result.svg;
        } catch (e: any) {
          out[item.key] = `<div class="mermaid-error">渲染失败：${e?.message || String(e)}</div>`;
        }
      }
      rendered.value = out;
    } catch (e: any) {
      error.value = e?.message || String(e);
    } finally {
      loading.value = false;
    }
  }

  onMounted(() => {
    // 首次挂载时预加载 mermaid
    ensureMermaid();
  });

  return {
    rendered,
    loading,
    error,
    renderAll,
    ensureMermaid,
  };
}
