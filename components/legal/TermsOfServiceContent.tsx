import {
  LegalCallout,
  LegalContactBlock,
  LegalList,
  LegalSection,
} from "@/components/legal/LegalSection";
import { LEGAL_CONTACT } from "@/lib/legal/constants";
import type { LegalTocItem } from "@/lib/legal/constants";

export const termsToc: LegalTocItem[] = [
  { id: "acceptance", label: "Acceptance" },
  { id: "educational-purpose", label: "Educational Purpose" },
  { id: "intellectual-property", label: "Intellectual Property" },
  { id: "research-and-information", label: "Research & Information" },
  { id: "opt-out-letters", label: "Opt Out Letters" },
  { id: "user-conduct", label: "User Conduct" },
  { id: "third-party-links", label: "Third Party Links" },
  { id: "disclaimer", label: "Disclaimer" },
  { id: "limitation-of-liability", label: "Limitation of Liability" },
  { id: "changes", label: "Changes" },
  { id: "contact", label: "Contact" },
];

export function TermsOfServiceContent() {
  return (
    <>
      <LegalSection id="acceptance" title="1. Acceptance">
        <p>
          By accessing or using the Pencils Before Pixels website, you agree to
          these Terms of Service. If you do not agree, please do not use the
          site.
        </p>
        <p>
          These terms apply to all visitors, subscribers, and anyone who uses our
          educational resources or tools, including the Opt Out Letter generator.
        </p>
      </LegalSection>

      <LegalSection id="educational-purpose" title="2. Educational Purpose">
        <p>
          Pencils Before Pixels provides educational information and research to
          help parents make informed decisions about learning, technology, and
          classroom practices.
        </p>
        <LegalCallout>
          This website is not legal advice and is not medical advice.
        </LegalCallout>
        <p>
          Content on this site is meant to inform and support thoughtful
          decision-making. It should not replace guidance from qualified legal,
          medical, or educational professionals when you need personalised
          advice.
        </p>
      </LegalSection>

      <LegalSection id="intellectual-property" title="3. Intellectual Property">
        <p>
          Unless otherwise noted, the following remain the property of Pencils
          Before Pixels:
        </p>
        <LegalList
          items={[
            "Research summaries and editorial content",
            "Graphics, charts, and visual materials",
            "Branding, logos, and design elements",
            "Website layout, structure, and written copy",
          ]}
        />
        <p>
          You may share links to our content and use materials for personal,
          non-commercial purposes. You may not reproduce, republish, or
          redistribute our content for commercial use without written permission.
        </p>
      </LegalSection>

      <LegalSection
        id="research-and-information"
        title="4. Research & Information"
      >
        <p>
          This website presents research and educational information drawn from
          a variety of sources, including academic studies, government reports,
          and published books.
        </p>
        <LegalList
          items={[
            "Readers should review original studies and primary sources when making important decisions.",
            "Research summaries are intended to make complex findings more accessible, not to replace the full context of the original work.",
            "Educational recommendations and interpretations may evolve as new research emerges.",
          ]}
        />
        <p>
          We strive for accuracy and clarity, but we cannot guarantee that every
          summary captures every nuance of the underlying research.
        </p>
      </LegalSection>

      <LegalSection id="opt-out-letters" title="5. Opt Out Letters">
        <p>
          The Opt Out Letter generator provides a template that parents can
          customise and use at their discretion.
        </p>
        <LegalList
          items={[
            "You are responsible for reviewing the letter, confirming it reflects your situation, and submitting it to the appropriate school or district.",
            "Pencils Before Pixels does not send letters on your behalf and does not communicate with schools unless you choose to do so.",
            "We make no guarantee regarding school acceptance, legal sufficiency, or outcome of any opt-out request.",
          ]}
        />
        <p>
          Laws, policies, and procedures vary by school and district. Consider
          consulting a qualified professional if you need legal guidance specific
          to your circumstances.
        </p>
      </LegalSection>

      <LegalSection id="user-conduct" title="6. User Conduct">
        <p>When using this website, you agree not to:</p>
        <LegalList
          items={[
            "Abuse, disrupt, or attempt to interfere with the site or its services",
            "Upload malicious code, spam, or harmful content",
            "Misuse downloadable resources, including letters and research materials, in ways that violate these terms or applicable law",
            "Misrepresent your identity or affiliation when using site features",
          ]}
        />
        <p>
          We reserve the right to restrict access if we believe a user is
          violating these terms or harming the site or its community.
        </p>
      </LegalSection>

      <LegalSection id="third-party-links" title="7. Third Party Links">
        <p>
          This website may link to external resources, including:
        </p>
        <LegalList
          items={[
            "YouTube videos and other media platforms",
            "Publishers and authors",
            "Government reports and data sources",
            "Research organisations and academic institutions",
          ]}
        />
        <p>
          These links are provided for convenience and reference. Pencils Before
          Pixels is not responsible for the content, accuracy, or practices of
          third-party websites or services.
        </p>
      </LegalSection>

      <LegalSection id="disclaimer" title="8. Disclaimer">
        <p>
          Educational resources on this website are provided on an &ldquo;as
          is&rdquo; and &ldquo;as available&rdquo; basis.
        </p>
        <p>
          We do not guarantee specific educational outcomes, school policy
          changes, or results from using any resource or tool on the site. Your
          use of the website and its materials is at your own discretion and
          risk.
        </p>
      </LegalSection>

      <LegalSection
        id="limitation-of-liability"
        title="9. Limitation of Liability"
      >
        <p>
          To the fullest extent permitted by law, Pencils Before Pixels and its
          contributors will not be liable for any indirect, incidental, special,
          or consequential damages arising from your use of the website or its
          resources.
        </p>
        <p>
          This includes, without limitation, damages related to decisions made
          based on site content, use of the Opt Out Letter generator, or
          reliance on research summaries or third-party links.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="10. Changes">
        <p>
          We may update these Terms of Service from time to time. When we do, we
          will revise the &ldquo;Last updated&rdquo; date at the top of this
          page.
        </p>
        <p>
          The latest version will always appear here. Continued use of the
          website after changes are posted means you accept the updated terms.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="11. Contact">
        <p>
          If you have questions about these Terms of Service, please contact us:
        </p>
        <LegalContactBlock
          email={LEGAL_CONTACT.email}
          website={LEGAL_CONTACT.website}
        />
      </LegalSection>
    </>
  );
}
