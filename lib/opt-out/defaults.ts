import type { OptOutFormConfig, OptOutSchool } from "@/lib/opt-out/types";

export const DEFAULT_FORM_B_TEMPLATE_PATH = "public/forms/6320R-FORM_B2024.docx";
export const DEFAULT_COVER_TEMPLATE_PATH = "public/forms/Cover Page.docx";
export const DEFAULT_ESSAY_TEMPLATE_PATH = "public/forms/Form B Essay.docx";

export const DEFAULT_FORM_ANSWERS = {
  q1: "I am requesting an excusal for my child from all 1:1 district-issued iPad experiences, pursuant to Nebraska Revised Statute 79-532(c) and Westside Community Schools Regulation 6320R, based on the substantial body of peer-reviewed research and documented evidence set forth below.",
  q2: "",
  q3: "See peer-reviewed research and documented evidence set forth below.",
  q4: "Please provide my child with paper-based materials, including printed textbooks, worksheets, and handwritten assignments in place of all iPad-based experiences.",
} as const;

export const DEFAULT_OPT_OUT_SCHOOLS: OptOutSchool[] = [
  { id: "hillside-elementary", schoolName: "Hillside Elementary", principalName: "Michelle Patterson", email: "patterson.michelle@westside66.net", sortOrder: 1 },
  { id: "loveland-elementary", schoolName: "Loveland Elementary", principalName: "Steph Hornung", email: "hornung.steph@westside66.net", sortOrder: 2 },
  { id: "oakdale-elementary", schoolName: "Oakdale Elementary", principalName: "Glen Jagels", email: "jagels.glen@westside66.net", sortOrder: 3 },
  { id: "paddock-road-elementary", schoolName: "Paddock Road Elementary", principalName: "Quinn Mcguire", email: "mcguire.quinn@westside66.net", sortOrder: 4 },
  { id: "prairie-lane-elementary", schoolName: "Prairie Lane Elementary", principalName: "Belinda Westfall", email: "westfall.belinda@westside66.net", sortOrder: 5 },
  { id: "rockbrook-elementary", schoolName: "Rockbrook Elementary", principalName: "Garret Higginbotham", email: "higginbotham.garret@westside66.net", sortOrder: 6 },
  { id: "sunset-hills-elementary", schoolName: "Sunset Hills Elementary", principalName: "Kira Mcclean", email: "mcclean.kira@westside66.net", sortOrder: 7 },
  { id: "swanson-elementary", schoolName: "Swanson Elementary", principalName: "Jennifer Harr", email: "harr.jennifer@westside66.net", sortOrder: 8 },
  { id: "westbrook-elementary", schoolName: "Westbrook Elementary", principalName: "Brian Stevens", email: "stevens.brian@westside66.net", sortOrder: 9 },
  { id: "westgate-elementary", schoolName: "Westgate Elementary", principalName: "Scott Becker", email: "becker.scott@westside66.net", sortOrder: 10 },
  { id: "underwood-hills-early-learning-center", schoolName: "Underwood Hills Early Learning Center", principalName: "Michelle Avilla", email: "avilla.michelle@westside66.net", sortOrder: 11 },
  { id: "westside-middle-school", schoolName: "Westside Middle School", principalName: "Kimberly Eymann", email: "eymann.kimberly@westside66.net", sortOrder: 12 },
  { id: "westside-high-school", schoolName: "Westside High School", principalName: "Jay Dostal", email: "dostal.jay@westside66.net", sortOrder: 13 },
];

export const DEFAULT_OPT_OUT_FORM_CONFIG: OptOutFormConfig = {
  defaultAnswers: { ...DEFAULT_FORM_ANSWERS },
  formBTemplatePath: DEFAULT_FORM_B_TEMPLATE_PATH,
  coverTemplatePath: DEFAULT_COVER_TEMPLATE_PATH,
  essayTemplatePath: DEFAULT_ESSAY_TEMPLATE_PATH,
};
