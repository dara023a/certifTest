import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/footer";

/**
 * Cached so the current year can be read during prerendering without triggering
 * the "blocking-prerender-current-time" error.
 */
async function getFooterYear(): Promise<number> {
  "use cache";
  return new Date().getFullYear();
}

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const footerYear = await getFooterYear();

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <SiteFooter year={footerYear} />
    </>
  );
}
