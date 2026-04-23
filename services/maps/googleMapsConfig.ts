export const GOOGLE_MAPS_API_KEY: string =
  (typeof import.meta !== 'undefined' && (import.meta as ImportMeta).env?.VITE_GOOGLE_MAPS_API_KEY) || '';

export const mapsEnabled = (): boolean => Boolean(GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY.length > 8);
