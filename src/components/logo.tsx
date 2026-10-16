import Link from "next/link";
import Image from "next/image";

import { ORGANIZATION } from "@/lib/types";

export function Logo() {
  const name = ORGANIZATION.name;
  return (
    <Link
      href="/"
      className="flex items-center gap-2 [@media(pointer:coarse)]:min-h-11"
    >
      <Image
        src="/logo.svg"
        alt={name}
        width={32}
        height={32}
        className="h-8 w-8"
        unoptimized
        priority
      />
      <span className="text-sm font-semibold md:text-base">{name}</span>
    </Link>
  );
}
