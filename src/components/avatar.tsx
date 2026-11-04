// A freelancer's profile picture, or their initials when they haven't added one.
export function Avatar({
  url,
  name,
  className = "size-12 text-base",
}: {
  url: string | null | undefined;
  name: string;
  className?: string;
}) {
  if (url) {
    return (
      // Avatars are user uploads on Supabase Storage, so a plain img avoids image-host config.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt="" className={`shrink-0 rounded-full object-cover ${className}`} />
    );
  }
  const initials = name.replace(/^[@]|^0x/i, "").slice(0, 2).toUpperCase() || "PP";
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent to-emerald-700 font-semibold text-accent-ink ${className}`}
      aria-hidden
    >
      {initials}
    </span>
  );
}
