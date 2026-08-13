/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_MODE: 'sim' | 'real'
  readonly VITE_MODE_OVERRIDE_AUDIT?: 'sim' | 'real'
  readonly VITE_TENCENT_CALLBACK_URL?: string
  readonly VITE_TENCENT_AMS_API?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
