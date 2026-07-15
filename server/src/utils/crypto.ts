import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 12 byte iv for aes-gcm
const KEY_LENGTH = 32; // 256 bits

// use the env key or make a random one
const DB_ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY 
  ? Buffer.from(process.env.DB_ENCRYPTION_KEY, "hex")
  : crypto.randomBytes(KEY_LENGTH);

// aes-256-gcm. format is iv:authtag:ciphertext
export function encryptField(plainText: string): string {
  if (!plainText) return plainText;

  // fresh iv each time
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, DB_ENCRYPTION_KEY, iv);

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  // join parts with colons
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

// reverse of encryptField
export function decryptField(encryptedText: string): string {
  if (!encryptedText || !encryptedText.includes(":")) return encryptedText;

  try {
    const [ivHex, authTagHex, cipherText] = encryptedText.split(":");
    if (!ivHex || !authTagHex || !cipherText) {
      throw new Error("Malformed cipher parameters.");
    }

    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, DB_ENCRYPTION_KEY, iv);

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(cipherText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Field decryption failure:", error);
    throw new Error("Could not decrypt field: integrity validation checks failed.");
  }
}
