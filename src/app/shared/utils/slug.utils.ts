/**
 * Utilidades para generación y comparación de URLs amigables (slugs)
 */
export function slugify(text?: string | null): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar tildes y diacríticos
    .replace(/[^a-z0-9\s-]/g, '') // Eliminar caracteres especiales
    .trim()
    .replace(/[\s_-]+/g, '-') // Espacios y guiones bajos a guiones medios
    .replace(/^-+|-+$/g, ''); // Eliminar guiones al inicio o fin
}

export function matchSlug(text?: string | null, targetSlug?: string | null): boolean {
  if (!text || !targetSlug) return false;
  return slugify(text) === targetSlug.toLowerCase().trim();
}
