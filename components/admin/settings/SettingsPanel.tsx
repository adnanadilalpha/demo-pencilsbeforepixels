"use client";

type SettingsCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function SettingsCard({ title, description, children }: SettingsCardProps) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-navy-800/8 bg-white">
      <div className="border-b border-navy-800/6 px-5 py-4 sm:px-6">
        <h3 className="text-sm font-semibold text-navy-800">{title}</h3>
        {description ? (
          <p className="mt-1 text-sm text-body-muted">{description}</p>
        ) : null}
      </div>
      <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
    </div>
  );
}

export function SettingsCardStack({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex flex-col gap-3">{children}</div>;
}

export function SettingsFieldGrid({
  children,
  columns = 2,
}: {
  children: React.ReactNode;
  columns?: 1 | 2;
}) {
  return (
    <div
      className={
        columns === 2
          ? "grid gap-5 sm:grid-cols-2 sm:gap-6"
          : "flex flex-col gap-5"
      }
    >
      {children}
    </div>
  );
}
