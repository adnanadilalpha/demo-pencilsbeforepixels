export type OptOutLetterForm = {
  date: string;
  studentName: string;
  recipientName: string;
  childName: string;
  parentName: string;
  school: string;
  district: string;
  stateTestName: string;
};

export type OptOutLetterMetrics = {
  pdfDownloads: number;
  docxDownloads: number;
  lastDownloadAt?: string;
  lastDownloadFormat?: "pdf" | "docx";
};

export type OptOutSubmissionPayload = {
  letter: OptOutLetterForm;
  metrics: OptOutLetterMetrics;
  downloadToken?: string;
};

export const DEFAULT_OPT_OUT_FORM: OptOutLetterForm = {
  date: "",
  studentName: "",
  recipientName: "",
  childName: "",
  parentName: "",
  school: "",
  district: "",
  stateTestName: "Nebraska NSCAS",
};

export function createDefaultForm(): OptOutLetterForm {
  const today = new Date();
  const formatted = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return {
    ...DEFAULT_OPT_OUT_FORM,
    date: formatted,
  };
}
