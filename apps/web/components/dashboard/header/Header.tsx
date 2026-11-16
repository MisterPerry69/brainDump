import Link from "next/link";
import { redirect } from "next/navigation";
import GlobalActions from "@/components/dashboard/GlobalActions";
import ProfileOptions from "@/components/dashboard/header/ProfileOptions";
import { SearchInput } from "@/components/dashboard/search/SearchInput";
import KarakeepLogo from "@/components/KarakeepIcon";
import { getServerAuthSession } from "@/server/auth";

const NAV = [
  ["Mappa", "/dashboard/bookmarks"],
  ["Smista", "/dashboard/smista"],
  ["Tag", "/dashboard/tags"],
  ["Evidenziati", "/dashboard/highlights"],
  ["Archivio", "/dashboard/archive"],
];

export default async function Header() {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/");
  }

  return (
    <header className="sticky left-0 right-0 top-0 z-50 flex h-16 w-full items-center justify-between overflow-x-auto overflow-y-hidden bg-background p-4">
      <div className="hidden items-center sm:flex">
        <Link href={"/dashboard/bookmarks"} className="me-6">
          <KarakeepLogo height={38} />
        </Link>
      </div>
      <nav className="bd-label me-4 flex shrink-0 items-center gap-4 text-muted-foreground">
        {NAV.map(([label, href]) => (
          <Link key={href} href={href} className="hover:text-primary">
            {label}
          </Link>
        ))}
      </nav>
      <div className="flex flex-1 gap-2">
        <SearchInput className="rounded-md bg-muted" />
        <GlobalActions />
      </div>
      <div className="flex items-center">
        <ProfileOptions />
      </div>
    </header>
  );
}
