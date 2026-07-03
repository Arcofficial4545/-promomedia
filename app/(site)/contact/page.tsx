import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ContactForm } from "@/components/marketing/ContactForm";
import { PageHeader } from "@/components/marketing/PageHeader";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Questions, corrections, partnership inquiries, or a dead code to report — get in touch with the Promopedia team.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Get in touch"
        description="Found a dead code, want us to cover a product, or have a partnership question? We read everything."
      />
      <Section>
        <Container size="narrow">
          <ContactForm />
        </Container>
      </Section>
    </>
  );
}
