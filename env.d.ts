/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // se tiver outras variáveis, adicione aqui
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
