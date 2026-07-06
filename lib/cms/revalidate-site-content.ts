import { revalidatePath, revalidateTag } from "next/cache";

export function revalidateSiteContent() {
  revalidateTag("site-content", "max");
  revalidateTag("evidence-data", "max");
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/nebraska-data");
  revalidatePath("/evidence");
  revalidatePath("/research");
}
