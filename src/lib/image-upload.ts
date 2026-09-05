// Leave room for multipart headers below Vercel's 4.5 MB request limit.
export const maximumImageSize = 4 * 1024 * 1024;
const allowedImageTypes = new Set(["image/png", "image/jpeg", "image/webp"]);

export function imageUploadError(size: number, contentType: string): string | null {
  if (!allowedImageTypes.has(contentType)) return "Only PNG, JPEG, and WebP images are allowed.";
  if (size === 0) return "Choose an image file to upload.";
  if (size > maximumImageSize) return "Image must be 4 MB or smaller.";
  return null;
}
