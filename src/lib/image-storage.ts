import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const maximumImageSize = 5 * 1024 * 1024;
const allowedImageTypes = new Set(["image/png", "image/jpeg", "image/webp"]);

export class ImageUploadError extends Error {}

function safeFilename(filename: string) {
  return filename.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "image";
}

function storage() {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  const bucket = process.env.CLOUDFLARE_R2_IMAGES_BUCKET;
  const publicBaseUrl = process.env.CLOUDFLARE_R2_IMAGES_PUBLIC_URL;
  const endpoint = process.env.CLOUDFLARE_R2_IMAGES_ENDPOINT || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);

  if (!accessKeyId || !secretAccessKey || !bucket || !publicBaseUrl || !endpoint) {
    throw new Error("Cloudflare R2 public image storage is not configured.");
  }

  return {
    bucket,
    publicBaseUrl: publicBaseUrl.endsWith("/") ? publicBaseUrl : `${publicBaseUrl}/`,
    client: new S3Client({ region: "auto", endpoint, credentials: { accessKeyId, secretAccessKey } }),
  };
}

export async function uploadImage(file: Buffer, filename: string, contentType: string): Promise<string> {
  if (!allowedImageTypes.has(contentType)) {
    throw new ImageUploadError("Only PNG, JPEG, and WebP images are allowed.");
  }
  if (file.length === 0) throw new ImageUploadError("Choose an image file to upload.");
  if (file.length > maximumImageSize) throw new ImageUploadError("Image must be 5 MB or smaller.");

  const { bucket, publicBaseUrl, client } = storage();
  const key = `images/${crypto.randomUUID()}-${safeFilename(filename)}`;
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: file,
    ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable",
  }));

  return new URL(key, publicBaseUrl).toString();
}
