import { Toaster } from "sonner";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { PopupManager } from "@/components/promo/PopupManager";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSettings } from "@/lib/db/repositories/settings";
import { resolvePopupPromo } from "@/lib/promos/resolve";
import { organizationLd, websiteLd } from "@/lib/seo/jsonld";

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [settings, timedPromo, exitPromo] = await Promise.all([
    getSettings(),
    resolvePopupPromo("popup-timed"),
    resolvePopupPromo("popup-exit"),
  ]);

  return (
    <SmoothScroll>
      <JsonLd data={[organizationLd(), websiteLd()]} />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-[var(--radius-btn)] focus:bg-pine focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to content
      </a>
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
      <PopupManager
        timedPromo={timedPromo}
        exitPromo={exitPromo}
        rules={settings.popupRules}
      />
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "#0d4029",
            color: "#ffffff",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "0.625rem",
            fontFamily: "var(--font-inter)",
          },
        }}
      />
    </SmoothScroll>
  );
}
