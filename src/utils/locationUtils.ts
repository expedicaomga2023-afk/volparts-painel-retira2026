export function sortLocations(locations: string[]): string[] {
  return [...locations].sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true }));
}
