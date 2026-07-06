export type OptOutDefaultAnswers = {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
};

export type OptOutSchool = {
  id: string;
  schoolName: string;
  principalName: string;
  email: string;
  sortOrder: number;
};

export type OptOutFormConfig = {
  defaultAnswers: OptOutDefaultAnswers;
  formBTemplatePath: string;
  coverTemplatePath: string;
  essayTemplatePath: string;
};

export type OptOutSignatureMode = "draw" | "name";

export type OptOutLetterForm = {
  date: string;
  studentName: string;
  parentName: string;
  address: string;
  homePhone: string;
  workPhone: string;
  signatureMode: OptOutSignatureMode;
  signatureName: string;
  signatureImage: string;
  schoolId: string;
  schoolName: string;
  principalName: string;
  principalEmail: string;
};

export type OptOutLetterMetrics = {
  pdfDownloads: number;
  docxDownloads: number;
  lastDownloadAt?: string;
  lastDownloadFormat?: "pdf" | "docx";
};

export type OptOutCachedPackages = {
  docx?: string;
  pdf?: string;
};

export type OptOutSubmissionPayload = {
  letter: OptOutLetterForm;
  metrics: OptOutLetterMetrics;
  downloadToken?: string;
  defaultAnswers?: OptOutDefaultAnswers;
  cachedPackages?: OptOutCachedPackages;
};

export function createDefaultForm(): OptOutLetterForm {
  const today = new Date();
  const formatted = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return {
    date: formatted,
    studentName: "",
    parentName: "",
    address: "",
    homePhone: "",
    workPhone: "",
    signatureMode: "name",
    signatureName: "",
    signatureImage: "",
    schoolId: "",
    schoolName: "",
    principalName: "",
    principalEmail: "",
  };
}
