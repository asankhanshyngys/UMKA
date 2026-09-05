import { prisma } from "@/lib/prisma";
import { imageUploadError } from "@/lib/image-upload";

export class ImageUploadError extends Error {}

export async function uploadImage(file: Buffer, filename: string, contentType: string): Promise<string> {
  const error = imageUploadError(file.length, contentType);
  if (error) throw new ImageUploadError(error);

  const image = await prisma.publicImage.create({
    data: { filename, contentType, data: new Uint8Array(file) },
    select: { id: true },
  });
  return `/api/images/${image.id}`;
}
