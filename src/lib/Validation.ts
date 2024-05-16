import { CipherType } from "./CipherType";
import { ValidationError } from "./ValidationError";

export interface UploadPayload {
  file: File;
  mode: "encrypt" | "decrypt";
  key: string;
}

export function getCipher(cipher: string) {
  switch (cipher) {
    case CipherType.CBC:
      return CipherType.CBC;
    case CipherType.CFB:
      return CipherType.CFB;
    case CipherType.CTR:
      return CipherType.CTR;
    case CipherType.ECB:
      return CipherType.ECB;
    case CipherType.OFB:
      return CipherType.OFB;
    default:
      throw new ValidationError("Invalid cipher.");
  }
}

export function getAndValidateUpload(formData: FormData): UploadPayload {
  const mode = formData.get("mode") as string | null;
  const file = formData.get("file") as File | null;

  if (mode !== "encrypt" && mode !== "decrypt") {
    throw new ValidationError("Invalid mode.");
  }

  if (!file) {
    throw new ValidationError("No file received.");
  }

  const key = formData.get("key") as string;

  if (!key) {
    throw new ValidationError("Key is required");
  }

  return {
    mode,
    file,
    key,
  };
}

export interface TextPayload {
  mode: "encrypt" | "decrypt";
  key: string;
  data: string;
}

export function getAndValidateText(data: any): TextPayload {
  const mode = data.mode as string;
  const key = data.key as string;
  const text = data.text as string;

  if (mode !== "encrypt" && mode !== "decrypt") {
    throw new ValidationError("Invalid mode.");
  }

  if (!key) {
    throw new ValidationError("Key is required");
  }

  if (!text) {
    throw new ValidationError("Text is required");
  }

  return {
    mode,
    key,
    data: text,
  };
}
