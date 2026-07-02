type AdminPageHeaderProps = {
  title: string;
  description?: string;
  actions?: import("react").ReactNode;
};

export function AdminPageHeader({
  title,
  description,
  actions,
}: AdminPageHeaderProps) {
  return (
    <header className={actions ? "flex flex-wrap items-start justify-between gap-4" : undefined}>
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-navy-800">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-body-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </header>
  );
}
