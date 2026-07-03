/**
 * Seed the local SQLite database with realistic development data.
 * Destructive: clears all content tables first. Run: npm run db:seed
 */
import { randomBytes } from "node:crypto";
import { db } from "../lib/db/client-node";
import { hashPassword } from "../lib/auth/password";
import {
  adminUsers,
  authors,
  categories,
  clicks,
  coupons,
  newsletterSubscribers,
  posts,
  postStores,
  promos,
  settings,
  storeCategories,
  stores,
  type TiptapDoc,
} from "../lib/db/schema";

const now = Date.now();
const days = (n: number) => new Date(now + n * 86_400_000);

/* ------------------------------------------------------------------ */
/* Tiptap content helpers                                              */
/* ------------------------------------------------------------------ */

type Node = Record<string, unknown>;

const text = (t: string, marks?: Node[]) => ({
  type: "text",
  text: t,
  ...(marks ? { marks } : {}),
});
const p = (...content: Node[]) => ({ type: "paragraph", content });
const pt = (t: string) => p(text(t));
const h2 = (t: string) => ({
  type: "heading",
  attrs: { level: 2 },
  content: [text(t)],
});
const bullets = (items: string[]) => ({
  type: "bulletList",
  content: items.map((i) => ({ type: "listItem", content: [pt(i)] })),
});
const quote = (t: string) => ({ type: "blockquote", content: [pt(t)] });
const couponEmbed = (couponId: string) => ({
  type: "couponEmbed",
  attrs: { couponId },
});
const promoSlot = () => ({
  type: "promoSlot",
  attrs: { placement: "in-content" },
});
const doc = (...content: Node[]): TiptapDoc => ({ type: "doc", content });

/* ------------------------------------------------------------------ */
/* Wipe                                                                */
/* ------------------------------------------------------------------ */

async function wipe() {
  await db.delete(clicks);
  await db.delete(postStores);
  await db.delete(posts);
  await db.delete(promos);
  await db.delete(coupons);
  await db.delete(storeCategories);
  await db.delete(stores);
  await db.delete(categories);
  await db.delete(authors);
  await db.delete(newsletterSubscribers);
  await db.delete(settings);
  await db.delete(adminUsers);
}

/* ------------------------------------------------------------------ */
/* Seed data                                                           */
/* ------------------------------------------------------------------ */

const categorySeed = [
  { name: "AI Tools", slug: "ai-tools", icon: "bot", description: "Assistants, generators, and AI-first products that actually ship value.", sortOrder: 1 },
  { name: "No-Code / App Builders", slug: "no-code-app-builders", icon: "blocks", description: "Build and launch software without writing every line yourself.", sortOrder: 2 },
  { name: "SaaS", slug: "saas", icon: "cloud", description: "Software subscriptions worth paying for — and paying less for.", sortOrder: 3 },
  { name: "Accounting & Finance", slug: "accounting-finance", icon: "calculator", description: "Bookkeeping, invoicing, and finance stacks for small teams.", sortOrder: 4 },
  { name: "E-commerce", slug: "e-commerce", icon: "shopping-cart", description: "Storefronts, marketplaces, and the tools that power online selling.", sortOrder: 5 },
  { name: "Design", slug: "design", icon: "pen-tool", description: "Design, prototyping, and creative tooling for modern teams.", sortOrder: 6 },
  { name: "Productivity", slug: "productivity", icon: "list-checks", description: "Docs, tasks, and workflow tools that keep teams moving.", sortOrder: 7 },
  { name: "Marketing", slug: "marketing", icon: "megaphone", description: "Copy, campaigns, SEO, and growth tooling.", sortOrder: 8 },
];

type StoreSeed = {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  rating: number;
  isFeatured?: boolean;
  cats: string[];
};

const storeSeed: StoreSeed[] = [
  {
    name: "Base44",
    slug: "base44",
    tagline: "Build fully functional apps from a single prompt.",
    description:
      "Base44 turns plain-language prompts into working web applications with auth, databases, and hosting included. It has become a favorite among founders validating ideas fast, and its built-in integrations mean prototypes graduate to production without a rebuild.",
    websiteUrl: "https://base44.com",
    rating: 4.7,
    isFeatured: true,
    cats: ["ai-tools", "no-code-app-builders"],
  },
  {
    name: "Lovable",
    slug: "lovable",
    tagline: "The AI full-stack engineer for your next product.",
    description:
      "Lovable generates production-grade React and Supabase applications from conversational prompts. Strong opinions on architecture, clean exports, and fast iteration loops make it one of the most capable AI app builders on the market.",
    websiteUrl: "https://lovable.dev",
    rating: 4.6,
    isFeatured: true,
    cats: ["ai-tools", "no-code-app-builders"],
  },
  {
    name: "Daraz",
    slug: "daraz",
    tagline: "South Asia's leading online marketplace.",
    description:
      "Daraz is the go-to online marketplace across South Asia, carrying everything from electronics to daily essentials. Frequent flash sales and bank partnerships mean real savings for shoppers who time it right.",
    websiteUrl: "https://www.daraz.pk",
    rating: 4.2,
    isFeatured: true,
    cats: ["e-commerce"],
  },
  {
    name: "Sage UK",
    slug: "sage-uk",
    tagline: "Accounting software trusted by UK small businesses.",
    description:
      "Sage provides accounting, payroll, and HR software tailored to UK small and mid-sized businesses. Making Tax Digital compliance, solid reporting, and dependable support have kept it a mainstay of British bookkeeping for decades.",
    websiteUrl: "https://www.sage.com/en-gb/",
    rating: 4.3,
    isFeatured: true,
    cats: ["accounting-finance", "saas"],
  },
  {
    name: "Notion",
    slug: "notion",
    tagline: "One workspace for docs, wikis, and projects.",
    description:
      "Notion combines documents, databases, and project management in a single flexible workspace. Its AI features now draft, summarize, and answer questions across your entire knowledge base.",
    websiteUrl: "https://www.notion.com",
    rating: 4.7,
    isFeatured: true,
    cats: ["productivity", "saas"],
  },
  {
    name: "Jasper",
    slug: "jasper",
    tagline: "AI copilot for enterprise marketing teams.",
    description:
      "Jasper helps marketing teams produce on-brand content at scale, with brand voice controls, campaign workflows, and integrations into the tools marketers already use.",
    websiteUrl: "https://www.jasper.ai",
    rating: 4.2,
    cats: ["ai-tools", "marketing"],
  },
  {
    name: "Copy.ai",
    slug: "copy-ai",
    tagline: "Automate go-to-market content with AI workflows.",
    description:
      "Copy.ai turns repetitive go-to-market busywork into automated workflows — from prospecting emails to content repurposing — with a generous free tier to start.",
    websiteUrl: "https://www.copy.ai",
    rating: 4.1,
    cats: ["ai-tools", "marketing"],
  },
  {
    name: "Bubble",
    slug: "bubble",
    tagline: "The most established no-code platform for web apps.",
    description:
      "Bubble lets you design, develop, and launch production web applications without code. A mature plugin ecosystem and full database control make it the heavyweight of visual development.",
    websiteUrl: "https://bubble.io",
    rating: 4.4,
    cats: ["no-code-app-builders", "saas"],
  },
  {
    name: "Webflow",
    slug: "webflow",
    tagline: "Design and ship professional websites visually.",
    description:
      "Webflow gives designers full control of HTML, CSS, and interactions in a visual canvas, with hosting and a CMS built in. The standard for marketing sites that need to look custom-built.",
    websiteUrl: "https://webflow.com",
    rating: 4.5,
    isFeatured: true,
    cats: ["no-code-app-builders", "design"],
  },
  {
    name: "Framer",
    slug: "framer",
    tagline: "Ship stunning sites straight from a design canvas.",
    description:
      "Framer turns a familiar design-tool canvas into published, fast websites with animations that would normally need a developer. AI site generation gets you from blank page to draft in minutes.",
    websiteUrl: "https://www.framer.com",
    rating: 4.5,
    cats: ["design", "no-code-app-builders"],
  },
  {
    name: "QuickBooks",
    slug: "quickbooks",
    tagline: "Small-business accounting that runs itself.",
    description:
      "QuickBooks automates bookkeeping, invoicing, and tax prep for millions of small businesses. Deep bank integrations and accountant familiarity make it the default choice in North America.",
    websiteUrl: "https://quickbooks.intuit.com",
    rating: 4.1,
    cats: ["accounting-finance", "saas"],
  },
  {
    name: "Shopify",
    slug: "shopify",
    tagline: "The commerce platform behind millions of stores.",
    description:
      "Shopify powers everything from first stores to enterprise brands with hosted storefronts, payments, and a vast app ecosystem. Regular trial offers make starting almost free.",
    websiteUrl: "https://www.shopify.com",
    rating: 4.6,
    cats: ["e-commerce", "saas"],
  },
  {
    name: "Canva",
    slug: "canva",
    tagline: "Design anything, publish anywhere.",
    description:
      "Canva makes professional design accessible to everyone with templates, brand kits, and AI tools covering social posts to pitch decks. Teams plans add approvals and shared assets.",
    websiteUrl: "https://www.canva.com",
    rating: 4.7,
    cats: ["design", "productivity"],
  },
  {
    name: "Grammarly",
    slug: "grammarly",
    tagline: "AI writing partner across every app you use.",
    description:
      "Grammarly checks tone, clarity, and correctness everywhere you type, with generative drafting on paid tiers. The browser extension alone saves most knowledge workers hours a month.",
    websiteUrl: "https://www.grammarly.com",
    rating: 4.4,
    cats: ["ai-tools", "productivity"],
  },
  {
    name: "Zapier",
    slug: "zapier",
    tagline: "Automate work across 7,000+ apps.",
    description:
      "Zapier connects the tools you already use into automated workflows — no code required. New AI steps let zaps draft, extract, and decide, not just move data.",
    websiteUrl: "https://zapier.com",
    rating: 4.5,
    cats: ["productivity", "saas"],
  },
  {
    name: "ClickUp",
    slug: "clickup",
    tagline: "One app to replace your project stack.",
    description:
      "ClickUp bundles tasks, docs, goals, and chat into a single project workspace with aggressive pricing. Heavy customization means it fits almost any team's process.",
    websiteUrl: "https://clickup.com",
    rating: 4.3,
    cats: ["productivity", "saas"],
  },
];

type CouponSeed = {
  store: string;
  title: string;
  code?: string;
  type: "code" | "deal";
  discountLabel: string;
  discountValue?: number;
  terms: string;
  expiresInDays?: number; // negative = already expired
  isVerified?: boolean;
  isExclusive?: boolean;
  sortWeight?: number;
  clickCount?: number;
  revealCount?: number;
  successReports?: number;
};

const couponSeed: CouponSeed[] = [
  // Base44
  { store: "base44", title: "30% off your first 3 months of Base44 Pro", code: "SAVE30", type: "code", discountLabel: "30% OFF", discountValue: 30, terms: "New customers only. Applies to the Pro monthly plan for the first three billing cycles. Cannot be combined with other offers.", expiresInDays: 21, isVerified: true, isExclusive: true, sortWeight: 100, clickCount: 812, revealCount: 1204, successReports: 322 },
  { store: "base44", title: "Free builder plan — no credit card required", type: "deal", discountLabel: "FREE PLAN", terms: "Free tier includes 3 apps and community support. Upgrade anytime.", isVerified: true, sortWeight: 80, clickCount: 640, revealCount: 640, successReports: 411 },
  { store: "base44", title: "$50 credit for annual subscriptions", code: "ANNUAL50", type: "code", discountLabel: "$50 CREDIT", discountValue: 50, terms: "Valid on annual Pro and Team plans. Credit applied to the first invoice.", expiresInDays: 45, isVerified: true, clickCount: 233, revealCount: 402, successReports: 98 },
  { store: "base44", title: "20% off Team plan for startups", code: "STARTUP20", type: "code", discountLabel: "20% OFF", discountValue: 20, terms: "Requires a company email. Startups under 20 employees.", expiresInDays: -6, clickCount: 190, revealCount: 301, successReports: 44 },
  // Lovable
  { store: "lovable", title: "25% off Lovable Pro for 6 months", code: "LOVABLE25", type: "code", discountLabel: "25% OFF", discountValue: 25, terms: "New subscribers on monthly Pro. Discount applies for six billing cycles.", expiresInDays: 14, isVerified: true, isExclusive: true, sortWeight: 100, clickCount: 725, revealCount: 1010, successReports: 287 },
  { store: "lovable", title: "Start free — 5 projects included", type: "deal", discountLabel: "FREE TIER", terms: "Free plan includes 5 public projects and daily message limits.", isVerified: true, sortWeight: 70, clickCount: 511, revealCount: 511, successReports: 350 },
  { store: "lovable", title: "2 months free on annual plans", code: "ANNUALFREE2", type: "code", discountLabel: "2 MONTHS FREE", terms: "Choose annual billing at checkout; the discount is applied automatically after entering the code.", expiresInDays: 60, clickCount: 198, revealCount: 344, successReports: 71 },
  // Daraz
  { store: "daraz", title: "Rs. 500 off orders over Rs. 3,000", code: "DARAZ500", type: "code", discountLabel: "RS. 500 OFF", discountValue: 500, terms: "Minimum spend Rs. 3,000. Selected categories only. One use per customer.", expiresInDays: 10, isVerified: true, sortWeight: 90, clickCount: 1930, revealCount: 2811, successReports: 704 },
  { store: "daraz", title: "15% off electronics with bank cards", code: "BANK15", type: "code", discountLabel: "15% OFF", discountValue: 15, terms: "Valid with partner bank credit and debit cards. Max discount Rs. 2,000. Wednesdays only.", expiresInDays: 30, isVerified: true, clickCount: 1204, revealCount: 1876, successReports: 402 },
  { store: "daraz", title: "Free shipping on your first app order", type: "deal", discountLabel: "FREE SHIPPING", terms: "New app users only. Standard delivery, selected sellers.", expiresInDays: 90, clickCount: 887, revealCount: 887, successReports: 512 },
  { store: "daraz", title: "Flash sale: up to 70% off daily picks", type: "deal", discountLabel: "UP TO 70% OFF", terms: "Stock is limited during flash windows. Prices as marked.", expiresInDays: 3, isVerified: true, sortWeight: 60, clickCount: 2450, revealCount: 2450, successReports: 890 },
  { store: "daraz", title: "Rs. 300 voucher for new customers", code: "NEW300", type: "code", discountLabel: "RS. 300 OFF", discountValue: 300, terms: "First order only. Minimum spend Rs. 1,500.", expiresInDays: -12, clickCount: 410, revealCount: 623, successReports: 92 },
  // Sage UK
  { store: "sage-uk", title: "3 months free on Sage Accounting", type: "deal", discountLabel: "3 MONTHS FREE", terms: "New customers on Accounting Start and Standard plans. Cancel anytime during the free period.", expiresInDays: 25, isVerified: true, sortWeight: 95, clickCount: 534, revealCount: 534, successReports: 209 },
  { store: "sage-uk", title: "50% off Sage Payroll for 6 months", code: "PAYROLL50", type: "code", discountLabel: "50% OFF", discountValue: 50, terms: "Applies to Payroll plans up to 25 employees for the first six months.", expiresInDays: 40, isVerified: true, clickCount: 322, revealCount: 476, successReports: 118 },
  { store: "sage-uk", title: "Free MTD readiness check for VAT-registered businesses", type: "deal", discountLabel: "FREE TOOL", terms: "No purchase necessary. Online assessment.", clickCount: 145, revealCount: 145, successReports: 87 },
  { store: "sage-uk", title: "20% off Sage 50 annual licence", code: "SAGE50-20", type: "code", discountLabel: "20% OFF", discountValue: 20, terms: "Annual billing only. Existing customers excluded.", expiresInDays: -20, clickCount: 98, revealCount: 154, successReports: 21 },
  // Notion
  { store: "notion", title: "Notion AI free for 30 days on Business", type: "deal", discountLabel: "30-DAY TRIAL", terms: "Business plan trials include unlimited AI usage during the trial window.", expiresInDays: 35, isVerified: true, sortWeight: 85, clickCount: 903, revealCount: 903, successReports: 377 },
  { store: "notion", title: "20% off Plus annual for students upgrading", code: "GRAD20", type: "code", discountLabel: "20% OFF", discountValue: 20, terms: "Requires a previously verified education account.", expiresInDays: 50, clickCount: 287, revealCount: 411, successReports: 104 },
  { store: "notion", title: "Free Plus plan for eligible startups", type: "deal", discountLabel: "6 MONTHS FREE", terms: "Startups in eligible accelerator programs. Verification required.", expiresInDays: 80, isVerified: true, clickCount: 356, revealCount: 356, successReports: 130 },
  // Jasper
  { store: "jasper", title: "7-day free trial of Jasper Pro", type: "deal", discountLabel: "FREE TRIAL", terms: "Credit card required; cancel before day 7 to avoid charges.", isVerified: true, sortWeight: 60, clickCount: 412, revealCount: 412, successReports: 166 },
  { store: "jasper", title: "20% off annual Creator plan", code: "CREATE20", type: "code", discountLabel: "20% OFF", discountValue: 20, terms: "Annual billing only. New subscriptions.", expiresInDays: 28, isVerified: true, clickCount: 245, revealCount: 388, successReports: 91 },
  { store: "jasper", title: "10% off for agencies and teams of 5+", code: "TEAM10", type: "code", discountLabel: "10% OFF", discountValue: 10, terms: "Minimum five seats on the Business tier.", expiresInDays: -3, clickCount: 76, revealCount: 121, successReports: 18 },
  // Copy.ai
  { store: "copy-ai", title: "Free forever plan — 2,000 words a month", type: "deal", discountLabel: "FREE PLAN", terms: "No credit card required. Single seat.", isVerified: true, sortWeight: 55, clickCount: 388, revealCount: 388, successReports: 240 },
  { store: "copy-ai", title: "25% off first year of Pro", code: "COPYPRO25", type: "code", discountLabel: "25% OFF", discountValue: 25, terms: "New Pro subscriptions billed annually.", expiresInDays: 32, isVerified: true, clickCount: 219, revealCount: 340, successReports: 83 },
  { store: "copy-ai", title: "15% off workflow credits top-ups", code: "FLOW15", type: "code", discountLabel: "15% OFF", discountValue: 15, terms: "Applies to one-time credit purchases over $50.", expiresInDays: 18, clickCount: 92, revealCount: 141, successReports: 27 },
  // Bubble
  { store: "bubble", title: "First month of Starter free", code: "BUILDFREE", type: "code", discountLabel: "1 MONTH FREE", terms: "New paid workspaces only. Monthly billing.", expiresInDays: 26, isVerified: true, sortWeight: 65, clickCount: 341, revealCount: 502, successReports: 129 },
  { store: "bubble", title: "20% off annual Growth plan", code: "GROW20", type: "code", discountLabel: "20% OFF", discountValue: 20, terms: "Annual billing. New and upgrading workspaces.", expiresInDays: 55, clickCount: 187, revealCount: 296, successReports: 66 },
  { store: "bubble", title: "Free plan for learning and prototyping", type: "deal", discountLabel: "FREE TIER", terms: "Development versions only; Bubble branding applies.", isVerified: true, clickCount: 265, revealCount: 265, successReports: 198 },
  // Webflow
  { store: "webflow", title: "10% off annual site plans", code: "SITE10", type: "code", discountLabel: "10% OFF", discountValue: 10, terms: "Applies to CMS and Business site plans billed annually.", expiresInDays: 38, isVerified: true, sortWeight: 75, clickCount: 428, revealCount: 630, successReports: 171 },
  { store: "webflow", title: "Free workspace for freelancers — 2 unhosted sites", type: "deal", discountLabel: "FREE PLAN", terms: "Starter workspace includes two unhosted staging sites.", isVerified: true, clickCount: 356, revealCount: 356, successReports: 244 },
  { store: "webflow", title: "20% off first year for students and educators", code: "EDU20", type: "code", discountLabel: "20% OFF", discountValue: 20, terms: "Valid education email required at verification.", expiresInDays: 70, clickCount: 133, revealCount: 208, successReports: 47 },
  // Framer
  { store: "framer", title: "25% off Framer Pro annual", code: "FRAMER25", type: "code", discountLabel: "25% OFF", discountValue: 25, terms: "New Pro subscriptions billed annually. One site.", expiresInDays: 20, isVerified: true, isExclusive: true, sortWeight: 88, clickCount: 517, revealCount: 744, successReports: 203 },
  { store: "framer", title: "Free plan with framer.website subdomain", type: "deal", discountLabel: "FREE PLAN", terms: "Includes Framer banner and subdomain. Great for portfolios.", isVerified: true, clickCount: 402, revealCount: 402, successReports: 289 },
  { store: "framer", title: "3 months of Mini free for hackathon teams", code: "HACKMINI", type: "code", discountLabel: "3 MONTHS FREE", terms: "Verification through partnered hackathons only.", expiresInDays: -8, clickCount: 88, revealCount: 132, successReports: 16 },
  // QuickBooks
  { store: "quickbooks", title: "50% off QuickBooks Online for 3 months", type: "deal", discountLabel: "50% OFF", discountValue: 50, terms: "Choose the discount instead of the 30-day free trial at checkout.", expiresInDays: 15, isVerified: true, sortWeight: 82, clickCount: 689, revealCount: 689, successReports: 301 },
  { store: "quickbooks", title: "30-day free trial, all plans", type: "deal", discountLabel: "FREE TRIAL", terms: "Full feature access during the trial. Card required.", isVerified: true, clickCount: 450, revealCount: 450, successReports: 312 },
  { store: "quickbooks", title: "$20 off first payroll month", code: "PAY20", type: "code", discountLabel: "$20 OFF", discountValue: 20, terms: "QuickBooks Payroll Core and Premium, US customers.", expiresInDays: 42, clickCount: 156, revealCount: 240, successReports: 55 },
  // Shopify
  { store: "shopify", title: "$1/month for your first 3 months", type: "deal", discountLabel: "$1/MONTH", discountValue: 1, terms: "Basic plan, new merchants after the free trial. Monthly billing.", expiresInDays: 48, isVerified: true, sortWeight: 92, clickCount: 1340, revealCount: 1340, successReports: 620 },
  { store: "shopify", title: "3-day free trial — no card needed", type: "deal", discountLabel: "FREE TRIAL", terms: "Explore all features before choosing a plan.", isVerified: true, clickCount: 720, revealCount: 720, successReports: 495 },
  { store: "shopify", title: "10% off annual Advanced plan", code: "SCALE10", type: "code", discountLabel: "10% OFF", discountValue: 10, terms: "Annual billing on Advanced. Existing merchants upgrading qualify.", expiresInDays: 65, clickCount: 204, revealCount: 315, successReports: 72 },
  // Canva
  { store: "canva", title: "45-day free trial of Canva Pro", code: "CANVAPRO45", type: "code", discountLabel: "45-DAY TRIAL", terms: "Extended trial via partner link. New Pro users only.", expiresInDays: 29, isVerified: true, isExclusive: true, sortWeight: 86, clickCount: 866, revealCount: 1290, successReports: 388 },
  { store: "canva", title: "Canva for Education — free for teachers", type: "deal", discountLabel: "FREE", terms: "K-12 teachers and eligible institutions. Verification required.", isVerified: true, clickCount: 340, revealCount: 340, successReports: 260 },
  { store: "canva", title: "20% off Teams annual (5+ seats)", code: "TEAMS20", type: "code", discountLabel: "20% OFF", discountValue: 20, terms: "Minimum five seats billed annually.", expiresInDays: 52, clickCount: 178, revealCount: 269, successReports: 61 },
  // Grammarly
  { store: "grammarly", title: "20% off Grammarly Premium annual", code: "WRITE20", type: "code", discountLabel: "20% OFF", discountValue: 20, terms: "New Premium subscriptions billed annually.", expiresInDays: 24, isVerified: true, sortWeight: 72, clickCount: 534, revealCount: 802, successReports: 217 },
  { store: "grammarly", title: "Free plan with tone detection", type: "deal", discountLabel: "FREE PLAN", terms: "Basic corrections and tone detection, unlimited use.", isVerified: true, clickCount: 410, revealCount: 410, successReports: 305 },
  { store: "grammarly", title: "25% off Business for teams of 10+", code: "BIZ25", type: "code", discountLabel: "25% OFF", discountValue: 25, terms: "Ten seats minimum, first year only.", expiresInDays: -15, clickCount: 67, revealCount: 98, successReports: 12 },
  // Zapier
  { store: "zapier", title: "14-day free trial of Professional", type: "deal", discountLabel: "FREE TRIAL", terms: "Full multi-step zaps and premium apps during trial.", isVerified: true, sortWeight: 58, clickCount: 377, revealCount: 377, successReports: 231 },
  { store: "zapier", title: "15% off annual Professional plan", code: "AUTOMATE15", type: "code", discountLabel: "15% OFF", discountValue: 15, terms: "Annual billing, new subscriptions.", expiresInDays: 36, isVerified: true, clickCount: 246, revealCount: 371, successReports: 89 },
  { store: "zapier", title: "Free plan — 100 tasks a month", type: "deal", discountLabel: "FREE PLAN", terms: "Two-step zaps with popular apps included.", clickCount: 298, revealCount: 298, successReports: 220 },
  // ClickUp
  { store: "clickup", title: "30% off Unlimited annual", code: "CLICK30", type: "code", discountLabel: "30% OFF", discountValue: 30, terms: "New workspaces on the Unlimited plan billed annually.", expiresInDays: 22, isVerified: true, sortWeight: 68, clickCount: 461, revealCount: 688, successReports: 174 },
  { store: "clickup", title: "Free forever plan — 100MB storage", type: "deal", discountLabel: "FREE PLAN", terms: "Unlimited tasks and members on the free tier.", isVerified: true, clickCount: 350, revealCount: 350, successReports: 267 },
  { store: "clickup", title: "15% off Business for nonprofits", code: "GOOD15", type: "code", discountLabel: "15% OFF", discountValue: 15, terms: "Registered nonprofits only; verification required.", expiresInDays: 58, clickCount: 84, revealCount: 129, successReports: 30 },
];

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

async function main() {
  console.log("Wiping existing data...");
  await wipe();

  console.log("Seeding categories...");
  const catRows = await db.insert(categories).values(categorySeed).returning();
  const catBySlug = new Map(catRows.map((c) => [c.slug, c]));

  console.log("Seeding stores...");
  const storeRows = await db
    .insert(stores)
    .values(
      storeSeed.map((s) => ({
        name: s.name,
        slug: s.slug,
        tagline: s.tagline,
        description: s.description,
        websiteUrl: s.websiteUrl,
        // Placeholder: plain website URL until real partner URLs are added
        // through the admin portal.
        affiliateBaseUrl: s.websiteUrl,
        rating: s.rating,
        isFeatured: s.isFeatured ?? false,
        isActive: true,
        seoTitle: `${s.name} Coupons and Promo Codes`,
        seoDescription: `The latest verified ${s.name} coupon codes, deals, and discounts. ${s.tagline}`,
      })),
    )
    .returning();
  const storeBySlug = new Map(storeRows.map((s) => [s.slug, s]));

  await db.insert(storeCategories).values(
    storeSeed.flatMap((s) =>
      s.cats.map((catSlug) => ({
        storeId: storeBySlug.get(s.slug)!.id,
        categoryId: catBySlug.get(catSlug)!.id,
      })),
    ),
  );

  console.log("Seeding coupons...");
  const couponRows = await db
    .insert(coupons)
    .values(
      couponSeed.map((c) => ({
        storeId: storeBySlug.get(c.store)!.id,
        title: c.title,
        code: c.code ?? null,
        type: c.type,
        discountLabel: c.discountLabel,
        discountValue: c.discountValue ?? null,
        terms: c.terms,
        startsAt: days(-30),
        expiresAt: c.expiresInDays !== undefined ? days(c.expiresInDays) : null,
        isVerified: c.isVerified ?? false,
        isExclusive: c.isExclusive ?? false,
        isActive: true,
        clickCount: c.clickCount ?? 0,
        revealCount: c.revealCount ?? 0,
        successReports: c.successReports ?? 0,
        sortWeight: c.sortWeight ?? 0,
      })),
    )
    .returning();

  const couponByTitle = new Map(couponRows.map((c) => [c.title, c]));
  const pick = (title: string) => {
    const c = couponByTitle.get(title);
    if (!c) throw new Error(`Seed coupon not found: ${title}`);
    return c;
  };

  const base44Coupon = pick("30% off your first 3 months of Base44 Pro");
  const lovableCoupon = pick("25% off Lovable Pro for 6 months");
  const sageCoupon = pick("3 months free on Sage Accounting");
  const shopifyDeal = pick("$1/month for your first 3 months");
  const canvaCoupon = pick("45-day free trial of Canva Pro");
  const framerCoupon = pick("25% off Framer Pro annual");

  console.log("Seeding author + posts...");
  const [editor] = await db
    .insert(authors)
    .values({
      name: "Maya Whitfield",
      bio: "Editor at Promopedia. Maya has covered SaaS pricing, AI tooling, and the business of software for eight years, and personally tests every deal before it ships.",
      role: "Senior Editor",
    })
    .returning();

  const postSeed = [
    {
      title: "Best AI app builders in 2026: Base44, Lovable, and the field",
      slug: "best-ai-app-builders-2026",
      excerpt:
        "We built the same production app on six AI app builders and compared output quality, export options, and real monthly cost. Two clear winners emerged.",
      categoryId: catBySlug.get("ai-tools")!.id,
      tags: ["ai", "app-builders", "comparison"],
      readingMinutes: 9,
      publishedAt: days(-4),
      viewCount: 4211,
      relatedStores: ["base44", "lovable", "bubble", "framer"],
      content: doc(
        pt("A year ago, AI app builders produced demos. Today they produce products. We spent three weeks building the same inventory-management app on six platforms, then put each result in front of a working engineer and a working founder. This is what held up."),
        h2("How we tested"),
        bullets([
          "Same spec for every platform: auth, a relational schema, three CRUD views, and one third-party integration.",
          "We measured time to first working version, cost at 1,000 monthly users, and how painful it was to leave.",
          "Every builder was tested on its mid-tier paid plan, not the demo tier.",
        ]),
        h2("Base44: fastest to a real product"),
        pt("Base44 got us to a deployable app in under an hour, and its built-in database and auth meant zero third-party wiring. The generated code stays hidden, which some teams will hate, but the platform's ceiling is far higher than we expected."),
        couponEmbed(base44Coupon.id),
        h2("Lovable: the engineer's choice"),
        pt("Lovable exports clean React and Supabase code you actually own. Iteration is conversational and quick, and the architecture decisions it makes are ones a senior engineer would defend. It costs more once you scale, which makes the coupon below worth grabbing."),
        couponEmbed(lovableCoupon.id),
        promoSlot(),
        h2("The rest of the field"),
        pt("Bubble remains the most mature visual builder with the deepest plugin ecosystem, and Framer wins for marketing sites where design fidelity is everything. Neither generates full applications from a prompt the way the top two do, but both are proven in production."),
        quote("Buy the tool that matches your exit plan: if you will eventually hire engineers, choose a builder that exports code."),
        h2("Verdict"),
        pt("Choose Base44 to validate an idea this week. Choose Lovable if the prototype needs to become the product. Either way, start on a discounted plan — both run promotions that meaningfully cut first-year cost."),
      ),
    },
    {
      title: "Base44 vs Lovable: which AI builder should you commit to?",
      slug: "base44-vs-lovable",
      excerpt:
        "Both promise a full-stack app from a prompt. We compare output quality, pricing, lock-in, and who each one is actually for.",
      categoryId: catBySlug.get("ai-tools")!.id,
      tags: ["base44", "lovable", "head-to-head"],
      readingMinutes: 7,
      publishedAt: days(-9),
      viewCount: 3187,
      relatedStores: ["base44", "lovable"],
      content: doc(
        pt("This is the head-to-head our readers requested most. Both platforms turn natural-language prompts into working software, both ship auth and hosting out of the box, and both charge in the same price band. The differences are in philosophy."),
        h2("Ownership and lock-in"),
        pt("Lovable's killer feature is the export: real React code and a Supabase backend you control. Base44 keeps the stack managed, which is precisely why it's faster — there is simply less to configure. Decide how much that trade matters before you subscribe."),
        h2("Pricing reality check"),
        pt("List prices are close, but active promotions change the math. At the time of writing, both run first-year discounts that stack with annual billing."),
        couponEmbed(base44Coupon.id),
        couponEmbed(lovableCoupon.id),
        h2("Bottom line"),
        pt("Non-technical founder shipping an internal tool or MVP: Base44. Product team that will grow into the codebase: Lovable. Both are the real thing."),
      ),
    },
    {
      title: "How to actually save on SaaS subscriptions in 2026",
      slug: "how-to-save-on-saas-subscriptions",
      excerpt:
        "The average startup wastes 30% of its software budget. Here are the seven levers that reliably cut the bill — with the receipts to prove it.",
      categoryId: catBySlug.get("saas")!.id,
      tags: ["saas", "savings", "guide"],
      readingMinutes: 8,
      publishedAt: days(-15),
      viewCount: 5620,
      relatedStores: ["notion", "zapier", "clickup", "shopify"],
      content: doc(
        pt("Software spend audits consistently find the same thing: a third of the budget buys nothing. Unused seats, forgotten trials, and monthly billing on tools you have used for three years. Here is the playbook we use ourselves."),
        h2("1. Always check for a live code first"),
        pt("It sounds obvious, but the data says fewer than one in five buyers searches for a promo code before checkout on B2B software. Vendors run discounts constantly — they just don't advertise them on the pricing page."),
        promoSlot(),
        h2("2. Switch to annual, but only after the trial"),
        pt("Annual billing saves 15-20% almost everywhere. The mistake is committing before the team has actually adopted the tool. Run the monthly plan for one renewal cycle, then switch."),
        h2("3. Negotiate at renewal, not at signup"),
        pt("Your leverage is highest when the vendor's churn forecast is on the line. A polite email asking for the new-customer rate works more often than you would think."),
        h2("4. Audit seats quarterly"),
        bullets([
          "Export the member list from every tool with per-seat pricing.",
          "Cross-reference against your HR system or org chart.",
          "Downgrade anyone who hasn't logged in for 60 days.",
        ]),
        h2("5. Use the startup programs"),
        pt("Notion, ClickUp, and most infrastructure vendors run startup programs worth thousands. If you raised in the last two years or joined an accelerator, you probably qualify for at least three of them."),
        quote("The cheapest subscription is the one you cancel; the second cheapest is the one you bought with a code."),
        h2("Start here"),
        pt("We maintain a live feed of verified codes across the categories above. Set a calendar reminder to check it before any renewal — five minutes that routinely saves three figures."),
      ),
    },
    {
      title: "Sage UK for small businesses: a practical guide",
      slug: "sage-uk-small-business-guide",
      excerpt:
        "Making Tax Digital made accounting software mandatory for most UK businesses. Here's how to set up Sage properly — and pay less for it.",
      categoryId: catBySlug.get("accounting-finance")!.id,
      tags: ["sage", "accounting", "uk", "guide"],
      readingMinutes: 6,
      publishedAt: days(-22),
      viewCount: 1893,
      relatedStores: ["sage-uk", "quickbooks"],
      content: doc(
        pt("If you run a VAT-registered business in the UK, digital record-keeping is no longer optional. Sage has been the default answer for British small businesses for decades, and its cloud products have finally caught up with that reputation."),
        h2("Which Sage product do you actually need?"),
        bullets([
          "Sage Accounting Start: sole traders and micro businesses that mostly invoice and reconcile.",
          "Sage Accounting Standard: VAT returns, CIS, and multi-user access — the sweet spot for most limited companies.",
          "Sage 50: established businesses with stock, departments, and an accountant who insists on it.",
        ]),
        h2("Setup in an afternoon"),
        pt("Connect your bank feed first — everything else in Sage flows from clean transaction data. Then import your customer list, set your VAT scheme, and let the MTD wizard register the connection with HMRC."),
        couponEmbed(sageCoupon.id),
        h2("What it costs, honestly"),
        pt("Sage's list pricing is mid-market, but the vendor runs aggressive first-year promotions almost continuously. Between the free-months offer above and annual billing, a Standard subscription typically lands under half of list price in year one."),
        h2("The QuickBooks question"),
        pt("QuickBooks is the stronger product for US-style reporting and has a slicker mobile app. Sage wins on UK payroll integration and accountant familiarity. If your accountant already works in Sage, stay in Sage — the collaboration friction is not worth the switch."),
      ),
    },
    {
      title: "The no-code stack we'd build a startup on in 2026",
      slug: "no-code-startup-stack-2026",
      excerpt:
        "Website, product, automations, and back office — a complete startup stack with zero engineers, priced out at real subscription rates.",
      categoryId: catBySlug.get("no-code-app-builders")!.id,
      tags: ["no-code", "stack", "startup"],
      readingMinutes: 7,
      publishedAt: days(-29),
      viewCount: 2764,
      relatedStores: ["webflow", "framer", "bubble", "zapier", "notion"],
      content: doc(
        pt("A two-person team can now ship what took a funded engineering org five years ago. This is the exact stack we would choose today, what it costs monthly, and where the discounts are."),
        h2("Marketing site: Framer or Webflow"),
        pt("Framer gets you from design to published site fastest, and its animation tooling is genuinely superior. Webflow still wins for content-heavy sites where the CMS does the heavy lifting."),
        couponEmbed(framerCoupon.id),
        h2("The product itself: Bubble"),
        pt("For a real application with user accounts and complex logic, Bubble's maturity shows. The plugin ecosystem alone saves weeks."),
        h2("Glue: Zapier"),
        pt("Every no-code stack leaks data between tools; Zapier is the plumbing. Budget for the Professional tier once you pass a handful of automations."),
        promoSlot(),
        h2("Back office: Notion"),
        pt("Docs, CRM-lite, hiring pipeline, investor updates — one workspace, one subscription."),
        h2("Total monthly cost"),
        pt("At list prices this stack runs about $180 a month. With the codes live right now, closer to $120. That is a functioning software company for the price of a phone bill."),
      ),
    },
    {
      title: "Canva Pro is the best money a solo creator can spend — here's why",
      slug: "canva-pro-review-solo-creators",
      excerpt:
        "After a year of daily use, our verdict on Canva Pro: where it replaces a designer, where it doesn't, and how to get the extended trial.",
      categoryId: catBySlug.get("design")!.id,
      tags: ["canva", "design", "review"],
      readingMinutes: 5,
      publishedAt: days(-35),
      viewCount: 2105,
      relatedStores: ["canva", "grammarly"],
      content: doc(
        pt("We resisted the hype for years. Then we tracked how much time one editor spent in Canva over twelve months: eleven hours a week, replacing what used to be three separate tools and one freelance retainer."),
        h2("What Pro actually adds"),
        bullets([
          "Brand kits that keep fonts and colors consistent across everything you export.",
          "Background remover and Magic Resize — the two features that alone justify the price.",
          "The full stock library, which quietly replaces a stock-photo subscription.",
        ]),
        h2("Where it falls short"),
        pt("Complex vector work and true print production still belong in professional tools. Canva's strength is speed at social and marketing formats, not precision."),
        couponEmbed(canvaCoupon.id),
        h2("Verdict"),
        pt("For solo creators and small teams, Pro pays for itself in the first week of each month. Start with the extended trial above and cancel if we're wrong — you won't."),
      ),
    },
  ];

  const postRows = await db
    .insert(posts)
    .values(
      postSeed.map((post) => ({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        contentJson: post.content,
        authorId: editor.id,
        categoryId: post.categoryId,
        tags: post.tags,
        status: "published" as const,
        publishedAt: post.publishedAt,
        readingMinutes: post.readingMinutes,
        viewCount: post.viewCount,
        seoTitle: post.title,
        seoDescription: post.excerpt,
      })),
    )
    .returning();

  const postBySlug = new Map(postRows.map((p) => [p.slug, p]));
  await db.insert(postStores).values(
    postSeed.flatMap((post) =>
      post.relatedStores.map((slug) => ({
        postId: postBySlug.get(post.slug)!.id,
        storeId: storeBySlug.get(slug)!.id,
      })),
    ),
  );

  console.log("Seeding promos...");
  await db.insert(promos).values([
    {
      name: "Sidebar: Base44 exclusive",
      placement: "sidebar",
      type: "coupon-highlight",
      payload: { couponId: base44Coupon.id },
      targetingRules: {},
      isActive: true,
      priority: 10,
    },
    {
      name: "Sticky rail: Shopify $1 offer",
      placement: "sticky-rail",
      type: "coupon-highlight",
      payload: { couponId: shopifyDeal.id },
      targetingRules: { paths: ["/blog", "/stores"] },
      isActive: true,
      priority: 10,
    },
    {
      name: "In-content: Canva extended trial",
      placement: "in-content",
      type: "coupon-highlight",
      payload: { couponId: canvaCoupon.id },
      targetingRules: {},
      isActive: true,
      priority: 10,
    },
    {
      name: "Timed popup: newsletter",
      placement: "popup-timed",
      type: "newsletter",
      payload: {
        title: "The five best deals, every Friday",
        body: "One short email a week with the verified codes worth using. No noise, unsubscribe anytime.",
        ctaLabel: "Subscribe",
      },
      targetingRules: { delayMs: 14_000, frequencyCap: 1, frequencyDays: 7, excludePaths: ["/admin"] },
      isActive: true,
      priority: 5,
    },
    {
      name: "Exit intent: Lovable offer",
      placement: "popup-exit",
      type: "coupon-highlight",
      payload: { couponId: lovableCoupon.id },
      targetingRules: { frequencyCap: 1, frequencyDays: 3, excludePaths: ["/admin"] },
      isActive: true,
      priority: 5,
    },
    {
      name: "Home banner: Sage free months",
      placement: "home-banner",
      type: "coupon-highlight",
      payload: {
        couponId: sageCoupon.id,
        title: "Three months of Sage Accounting, free",
        body: "UK small businesses: start the new tax year on software HMRC actually likes.",
        ctaLabel: "Get the deal",
      },
      targetingRules: { paths: ["/"] },
      isActive: true,
      priority: 10,
    },
  ]);

  console.log("Seeding settings + admin user...");
  await db.insert(settings).values({ id: "singleton" });

  const adminEmail = (
    process.env.ADMIN_EMAIL ?? "admin@promopedia.local"
  ).toLowerCase();
  const adminPassword =
    process.env.ADMIN_PASSWORD ?? randomBytes(9).toString("base64url");
  await db.insert(adminUsers).values({
    email: adminEmail,
    passwordHash: hashPassword(adminPassword),
    name: "Promopedia Admin",
    role: "admin",
  });

  console.log("Seeding a few newsletter subscribers...");
  await db.insert(newsletterSubscribers).values(
    [
      "founder@earlystage.io",
      "ops@brightlane.co",
      "sam@indiehacker.dev",
      "procurement@northbeam.agency",
    ].map((email, i) => ({
      email,
      source: i % 2 === 0 ? "footer" : "popup",
      confirmedAt: days(-i * 3),
    })),
  );

  console.log("");
  console.log("Seed complete.");
  console.log(`  Stores:   ${storeRows.length}`);
  console.log(`  Coupons:  ${couponRows.length}`);
  console.log(`  Posts:    ${postRows.length}`);
  console.log("");
  console.log("Admin login (also set ADMIN_EMAIL / ADMIN_PASSWORD in .env.local):");
  console.log(`  email:    ${adminEmail}`);
  console.log(`  password: ${adminPassword}`);
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
