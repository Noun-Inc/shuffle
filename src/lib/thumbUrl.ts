/**
 * Convert a full-res image URL to its compressed thumbnail URL.
 * Handles both local paths and Supabase Storage URLs.
 *
 * Local: /images/image42.png → /thumbs/image42.jpg
 * Supabase: .../signal-images/full/image42.png → .../signal-images/thumbs/image42.jpg
 */
export function thumbUrl(originalUrl: string, explicitThumbUrl?: string): string {
  // If an explicit thumb URL is provided, use it
  if (explicitThumbUrl) return explicitThumbUrl;
  if (!originalUrl) return originalUrl;

  // Supabase Storage URL
  if (originalUrl.includes("signal-images/full/")) {
    return originalUrl
      .replace("/full/", "/thumbs/")
      .replace(/\.(png|webp)$/i, ".jpg");
  }

  // Legacy local path
  return originalUrl
    .replace(/^\/images\//, "/thumbs/")
    .replace(/\.(png|jpg|jpeg|webp)$/i, ".jpg");
}
