import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

type PageHeaderProps = {
  title: React.ReactNode;
  description?: string;
  children?: React.ReactNode;
  meta?: React.ReactNode;
};

/** Consistent page opener: pine band with title, description, optional meta. */
export function PageHeader({ title, description, meta, children }: PageHeaderProps) {
  return (
    <Section tone="pine" padding="tight">
      <Container size="wide">
        {meta}
        <h1 className="max-w-3xl text-h1 font-bold text-white">{title}</h1>
        {description && (
          <p className="mt-3 max-w-2xl text-body-lg text-mint/85">
            {description}
          </p>
        )}
        {children}
      </Container>
    </Section>
  );
}
