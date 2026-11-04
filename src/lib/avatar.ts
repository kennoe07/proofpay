// Profile pictures live in the public "avatars" storage bucket, which only accepts these
// image types (no SVG, which can carry scripts) and the same size limit.
export const AVATAR_BUCKET = "avatars";
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
export const AVATAR_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};
