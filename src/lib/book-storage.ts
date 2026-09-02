import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const bucket = process.env.CLOUDFLARE_R2_BOOKS_BUCKET;

/**
 * All book objects live in a private Cloudflare R2 bucket. This module is the
 * only code that talks to R2; callers must authorize before reading a file.
 */
function storage() {
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error("Cloudflare R2 book storage is not configured.");
  }
  return {
    bucket,
    client: new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    }),
  };
}

function safeFilename(filename: string) {
  return filename.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "file";
}

export async function uploadBookObject(kind: "pdf" | "cover", filename: string, bytes: Uint8Array, contentType: string) {
  const { client, bucket: targetBucket } = storage();
  const key = `books/${kind}/${crypto.randomUUID()}-${safeFilename(filename)}`;
  await client.send(new PutObjectCommand({ Bucket: targetBucket, Key: key, Body: bytes, ContentType: contentType }));
  return key;
}

export async function getBookObject(key: string) {
  const { client, bucket: targetBucket } = storage();
  const response = await client.send(new GetObjectCommand({ Bucket: targetBucket, Key: key }));
  if (!response.Body) throw new Error("Book storage returned an empty file.");
  return { bytes: new Uint8Array(await response.Body.transformToByteArray()), contentType: response.ContentType };
}
