/** Domínio base usado dentro do QR Code. */
export function useShortUrlBase(): string {
  const { siteUrl } = useRuntimeConfig().public
  const base = (siteUrl as string) || useRequestURL().origin
  return base.replace(/\/+$/, '')
}
