import { EVIDENCE_BUCKET, MAX_EVIDENCE_BYTES } from "@/lib/evidence";
import { ownedPaidInvoice } from "@/lib/invoice-access";
import { supabaseAdmin } from "@/lib/supabase-server";

// Gives the invoice's owner a one-time URL to upload their delivery evidence to storage.
export async function POST(request: Request, ctx: RouteContext<"/api/invoices/[id]/evidence">) {
  const { id } = await ctx.params;
  const access = await ownedPaidInvoice(id);
  if (access.error) return access.error;

  const body = (await request.json().catch(() => null)) as { fileName?: unknown; size?: unknown } | null;
  const fileName = typeof body?.fileName === "string" ? body.fileName : "";
  const size = typeof body?.size === "number" ? body.size : 0;
  if (!fileName || size <= 0) return Response.json({ error: "Choose a file to upload." }, { status: 400 });
  if (size > MAX_EVIDENCE_BYTES) return Response.json({ error: "Files can be up to 10 MB." }, { status: 400 });

  // Keep the original name readable, but safe for a storage path.
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(-80) || "evidence";
  const path = `${id}/${Date.now()}-${safeName}`;

  const { data, error } = await supabaseAdmin().storage.from(EVIDENCE_BUCKET).createSignedUploadUrl(path);
  if (error || !data) return Response.json({ error: "Couldn't prepare the upload. Try again." }, { status: 500 });
  return Response.json({ path: data.path, token: data.token });
}
