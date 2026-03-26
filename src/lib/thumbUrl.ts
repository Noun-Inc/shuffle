/**
 * Convert a full-res image URL to its compressed thumbnail URL.
 * /images/image42.png → /thumbs/image42.jpg
 */
export function thumbUrl(originalUrl: string): string {
  if (!originalUrl) return originalUrl;
  // Replace /images/ with /thumbs/ and change extension to .jpg
  return originalUrl
    .replace(/^\/images\//, "/thumbs/")
    .replace(/\.(png|jpg|jpeg|webp)$/i, ".jpg");
}
