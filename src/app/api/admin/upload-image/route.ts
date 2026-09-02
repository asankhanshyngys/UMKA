import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { ImageUploadError, uploadImage } from "@/lib/image-storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!await getCurrentAdmin()) return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image file to upload." }, { status: 400 });
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      return NextResponse.json({ error: "Only PNG, JPEG, and WebP images are allowed." }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Image must be 5 MB or smaller." }, { status: 400 });

    const url = await uploadImage(Buffer.from(await file.arrayBuffer()), file.name, file.type);
    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    if (error instanceof ImageUploadError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Image upload failed", error);
    return NextResponse.json({ error: "Unable to upload the image. Check public image storage settings." }, { status: 500 });
  }
}
