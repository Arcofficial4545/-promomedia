import Link from "next/link";
import { AtSign, Mail, Rss } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { NewsletterForm } from "@/components/marketing/NewsletterForm";

const columns = [
  {
    heading: "Browse",
    links: [
      { href: "/stores", label: "All stores" },
      { href: "/coupons", label: "All coupons" },
      { href: "/categories", label: "Categories" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    heading: "Categories",
    links: [
      { href: "/categories/ai-tools", label: "AI Tools" },
      { href: "/categories/no-code-app-builders", label: "No-Code Builders" },
      { href: "/categories/saas", label: "SaaS" },
      { href: "/categories/accounting-finance", label: "Accounting" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/disclosure", label: "How we make money" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of service" },
      { href: "/disclosure", label: "Disclosure" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-pine text-white">
      <Container size="wide" className="py-16">
        <div className="grid gap-12 lg:grid-cols-[2fr_3fr]">
          <div className="max-w-sm">
            <p className="font-display text-2xl font-bold tracking-tight">
              Promopedia
            </p>
            <p className="mt-3 text-sm leading-relaxed text-mint/80">
              Verified deals and sharp editorial coverage of AI tools, SaaS
              products, and digital services. Updated daily.
            </p>
            <div className="mt-6">
              <p className="text-sm font-semibold text-mint">
                Get the best deals in your inbox
              </p>
              <NewsletterForm source="footer" className="mt-3" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {columns.map((column) => (
              <nav key={column.heading} aria-label={column.heading}>
                <p className="text-sm font-semibold tracking-wide text-mint uppercase">
                  {column.heading}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={`${column.heading}-${link.href}`}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/75 transition-colors hover:text-emerald"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <a
              href="https://x.com/promopedia"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Promopedia on X"
              className="text-white/60 transition-colors hover:text-emerald"
            >
              <AtSign className="h-5 w-5" aria-hidden="true" />
            </a>
            <Link
              href="/rss.xml"
              aria-label="Promopedia RSS feed"
              className="text-white/60 transition-colors hover:text-emerald"
            >
              <Rss className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link
              href="/contact"
              aria-label="Contact Promopedia"
              className="text-white/60 transition-colors hover:text-emerald"
            >
              <Mail className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
          <p className="text-xs text-white/50">
            &copy; {new Date().getFullYear()} Promopedia. All rights reserved.
          </p>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-white/40">
          When you buy through some links on Promopedia, we may earn a
          commission at no extra cost to you. This never influences what we
          cover or recommend.{" "}
          <Link href="/disclosure" className="underline hover:text-white/70">
            Learn more
          </Link>
          .
        </p>
      </Container>
    </footer>
  );
}
