type AdminPageHeaderProps = {
  title: string;
  description?: string;
};

export function AdminPageHeader({ title, description }: AdminPageHeaderProps) {
  return (
    <header>
      <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-navy-800">
        {title}
      </h1>
      {description ? (
        <p className="mt-1 text-sm text-body-muted">{description}</p>
      ) : null}
    </header>
  );
}
