export type OptOutSubmissionStatus = "generated" | "downloaded";

export type AdminOptOutSubmission = {
  id: string;
  parentName: string;
  studentName: string | null;
  school: string | null;
  status: OptOutSubmissionStatus;
  generatedAt: string;
  downloadedAt: string | null;
};

export type OptOutPageStats = {
  generatedTotal: number;
  generatedToday: number;
  downloadedTotal: number;
  downloadRate: number;
  thisWeek: number;
  weekDelta: number;
};

export type OptOutPageData = {
  submissions: AdminOptOutSubmission[];
  stats: OptOutPageStats;
};
