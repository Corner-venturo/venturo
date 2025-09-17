/**
 * TypeScript 模組宣告
 * 確保所有 stores 模組可以被正確識別
 */

declare module '@/stores/globalStore' {
  export * from '../src/stores/globalStore'
  export { default } from '../src/stores/globalStore'
}

declare module '@/stores' {
  export * from '../src/stores'
}

declare module '@/lib/supabase/client' {
  export * from '../src/lib/supabase/client'
}

declare module '@/hooks/useAuth' {
  export * from '../src/hooks/useAuth'
}

declare module '@/hooks/usePermissions' {
  export * from '../src/hooks/usePermissions'
}
