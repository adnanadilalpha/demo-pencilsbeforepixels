import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

type AdminPlaceholderPageProps = {
  title: string;
  description: string;
};

export function AdminPlaceholderPage({
  title,
  description,
}: AdminPlaceholderPageProps) {
  return (
    <div className="w-full">
      <AdminPageHeader title={title} description={description} />
      <div className="mt-8 rounded-[14px] border border-dashed border-paper-300 bg-white p-8 text-sm text-body-muted">
        This section is coming soon.
      </div>
    </div>
  );
}
