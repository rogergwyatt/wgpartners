import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  _req: NextRequest,
  { params }: { params: { folder: string } }
) {
  const { folder } = params;

  // Prevent path traversal
  if (!folder || folder.includes("..") || folder.includes("/")) {
    return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
  }

  const galleryDir = path.join(process.cwd(), "public", "images", "gallery", folder);

  if (!fs.existsSync(galleryDir)) {
    return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
  }

  const validExtensions = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".svg"]);

  const files = fs
    .readdirSync(galleryDir)
    .filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return validExtensions.has(ext);
    })
    .sort();

  const images = files.map((file) => ({
    src: `/images/gallery/${folder}/${file}`,
    alt: path.basename(file, path.extname(file)).replace(/[-_]/g, " "),
  }));

  return NextResponse.json({ images });
}
