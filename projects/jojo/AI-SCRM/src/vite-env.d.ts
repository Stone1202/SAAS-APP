/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MODE: 'sim' | 'real';
  readonly VITE_MODE_OVERRIDE_ORDER?: string;
  readonly VITE_MODE_OVERRIDE_PRODUCT?: string;
  readonly VITE_MODE_OVERRIDE_CUSTOMER?: string;
  readonly VITE_MODE_OVERRIDE_LIVE?: string;
  readonly VITE_MODE_OVERRIDE_MESSAGE?: string;
  readonly VITE_MODE_OVERRIDE_NOTIFICATION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
