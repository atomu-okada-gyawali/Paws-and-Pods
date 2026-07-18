import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

// path is relative to cwd (server root at runtime)
export const UPLOADS_DIR = path.join(process.cwd(), "uploads");

interface DetectedType {
  ext: string;
  mime: string;
}

// sniff the type from magic bytes, not the client filename/mime. no svg (xss)
function detectImageType(buffer: Buffer): DetectedType | null {
  if (buffer.length < 12) return null;

  // jpeg: ff d8 ff
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { ext: "jpg", mime: "image/jpeg" };
  }
  // png: 89 50 4e 47 0d 0a 1a 0a
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { ext: "png", mime: "image/png" };
  }
  // gif: "GIF8"
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
    return { ext: "gif", mime: "image/gif" };
  }
  // webp: "RIFF" .... "WEBP"
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { ext: "webp", mime: "image/webp" };
  }

  return null;
}

// check it's really an image, then write it with a random name so no path traversal
export async function saveImage(buffer: Buffer): Promise<{ filename: string }> {
  const type = detectImageType(buffer);
  if (!type) {
    throw new Error("File content is not a supported image (JPEG, PNG, GIF, or WEBP).");
  }

  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  const filename = `${crypto.randomUUID()}.${type.ext}`;
  await fs.writeFile(path.join(UPLOADS_DIR, filename), buffer);

  return { filename };
}
