import { ProjectInquiryForm } from "@/components/contact/ProjectInquiryForm";
import { Section } from "@/components/public/Section";
import { placeholderServices } from "@/lib/content/placeholder-home";
import { placeholderInquiryConfig } from "@/lib/content/placeholder-pages";

export default function ContactPage() {
  return (
    <Section eyebrow="Contact">
      <div className="grid-editorial">
        <h1 className="type-heading desktop:col-span-8 col-span-12">Start a conversation.</h1>
      </div>

      <div className="mt-16">
        <ProjectInquiryForm config={placeholderInquiryConfig} services={placeholderServices} />
      </div>
    </Section>
  );
}
