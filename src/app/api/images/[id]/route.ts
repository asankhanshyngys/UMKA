import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// Marketing images are public; only the upload endpoint requires an admin.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const image = await prisma.publicImage.findUnique({
    where: { id },
    select: { data: true, contentType: true },
  });
  if (!image) return new Response("Image not found", { status: 404 });

  return new Response(new Uint8Array(image.data), {
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
