import { useAppSelector } from "@/store/hooks";

export function useTenantTheme() {
  return useAppSelector((s) => s.theme);
}
