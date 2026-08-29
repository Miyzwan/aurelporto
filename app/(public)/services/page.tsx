import { ServiceList } from "@/components/services/ServiceList";
import { Section } from "@/components/public/Section";
import { placeholderServicesPreviewContent } from "@/lib/content/placeholder-home";
import { placeholderServiceDetails } from "@/lib/content/placeholder-pages";

export default function ServicesPage() {
  return (
    <Section eyebrow={placeholderServicesPreviewContent.title}>
      <div className="grid-editorial">
        <h1 className="type-heading desktop:col-span-8 col-span-12">Where the work is focused.</h1>
      </div>

      <div className="mt-16">
        <ServiceList services={placeholderServiceDetails} />
      </div>
    </Section>
  );
}
