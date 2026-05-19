// Path: @/vite-env.d.ts

declare module "*.png" { const src: string; export default src; }
declare module "*.jpg" { const src: string; export default src; }
declare module "*.jpeg" { const src: string; export default src; }
declare module "*.webp" { const src: string; export default src; }
declare module "*.gif" { const src: string; export default src; }
declare module "*.svg" { const src: string; export default src; }
declare module "*.ttf" { const src: string; export default src; }
declare module "*.woff" { const src: string; export default src; }
declare module "*.woff2" { const src: string; export default src; }

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_INVITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
