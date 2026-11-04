import { revalidatePath } from "next/cache";
import { AVATAR_BUCKET, AVATAR_TYPES, MAX_AVATAR_BYTES } from "@/lib/avatar";
import { getSession } from "@/lib/session";
import { supabaseAdmin, type Profile } from "@/lib/supabase-server";

const fail = (error: string, status: number) => Response.json({ error }, { status });

// Storage path of the current avatar, from its public URL, so it can be cleaned up when replaced.
function storagePath(publicUrl: string | null) {
  const marker = `/storage/v1/object/public/${AVATAR_BUCKET}/`;
  const index = publicUrl?.indexOf(marker) ?? -1;
  return publicUrl && index >= 0 ? decodeURIComponent(publicUrl.slice(index + marker.length)) : null;
}

async function currentProfile(address: string) {
  const { data } = await supabaseAdmin()
    .from("profiles")
    .select("*")
    .eq("wallet_address", address)
    .maybeSingle<Profile>();
  return data;
}

// Step 1: a one-time upload URL for the signed-in freelancer's new picture.
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return fail("Please sign in again.", 401);

  const body = (await request.json().catch(() => null)) as { type?: unknown; size?: unknown } | null;
  const type = typeof body?.type === "string" ? body.type : "";
  const size = typeof body?.size === "number" ? body.size : 0;
  const ext = AVATAR_TYPES[type];
  if (!ext) return fail("Use a PNG, JPG, WebP or GIF image.", 400);
  if (size <= 0 || size > MAX_AVATAR_BYTES) return fail("Images can be up to 2 MB.", 400);

  const path = `${session.address}/${Date.now()}.${ext}`;
  const { data, error } = await supabaseAdmin().storage.from(AVATAR_BUCKET).createSignedUploadUrl(path);
  if (error || !data) return fail("Couldn't prepare the upload. Try again.", 500);
  return Response.json({ path: data.path, token: data.token });
}

// Step 2: after uploading, check the file and make it the profile picture.
export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return fail("Please sign in again.", 401);

  const body = (await request.json().catch(() => null)) as { path?: unknown } | null;
  const path = typeof body?.path === "string" ? body.path : "";
  if (!path.startsWith(`${session.address}/`)) return fail("That image isn't yours.", 400);

  const storage = supabaseAdmin().storage.from(AVATAR_BUCKET);
  const { data: file, error } = await storage.download(path);
  if (error || !file) return fail("Couldn't find the uploaded image.", 400);
  if (!AVATAR_TYPES[file.type] || file.size > MAX_AVATAR_BYTES) {
    await storage.remove([path]);
    return fail("Use a PNG, JPG, WebP or GIF image up to 2 MB.", 400);
  }

  const previous = storagePath((await currentProfile(session.address))?.avatar_url ?? null);
  const url = storage.getPublicUrl(path).data.publicUrl;
  const { error: saveError } = await supabaseAdmin()
    .from("profiles")
    .update({ avatar_url: url })
    .eq("wallet_address", session.address);
  if (saveError) return fail("Couldn't save your picture.", 500);

  if (previous && previous !== path) await storage.remove([previous]);
  revalidatePath("/dashboard");
  return Response.json({ ok: true, url });
}

export async function DELETE() {
  const session = await getSession();
  if (!session) return fail("Please sign in again.", 401);

  const previous = storagePath((await currentProfile(session.address))?.avatar_url ?? null);
  const { error } = await supabaseAdmin()
    .from("profiles")
    .update({ avatar_url: null })
    .eq("wallet_address", session.address);
  if (error) return fail("Couldn't remove your picture.", 500);

  if (previous) await supabaseAdmin().storage.from(AVATAR_BUCKET).remove([previous]);
  revalidatePath("/dashboard");
  return Response.json({ ok: true });
}
