/**
 * Minimal ImageKit helper for server-side uploads.
 *
 * This helper uses ImageKit's REST upload endpoint. It supports uploading
 * a base64 data URI or a remote URL. Authentication uses the server-side
 * private key (from `process.env.IMAGEKIT_PRIVATE_KEY`).
 *
 * Notes:
 * - Ensure `IMAGEKIT_PRIVATE_KEY` is set in your environment for uploads to succeed.
 * - This implementation uses the global `fetch` and `FormData` APIs available
 *   in recent Node.js runtimes. If your environment lacks these, you may need
 *   to add a polyfill or switch to the official ImageKit SDK.
 */

type UploadResponse = {
  fileId?: string;
  name?: string;
  size?: number;
  filePath?: string;
  url?: string;
  thumbnail?: string;
  [k: string]: unknown;
};

/**
 * Upload an image to ImageKit.
 *
 * `file` may be either:
 * - a remote URL (starts with http/https) — ImageKit will fetch the file, or
 * - a base64 data URI (e.g. "data:image/png;base64,...") or raw base64 string.
 *
 * @param {{file:string,fileName?:string,folder?:string}} options
 * @returns {Promise<UploadResponse>} upload result from ImageKit
 */
export async function uploadImage(options: {
  file: string;
  fileName?: string;
  folder?: string;
}): Promise<UploadResponse> {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error(
      "IMAGEKIT_PRIVATE_KEY is not configured. Cannot upload images.",
    );
  }

  // ImageKit upload endpoint
  const url = "https://upload.imagekit.io/api/v1/files/upload";

  const form = new FormData();
  // the API accepts 'file' as a dataURI or remote URL
  form.append("file", options.file);
  if (options.fileName) form.append("fileName", options.fileName);
  if (options.folder) form.append("folder", options.folder);

  // Use Basic auth with the private key as username and empty password
  const auth = Buffer.from(`${privateKey}:`).toString("base64");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      // Note: do not set Content-Type; fetch will set the multipart boundary
    } as Record<string, string>,
    body: form as unknown as BodyInit,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `ImageKit upload failed: ${res.status} ${res.statusText} - ${text}`,
    );
  }

  const json = (await res.json()) as UploadResponse;
  return json;
}

/**
 * Utility that accepts either a data URL/base64 or a remote URL and uploads to ImageKit.
 */
export async function uploadForProfile(
  fileOrUrl: string,
  fileName?: string,
  folder?: string,
) {
  // If it's already a remote URL hosted elsewhere and you want to keep it as-is,
  // you can either pass the remote URL to ImageKit (it will fetch it) or
  // just return the original URL. We'll attempt to upload via ImageKit to
  // ensure consistent hosting.
  // Normalize folder name so callers can pass short names like "profiles"
  // and they will be uploaded under `Trackit-Uploads/<subfolder>`.
  // If the caller passes a folder that already starts with `Trackit-Uploads`,
  // preserve it as-is. If no folder is provided, default to
  // `Trackit-Uploads/Profiles`.
  let targetFolder: string;
  if (!folder) {
    targetFolder = "Trackit-Uploads/Profiles";
  } else {
    const trimmed = folder.trim();
    // If caller already provided a full Trackit-Uploads path, use it.
    if (/^Trackit-Uploads(\/|$)/i.test(trimmed)) {
      targetFolder = trimmed;
    } else if (/^profiles$/i.test(trimmed)) {
      // common short name -> map to canonical Profiles folder
      targetFolder = "Trackit-Uploads/Profiles";
    } else {
      // Normalize and prefix with Trackit-Uploads
      const normalized = trimmed.replace(/^\/+|\/+$/g, "");
      targetFolder = `Trackit-Uploads/${normalized}`;
    }
  }

  return uploadImage({
    file: fileOrUrl,
    fileName: fileName ?? `profile_${Date.now()}`,
    folder: targetFolder,
  });
}

const exported = { uploadImage, uploadForProfile };
export default exported;

/**
 * Returns lightweight client configuration for direct/browser uploads.
 * Exposes only public keys/endpoints safe for client usage (or `null`).
 */
export function getClientConfig() {
  const publicKey =
    typeof process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY === "string"
      ? process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY
      : null;

  const urlEndpoint =
    typeof process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT === "string"
      ? process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
      : null;

  return { publicKey, urlEndpoint };
}
