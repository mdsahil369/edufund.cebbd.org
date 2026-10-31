import Image from "next/image";
import { avatarPalette, cn, getInitials } from "@/lib/utils";

const sizeClasses = {
  xs: "size-8 text-[11px]",
  sm: "size-10 text-xs",
  md: "size-14 text-base",
  lg: "size-20 text-xl",
  xl: "size-28 text-3xl",
  "2xl": "size-36 text-4xl",
} as const;

interface StudentAvatarProps {
  name: string;
  photoUrl?: string;
  size?: keyof typeof sizeClasses;
  className?: string;
  priority?: boolean;
}

export function StudentAvatar({
  name,
  photoUrl,
  size = "md",
  className,
  priority = false,
}: StudentAvatarProps) {
  const palette = avatarPalette(name);

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-black/5",
        sizeClasses[size],
        className,
      )}
      style={photoUrl ? undefined : { backgroundImage: palette.backgroundImage }}
    >
      {photoUrl ? (
        <Image
          src={photoUrl}
          alt={name}
          fill
          sizes="(max-width: 768px) 96px, 160px"
          className="object-cover"
          priority={priority}
          unoptimized={photoUrl.startsWith("data:")}
        />
      ) : (
        <>
          <span
            aria-hidden="true"
            className="absolute -right-2 -bottom-2 size-2/3 rounded-full opacity-20"
            style={{ backgroundColor: palette.accent }}
          />
          <span className="relative font-bold tracking-wide text-white">
            {getInitials(name)}
          </span>
        </>
      )}
      <span className="sr-only">{name}</span>
    </span>
  );
}
