import { revalidatePath, revalidateTag } from "next/cache";

export function revalidateSiteContent() {
  revalidateTag("site-content", "max");
  revalidateTag("evidence-data", "max");
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/evidence");
  revalidatePath("/research");
}
