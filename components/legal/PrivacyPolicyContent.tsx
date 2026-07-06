import {
  LegalCallout,
  LegalContactBlock,
  LegalList,
  LegalSection,
} from "@/components/legal/LegalSection";
import { LEGAL_CONTACT } from "@/lib/legal/constants";
import type { LegalTocItem } from "@/lib/legal/constants";

export const privacyToc: LegalTocItem[] = [
  { id: "information-we-collect", label: "Information We Collect" },
  { id: "how-we-use-your-information", label: "How We Use Your Information" },
  { id: "newsletter", label: "Newsletter" },
  { id: "opt-out-letters", label: "Opt Out Letters" },
  { id: "cookies", label: "Cookies" },
  { id: "third-party-services", label: "Third Party Services" },
  { id: "data-security", label: "Data Security" },
  { id: "your-rights", label: "Your Rights" },
  { id: "contact", label: "Contact" },
];

export function PrivacyPolicyContent() {
  return (
    <>
      <LegalSection id="information-we-collect" title="1. Information We Collect">
        <p>
          We collect information you choose to share with us when you use this
          website. That may include:
        </p>
        <LegalList
          items={[
            "Your name",
            "Your email address when you subscribe to our newsletter",
            "Information you enter into the Opt Out Letter generator, such as your child’s name, school, and district",
            "Messages you send through a contact form",
          ]}
        />
        <p>
          We also collect a limited amount of information automatically when you
          visit the site, including:
        </p>
        <LegalList
          items={[
            "Browser type and version",
            "Device and operating system information",
            "Anonymous usage analytics",
            "Cookies and similar technologies",
          ]}
        />
        <p>
          We only collect what we need to operate the site and provide the
          resources parents come here for.
        </p>
      </LegalSection>

      <LegalSection
        id="how-we-use-your-information"
        title="2. How We Use Your Information"
      >
        <p>We use the information we collect to:</p>
        <LegalList
          items={[
            "Deliver the newsletter to subscribers",
            "Improve the website and its educational content",
            "Generate Opt Out Letters you request",
            "Respond to enquiries and support requests",
            "Understand how the website is used through analytics",
          ]}
        />
        <LegalCallout>
          We do not sell your personal information.
        </LegalCallout>
      </LegalSection>

      <LegalSection id="newsletter" title="3. Newsletter">
        <p>
          If you subscribe to our newsletter, we use your email address to send
          updates about research, resources, and news related to Pencils Before
          Pixels.
        </p>
        <LegalList
          items={[
            "You may unsubscribe at any time using the link in any email.",
            "Emails are sent only to people who have subscribed.",
            "We do not send spam or share your email with third parties for marketing.",
          ]}
        />
      </LegalSection>

      <LegalSection id="opt-out-letters" title="4. Opt Out Letters">
        <p>
          The Opt Out Letter generator is one of the most important tools on this
          site. Here is how we handle that information:
        </p>
        <LegalList
          items={[
            "Information you enter is used only to generate the letter you request.",
            "We do not share your letter or personal details with schools, districts, or other third parties unless you choose to send it yourself.",
            "Generated letters remain under your control. You decide whether, when, and how to share them.",
            "We may store letter details securely so you can download or revisit your letter, but we do not use that information for marketing.",
          ]}
        />
      </LegalSection>

      <LegalSection id="cookies" title="5. Cookies">
        <p>
          Cookies are small files stored on your device that help the website
          work properly and give us a better understanding of how it is used.
        </p>
        <LegalList
          items={[
            "Essential cookies that keep core features working",
            "Analytics cookies that help us understand traffic and usage patterns in aggregate",
            "Preference cookies that remember choices you make, where applicable",
          ]}
        />
        <p>
          We use first-party analytics similar to common web analytics tools: a
          persistent device identifier in local storage, page views, and
          approximate location inferred from your connection (country/region/city).
          We do not store your raw IP address in analytics reports. You can
          control cookies through your browser settings. Disabling storage may
          affect how certain parts of the site work.
        </p>
      </LegalSection>

      <LegalSection id="third-party-services" title="6. Third Party Services">
        <p>
          We rely on a small number of trusted services to operate the website.
          These may include:
        </p>
        <LegalList
          items={[
            "YouTube for embedded educational videos",
            "First-party analytics on our own infrastructure (usage and approximate location)",
            "Email and newsletter delivery services",
            "Hosting and infrastructure providers, including Supabase and Vercel",
          ]}
        />
        <p>
          These services may process limited information on our behalf. We choose
          providers that take reasonable steps to protect data, and we encourage
          you to review their privacy policies if you would like more detail.
        </p>
      </LegalSection>

      <LegalSection id="data-security" title="7. Data Security">
        <p>
          We take reasonable measures to protect the information we collect,
          including secure connections, access controls, and careful handling of
          stored data.
        </p>
        <p>
          No method of transmission or storage is completely secure, but we work
          to safeguard your information and review our practices as the site
          evolves.
        </p>
      </LegalSection>

      <LegalSection id="your-rights" title="8. Your Rights">
        <p>Depending on where you live, you may have the right to:</p>
        <LegalList
          items={[
            "Request access to the personal information we hold about you",
            "Ask us to correct inaccurate information",
            "Request deletion of your information, where applicable",
            "Unsubscribe from our newsletter at any time",
          ]}
        />
        <p>
          To exercise any of these rights, contact us using the details below and
          we will respond within a reasonable timeframe.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="9. Contact">
        <p>
          If you have questions about this Privacy Policy or how we handle your
          information, please reach out:
        </p>
        <LegalContactBlock
          email={LEGAL_CONTACT.email}
          website={LEGAL_CONTACT.website}
        />
      </LegalSection>
    </>
  );
}
