import type { ReactNode } from "react";

type LegalSectionProps = {
  id: string;
  title: string;
  children: ReactNode;
};

export function LegalSection({ id, title, children }: LegalSectionProps) {
  return (
    <section
      id={id}
      className="scroll-mt-[calc(var(--header-height)+1rem)] border-t border-paper-300 pt-10 first:border-t-0 first:pt-0 lg:scroll-mt-[calc(var(--header-height)+1.5rem)]"
    >
      <h2 className="font-display text-fluid-display-sm leading-display tracking-[-0.02em] text-navy-800">
        {title}
      </h2>
      <div className="mt-5 flex flex-col gap-4 text-base leading-[1.65] text-body-muted">
        {children}
      </div>
    </section>
  );
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-gold-500">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function LegalCallout({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-md border-l-4 border-gold-500 bg-navy-50 px-4 py-3 font-medium text-navy-800">
      {children}
    </p>
  );
}

export function LegalContactBlock({
  email,
  website,
}: {
  email: string;
  website: string;
}) {
  return (
    <div className="rounded-lg bg-paper-200 px-5 py-4 not-prose">
      <dl className="flex flex-col gap-3 text-base leading-normal">
        <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
          <dt className="shrink-0 font-semibold text-navy-800">Email</dt>
          <dd>
            <a
              href={`mailto:${email}`}
              className="text-navy-600 underline decoration-navy-600/30 underline-offset-2 transition-colors hover:text-gold-500 hover:decoration-gold-500/50"
            >
              {email}
            </a>
          </dd>
        </div>
        <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
          <dt className="shrink-0 font-semibold text-navy-800">Website</dt>
          <dd>
            <a
              href={website}
              className="text-navy-600 underline decoration-navy-600/30 underline-offset-2 transition-colors hover:text-gold-500 hover:decoration-gold-500/50"
            >
              {website.replace(/^https?:\/\//, "")}
            </a>
          </dd>
        </div>
      </dl>
    </div>
  );
}
