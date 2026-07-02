export type NewsletterSubscriberStatus = "active" | "unsubscribed";

export type AdminNewsletterSubscriber = {
  id: string;
  email: string;
  source: string;
  status: NewsletterSubscriberStatus;
  subscribedAt: string;
};

export type NewsletterPageData = {
  subscribers: AdminNewsletterSubscriber[];
  totalCount: number;
};
