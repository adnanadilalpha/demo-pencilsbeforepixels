import { NextResponse } from "next/server";
import {
  loadOptOutFormConfig,
  loadOptOutSchools,
  saveOptOutFormConfig,
  saveOptOutSchools,
} from "@/lib/opt-out/config";
import type { OptOutFormConfig, OptOutSchool } from "@/lib/opt-out/types";
import { createClient } from "@/lib/supabase/server";

async function requireAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function GET() {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [schools, config] = await Promise.all([
    loadOptOutSchools(),
    loadOptOutFormConfig(),
  ]);

  return NextResponse.json({ schools, config });
}

export async function PATCH(request: Request) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    schools?: OptOutSchool[];
    config?: OptOutFormConfig;
  };

  try {
    if (body.schools) {
      await saveOptOutSchools(body.schools);
    }

    if (body.config) {
      await saveOptOutFormConfig(body.config);
    }

    const [schools, config] = await Promise.all([
      loadOptOutSchools(),
      loadOptOutFormConfig(),
    ]);

    return NextResponse.json({ schools, config });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save opt-out settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
