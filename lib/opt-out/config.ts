import "server-only";

import {
  DEFAULT_OPT_OUT_FORM_CONFIG,
  DEFAULT_OPT_OUT_SCHOOLS,
} from "@/lib/opt-out/defaults";
import type { OptOutFormConfig, OptOutSchool } from "@/lib/opt-out/types";
import { createAdminClient } from "@/lib/supabase/admin";

const SCHOOLS_KEY = "opt_out_schools";
const CONFIG_KEY = "opt_out_form_config";

function parseSchools(value: unknown): OptOutSchool[] | null {
  if (!Array.isArray(value)) return null;

  const schools = value
    .map((entry, index) => {
      if (!entry || typeof entry !== "object") return null;
      const row = entry as Record<string, unknown>;
      const schoolName = String(row.schoolName ?? "").trim();
      const principalName = String(row.principalName ?? "").trim();
      const email = String(row.email ?? "").trim();
      if (!schoolName || !principalName || !email) return null;

      const id =
        String(row.id ?? "").trim() ||
        schoolName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      return {
        id,
        schoolName,
        principalName,
        email,
        sortOrder: Number(row.sortOrder ?? index + 1),
      } satisfies OptOutSchool;
    })
    .filter((school): school is OptOutSchool => school !== null);

  return schools.length > 0 ? schools : null;
}

function parseConfig(value: unknown): OptOutFormConfig | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const answers = row.defaultAnswers;

  if (!answers || typeof answers !== "object") return null;
  const answerRow = answers as Record<string, unknown>;

  const q1 = String(answerRow.q1 ?? "").trim();
  const q2 = String(answerRow.q2 ?? "").trim();
  const q3 = String(answerRow.q3 ?? "").trim();
  const q4 = String(answerRow.q4 ?? "").trim();

  if (!q1 || !q3 || !q4) return null;

  return {
    defaultAnswers: {
      q1,
      q2: String(answerRow.q2 ?? "").trim(),
      q3,
      q4,
    },
    formBTemplatePath:
      String(row.formBTemplatePath ?? DEFAULT_OPT_OUT_FORM_CONFIG.formBTemplatePath),
    coverTemplatePath:
      String(row.coverTemplatePath ?? DEFAULT_OPT_OUT_FORM_CONFIG.coverTemplatePath),
    essayTemplatePath:
      String(row.essayTemplatePath ?? DEFAULT_OPT_OUT_FORM_CONFIG.essayTemplatePath),
  };
}

export async function loadOptOutSchools(): Promise<OptOutSchool[]> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", SCHOOLS_KEY)
      .maybeSingle();

    return parseSchools(data?.value) ?? DEFAULT_OPT_OUT_SCHOOLS;
  } catch {
    return DEFAULT_OPT_OUT_SCHOOLS;
  }
}

export async function loadOptOutFormConfig(): Promise<OptOutFormConfig> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", CONFIG_KEY)
      .maybeSingle();

    return parseConfig(data?.value) ?? DEFAULT_OPT_OUT_FORM_CONFIG;
  } catch {
    return DEFAULT_OPT_OUT_FORM_CONFIG;
  }
}

export async function saveOptOutSchools(schools: OptOutSchool[]) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("site_settings").upsert(
    { key: SCHOOLS_KEY, value: schools },
    { onConflict: "key" },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function saveOptOutFormConfig(config: OptOutFormConfig) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("site_settings").upsert(
    { key: CONFIG_KEY, value: config },
    { onConflict: "key" },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export function findOptOutSchool(
  schools: OptOutSchool[],
  schoolId: string,
): OptOutSchool | undefined {
  return schools.find((school) => school.id === schoolId);
}
